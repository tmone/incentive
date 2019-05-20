using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Dapper;
using NC.CORE.Context;
using NC.CORE.Log;
namespace NC.CORE.App.Asset
{
    public class NCAsset
    {
        private NCContext _context = new NCContext();
        public NCAsset(NCContext context)
        {
            this._context = context;
        }

        public long clearGroupOrder(long group_id)
        {
            return clearGroupOrder(group_id.ToString());
        }
        public long clearGroupOrder(string group_id)
        {
            long rs = 0;

            try
            {
                rs = this._context._db.DeleteEmpty("nc_asset_property_group_order", "group_id=" + group_id);
            }
            catch (Exception e)
            {
                rs = -1;
                NCLogger.Debug("NCAsset - ClearGroupOrder: " + e.Message);
            }

            return rs;
        } 
        public long clearRef(string group_id, string group_ref_id)
        {
            long rs = 0;

            try
            {
                rs = this._context._db.DeleteEmpty("nc_asset_property_ref", "group_id=" + group_id +" and group_ref_id="+group_ref_id);
            }
            catch (Exception e)
            {
                rs = -1;
                NCLogger.Debug("NCAsset - ClearGroupOrder: " + e.Message);
            }

            return rs;
        }
        public long clearRef(long group_id, long group_ref_id)
        {
            return clearRef(group_id.ToString(), group_ref_id.ToString());
        }

        public dynamic getOrderGroup(long groupId)
        {
            return _context._db._conn.Query<dynamic>("select a.*, b._active as ACT from [dbo].[nc_asset_property_group] a left join [dbo].[nc_asset_property_group_order] b on a.id = b.group_ref_id and b.group_id = " + groupId +" where a.id <> " + groupId + " order by b.[order], a.[order]");
        }

        public dynamic getOnHoldStore(long id)
        {

            
            var lst = _context._db.Select("nc_asset_store",select:"item_id as id,item_id,quantity,unit_id,store_id", filter: "quantity>0 and store_id = "+id);
            var list = new List<dynamic>();
            foreach(var r in lst)
            {
                
                list.Add(mergeAssetValue(r.id, r,1));
            }
            

            return list;

        }

        public dynamic getRefGroup(string group_id, string group_ref_id)
        {
            //select b.*, a.visible as selected from	[dbo].[nc_asset_property_detail] b left join [dbo].[nc_asset_property_ref] a on b.id = a.property_id where a.group_ref_id = 4 and a.group_id = 12 order by a.[order], b.[order]
            return _context._db._conn.Query<dynamic>("select b.*, a.visible as selected from [dbo].[nc_asset_property_detail] b left join [dbo].[nc_asset_property_ref] a on b.id = a.property_id  and a.group_id = " + group_id + "  where b.group_id = " + group_ref_id+ "order by a.[order], b.[order]");
        }

        public dynamic getColumnGroup(string group_id)
        {
            String varname1 = "";
            varname1 = varname1 + "select	c.group_name, a.* " + "\n";
            varname1 = varname1 + "from	[dbo].[nc_asset_property_detail] a " + "\n";
            varname1 = varname1 + "		join " + "\n";
            varname1 = varname1 + "		[dbo].[nc_asset_property_group] c " + "\n";
            varname1 = varname1 + "		on " + "\n";
            varname1 = varname1 + "		a.group_id = c.id " + "\n";
            varname1 = varname1 + "		left join " + "\n";
            varname1 = varname1 + "		[dbo].[nc_asset_property_ref] b " + "\n";
            varname1 = varname1 + "		on a.id = b.property_id " + "\n";
            varname1 = varname1 + "		and b.group_id = @groupId " + "\n";
            varname1 = varname1 + "		left join " + "\n";
            varname1 = varname1 + "		[dbo].[nc_asset_property_group_order] d " + "\n";
            varname1 = varname1 + "		on c.id = d.group_id " + "\n";
            varname1 = varname1 + "where	a.group_id = @groupId " + "\n";
            varname1 = varname1 + "		or " + "\n";
            varname1 = varname1 + "		a.id in (select property_id from [dbo].[nc_asset_property_ref] b where b.group_id = @groupId and b.visible = 1) " + "\n";
            varname1 = varname1 + "		or " + "\n";
            varname1 = varname1 + "		a.system = 1 " + "\n";
            varname1 = varname1 + "		or " + "\n";
            varname1 = varname1 + "		a.group_id in (select id from [dbo].[nc_asset_property_group] c where c.system = 1) " + "\n";
            varname1 = varname1 + "order by " + "\n";
            varname1 = varname1 + "		d.[order], " + "\n";
            varname1 = varname1 + "		c.[order], " + "\n";
            varname1 = varname1 + "		c.[id], " + "\n";
            varname1 = varname1 + "		b.[order], " + "\n";
            varname1 = varname1 + "		a.[order], " + "\n";
            varname1 = varname1 + "		a.[id]";

            return _context._db._conn.Query<dynamic>(varname1,new {groupId = group_id });
        }

