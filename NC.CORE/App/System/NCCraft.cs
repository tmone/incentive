using System;
using System.Collections.Generic;
using System.Linq;
using Dapper;
using NC.CORE.Context;
using NC.CORE.Log;
namespace NC.CORE.App.System
{
    public class NCCraft
    {
        private NCContext _context = new NCContext();
        public NCCraft(NCContext context)
        {
            this._context = context;
        }
        public List<dynamic> getCraftByPostionPage(string page_id,string postion)
        {
            var sql = "select * from nc_sc_craft a,nc_sc_page_craft b where a.id=b.craft_id and page_id="+page_id+" and  postion='"+postion+"'";
            NCLogger.Debug(sql);
            return this._context._db._conn.Query(sql).ToList();
        }
        //public checkAccessRight()
        //{

        //}
        public dynamic getCraftOfApp(long appId)
        {
            return getCraftOfApp(appId.ToString());
        }
        public dynamic getCraftOfApp(string appId)
        {
            return _context._db.Select("nc_sc_craft", filter: "app_id=" + appId);
        }

        public dynamic getCraftCanPage(long pageId)
        {
            dynamic tmp = null;
            var appId = _context._db.getFirstValueByColumn("nc_sc_page", "app_id", "id", pageId.ToString());
            if(appId!=null && appId != "")
            {
                tmp = getCraftOfApp(appId);
            }
            return tmp;
        }
        public List<string> getACL(long page_id,long user_id)
        {
            string sql = "select name from nc_sc_craft_action_callback where id in( ";
            sql += " select craft_action_callback_id from nc_sc_page_craft_action_callback_role ";
            sql += " where role_id in(select role_id from nc_core_user_role where user_id = "+user_id.ToString()+") ";
            sql += "     and allow = 1 ";
            sql += "     and page_id = "+ page_id;
            sql += "     and id not in(select id from nc_sc_page_craft_action_callback_role where[deny] = 1 and page_id ="+page_id.ToString()+") ";
            sql += " union ";
            sql += "  select craft_action_callback_id from nc_sc_page_craft_action_callback_user "; ;
            sql += "   where allow = 1 and user_id = "+user_id.ToString();
            sql += "       and page_id =  "+page_id.ToString();
            sql += "        and id not in(select id from nc_sc_page_craft_action_callback_user where[deny] = 1 and page_id = "+page_id.ToString()+" and user_id = "+user_id+")  ";
            sql += "    ) ";
            NCLogger.Debug("ACL:"+sql);
            return this._context._db._conn.Query<string>(sql).ToList();
        }
        public long clearCraft(long pageId)
        {
            long rs = 0;
            try
            {
                rs = this._context._db.DeleteEmpty("nc_sc_page_craft", "page_id=" + pageId);
            }
            catch (Exception e)
            {
                rs = -1;
                NCLogger.Debug("NCCraft - clearCraft:" + e.Message);
            }
            return rs;
        }
        public long updateCraft(long pageId, string listCraft)
        {
            long rs = 0;
            try
            {
                rs = clearCraft(pageId);
                var list = listCraft.Split(',');
                foreach (var li in list)
                {
                    var n = long.Parse(li);
                    if (n > 0)
                    {
                        var cl = new Dictionary<string, string>();
                        cl.Add("page_id", pageId.ToString());
                        cl.Add("craft_id", li);
                        cl.Add("postion", "{{==pagePost:" + li + "==}}");
                        this._context._db.Insert("nc_sc_page_craft", cl);
                        rs++;
                    }
                }
            }
            catch (Exception e)
            {
                rs = -1;
                NCLogger.Debug("NCCraft - updateCraft:" + e.Message);
            }
            return rs;
        }
    }
}