        public dynamic getColumnGroup(string group_id, string filter)
        {
            
            String varname1 = "";
            varname1 = varname1 + "select	c.group_name,a.id, a.property_name " + "\n";
            varname1 = varname1 + "from	[dbo].[nc_asset_property_detail] a " + "\n";
            varname1 = varname1 + "		join " + "\n";
            varname1 = varname1 + "		[dbo].[nc_asset_property_group] c " + "\n";
            varname1 = varname1 + "		on " + "\n";
            varname1 = varname1 + "		a.group_id = c.id " + "\n";
            varname1 = varname1 + "     and a." + filter + "\n";
            varname1 = varname1 + "		left join " + "\n";
            varname1 = varname1 + "		[dbo].[nc_asset_property_ref] b " + "\n";
            varname1 = varname1 + "		on a.id = b.property_id " + "\n";
            varname1 = varname1 + "		and b.group_id = @groupId " + "\n";
            varname1 = varname1 + "		left join " + "\n";
            varname1 = varname1 + "		[dbo].[nc_asset_property_group_order] d " + "\n";
            varname1 = varname1 + "		on c.id = d.group_id " + "\n";
            varname1 = varname1 + "where	a.group_id = @groupId " + "\n";
            varname1 = varname1 + "		or " + "\n";
            varname1 = varname1 + "		a.id in (select property_id from [dbo].[nc_asset_property_ref] b where b.group_id = @groupId and b.visible = 1) " + "\n";
            varname1 = varname1 + "		or " + "\n";
            varname1 = varname1 + "		a.system = 1 " + "\n";
            varname1 = varname1 + "		or " + "\n";
            varname1 = varname1 + "		a.group_id in (select id from [dbo].[nc_asset_property_group] c where c.system = 1) " + "\n";
            varname1 = varname1 + "order by " + "\n";
            varname1 = varname1 + "		d.[order], " + "\n";
            varname1 = varname1 + "		c.[order], " + "\n";
            varname1 = varname1 + "		c.[id], " + "\n";
            varname1 = varname1 + "		b.[order], " + "\n";
            varname1 = varname1 + "		a.[order], " + "\n";
            varname1 = varname1 + "		a.[id]";

            return _context._db._conn.Query<dynamic>(varname1, new { groupId = group_id });
        }

        public dynamic getAvaliableColumn()
        {
            String varname1 = "";
            varname1 = varname1 + "select * " + "\n";
            varname1 = varname1 + "from [dbo].[nc_asset_property_detail] " + "\n";
            varname1 = varname1 + "where _active = 1 and _deleted = 0 and " + "\n";
            varname1 = varname1 + "id in (select distinct property_id from [dbo].[nc_asset_property_data] where _active = 1 and _deleted = 0) " + "\n";
            varname1 = varname1 + "order by ISNULL([order],999999)";

            return _context._db._conn.Query<dynamic>(varname1);

        }

        public dynamic getMainGroup(int itemId)
        {
            String varname1 = "";
            varname1 = varname1 + "select b.group_id " + "\n";
            varname1 = varname1 + "from " + "\n";
            varname1 = varname1 + "	[dbo].[nc_asset_item] a " + "\n";
            varname1 = varname1 + "	join " + "\n";
            varname1 = varname1 + "	[dbo].[nc_asset_category] b " + "\n";
            varname1 = varname1 + "	on a.cate_id = b.id " + "\n";
            varname1 = varname1 + "where a.id = @item_id";
            return _context._db._conn.Query<int>(varname1, new { item_id = itemId }).FirstOrDefault();
        }

        public dynamic getMainCate(int cateId)
        {
            return _context._db.getFirstValueByColumn("nc_asset_category", "group_id", "id", cateId.ToString());
                //_context._db._conn.Query<int>("select a.group_id from [dbo].[nc_asset_category] a where a.id = @cate_id", new { cate_id = cateId }).FirstOrDefault();
            
        }

        public long clearValue(long itemId)
        {
           return  clearValue(itemId.ToString());
        }

        public long clearValue(string itemId)
        {
            long rs = 0;

            rs = _context._db.DeleteEmpty("nc_asset_property_data", "item_id=" + itemId);
            
            return rs;
        }
        public dynamic getAllitemValue()
        {
            return getAllItemData();
                //_context._db.ExecuteQuery("[dbo].[nc_asset_getAllItemValue]");
        }
        public dynamic getAllitemStore()
        {
            return getAllItemDataInStore();
                //_context._db.ExecuteQuery("[dbo].[nc_asset_getAllItemStore]");
        }
        public dynamic getItemValue(dynamic id, int type = 0)
        {
            return getItemValue(type,(int)id);
        }
        public dynamic getItemValue(int id, int type = 0)
        {
            return ((IEnumerable<dynamic>)getAllItemData(type, id: id)).FirstOrDefault();
                //_context._db._conn.Query("[dbo].[nc_asset_getItemValue]", new { id=id},commandType:CommandType.StoredProcedure).FirstOrDefault();
            //[dbo].[gettemValue] @id = 11
        }

        public dynamic mergeAssetValue(int id, dynamic obj, int type = 0)
        {
            
            var at = obj as IDictionary<string, Object>;
            var allvl = ((IDictionary<string, object>)getItemValue(id,type)).ToDictionary(x=>x.Key,x=>x.Value);
            if (allvl != null)
            {
                
                foreach(var a in allvl)
                {
                    if (at.Where(x => x.Key.ToUpper() == a.Key.ToUpper()).Count() > 0)
                        at.Add(a.Key + '_', a.Value);
                    else
                        at.Add(a.Key, a.Value);
                }
            }
            return at;
        }
        public dynamic updateStore()
        {
            return _context._db.ExecuteQuery("[dbo].[nc_asset_UpdateStore]");
        }
        public dynamic getAllItemInCategory(int cateId, List<int> column)
        {
            return getAllItemData(filter: "cate_id = " + cateId);
                //_context._db._conn.Query("[dbo].[nc_asset_getAllItemCategory]", new { cateId = cateId }, commandType: CommandType.StoredProcedure);
        }
        public dynamic getInputSetting(long itemID)
        {
            var cat = _context._db.Select("nc_asset_item", (int)itemID).FirstOrDefault();
            var cid = 0;
            if (cat != null)
            {
                cid = cat.cate_id;
            }
            return _context._db.Select("nc_asset_category_setting", filter: "cate_id=" + cid);
        }

        public dynamic getAvaliableProperty()
        {
            return _context._db.Select("nc_asset_property_detail", filter: "id in(select distinct a.property_id from nc_asset_property_data a left join nc_asset_item b on a.item_id = b.id where a._deleted = 0 and a._active = 1 and b._deleted = 0 and b._active = 1)");
        }
        public dynamic getAllItemData(int type = 0, int id = 0,String filter = "")
        {
            var rs = new List<dynamic>();

            var org = _context._db.Select("nc_asset_item",id,filter:filter);

            //var pro = getAvaliableProperty();

            foreach(var li in org)
            {
                var tmp = new Dictionary<string, Object>();
                tmp.Add("id", li.id);
                tmp.Add("cate_id", li.cate_id);
                tmp.Add("state_id", getStateId(li.id));
                tmp.Add("parent_id", li.parent_id);
                var vlList = _context._db.Select("nc_asset_property_data", select: "property_id,(select property_name from nc_asset_property_detail where id = property_id) as property_name ,[value]", filter: "item_id = " + li.id);

                foreach(var lo in vlList)
                {
                    
                    if (type == 0)
                    {
                        tmp.Add("_"+lo.property_id, lo.value);
                    }else if (type == 1)
                        tmp.Add(lo.property_name, lo.value);
                    else
                    {
                        tmp.Add("_"+lo.property_id, lo.value);
                        tmp.Add(lo.property_name, lo.value);
                    }                        
                }
                rs.Add(tmp);
            }
            return rs;
        }
        public dynamic getValueProperty(int id, int pid)
        {
            var vl = _context._db.Select("nc_asset_property_data", select: "[value]", filter: String.Format("item_id={0} and property_id ={1}", id, pid)).FirstOrDefault();
            if (vl != null)
            {
                return vl.value;
            }
            return null;
        }
        public dynamic getAllItemDataInStore(int type = 0, String filter = "")
        {
            var rs = new List<dynamic>();

            var fil = filter;
            if (fil.Length > 0)
                fil = fil + " and ";
            fil = fil + " (quantity>0)";
            var org = _context._db.Select("nc_asset_store", filter: fil );

            //var pro = getAvaliableProperty();

            foreach (var li in org)
            {
                var tmp = new Dictionary<string, Object>();
                
                foreach(var m in li)
                {
                    tmp.Add(m.Key, m.Value);                    
                } 

                tmp["id"] = li.item_id;
                IEnumerable<dynamic> vlList = getAllItemData(type:type, id: li.item_id);
                    //_context._db.Select("nc_asset_property_data", select: "property_id,(select property_name from nc_asset_property_detail where id = property_id) as property_name ,[value]", filter: "item_id = " + li.id);
                   
                foreach (var lo in vlList.FirstOrDefault())
                {
                    if(tmp.Where(x=>x.Key.ToUpper() == lo.Key.ToUpper()).Count() > 0)
                    {
                        tmp[lo.Key] = lo.Value;
                    }else
                        tmp.Add(lo.Key, lo.Value);
                }
                rs.Add(tmp);
            }
            return rs;
        }
        public dynamic getStateId(int id)
        {
            return _context._db.Select("nc_asset_state_item", select: "state_id", filter: String.Format("id = (select max(id) from [nc_asset_state_item] where item_id = {0})", id)).FirstOrDefault();
        }
        public dynamic getDefaultState(int cid)
        {
            return _context._db.Select("nc_asset_category", cid, select: "state_id").FirstOrDefault();
        }
        public dynamic getProperty(int id)
        {
            return _context._db.Select("nc_asset_property_detail", id).FirstOrDefault();
        }
        public dynamic getChildCate(int id)
        {
            return _context._db.Select("nc_asset_category", select: "id",filter: "parent_id = "+id+ " and _active = 1");
        }
    }
}
