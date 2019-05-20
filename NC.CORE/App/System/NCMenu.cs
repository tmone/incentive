using System.Collections.Generic;
using Dapper;
using NC.CORE.Context;
using NC.CORE.Encrypt;
using System.Linq;
using NC.CORE.Language;
using NC.CORE.Log;
using System;

namespace NC.CORE.App.System
{
    public class NCMenu
    {
        private NCContext _context = new NCContext();

        public NCMenu(NCContext context)
        {
            this._context = context;
        }
        //get Menu by User ID
        public List<dynamic> getMenuByUserID(string userid, string parent_id = "")
        {
            if (userid == "")
                userid = "-1";//DEBUG Mode
            string parent_id_str = (parent_id == "") ? "and a.parent_id=0" : " and a.parent_id=" + parent_id;
            string sql = "";
            string column_select = " * ";
            string column_join = "";
            NCLanguage lang = new NCLanguage(this._context);
            string lang_name = lang.getLangDefault();
            if (lang.getCurrentLanguage() != lang_name)
            {
                column_select = " temp.id,f.lang_value as title,pageid,parent_id,[order],icon,_actived,mlevel ";
                column_join = ",nc_core_language_table_content f,nc_core_language g where temp.id = f.ref_id and f.lang_id=g.id and lang_short_name='" + lang_name + "' ";
            }
            sql = "select " + column_select + " from (";
            sql += "    select a.*, 0 as mlevel from nc_sc_menu a, nc_sc_menu_user b ";
            sql += "     where a.id = b.menu_id and b.allow = 1 and a.id not in(select menu_id from nc_sc_menu_user where [deny] = 1) ";
            sql += "           and b.user_id = " + userid + parent_id_str;
            sql += "    UNION ";
            sql += "   select a.*,0 as mlevel from nc_sc_menu a,nc_sc_menu_role b, nc_core_user_role c ";
            sql += "     where a.id = b.menu_id and b.role_id = c.role_id and b.allow = 1 ";
            sql += "         and  a.id not in(select menu_id from nc_sc_menu_role where[deny] = 1) ";
            sql += "        and c.user_id = " + userid + parent_id_str + " and c.role_id in(select role_id from nc_core_user_role where user_id = " + userid + ") ";
            sql += "    ) temp " + column_join;
            sql += "    order by[order],parent_id asc";
            //NCLogger.Error(sql);
            //get menus top level
            var rows = this._context._db._conn.Query(sql).ToList();
            var s = new Stack<dynamic>(rows);
            //result for return
            List<dynamic> m = new List<dynamic>();
            //
            while (s.Count > 0)
            {
                //store menu in result data
                var item = s.Pop();
                m.Add(item);
                //keep parentID
                parent_id_str = " and parent_id=" + item.id;
                sql = "select " + column_select + " from (";
                sql += "    select a.*, (" + item.mlevel + "+1) as mlevel from nc_sc_menu a, nc_sc_menu_user b ";
                sql += "     where a.id = b.menu_id and b.allow = 1 and a.id not in(select menu_id from nc_sc_menu_user where [deny] = 1) ";
                sql += "           and b.user_id = " + userid + parent_id_str;
                sql += "    UNION ";
                sql += "   select a.*,(" + item.mlevel + "+1) as mlevel from nc_sc_menu a,nc_sc_menu_role b, nc_core_user_role c ";
                sql += "     where a.id = b.menu_id and b.role_id = c.role_id and b.allow = 1 ";
                sql += "         and  a.id not in(select menu_id from nc_sc_menu_role where[deny] = 1) ";
                sql += "        and c.user_id = " + userid + parent_id_str + " and c.role_id in(select role_id from nc_core_user_role where user_id = " + userid + ") ";
                sql += "    ) temp " + column_join;
                sql += "    order by[order],parent_id asc";
                var row_childs = this._context._db._conn.Query(sql).ToList();
                //if menu has child, add childs to Main Queue
                if (row_childs.Count > 0)
                {
                    foreach (var rc in row_childs)
                    {
                        s.Push(rc);
                    }
                }

            }
            return m;
        }
        
        //get user by menuId
        public dynamic getUserByMenuId(long menuId)
        {
            return _context._db.Select("nc_sc_menu_user", filter: "menu_id=" + menuId);
        }
        public long clearUserByMenuId(long menuId)
        {
            return clearUserByMenuId( menuId.ToString());
        }
        public long clearRoleByMenuId(long menuId)
        {
            return clearRoleByMenuId(menuId.ToString());
        }
        public long clearUserByMenuId(string menuId)
        {
            return _context._db.DeleteEmpty("nc_sc_menu_user", "menu_id=" + menuId);
        }
        public long clearRoleByMenuId(string menuId)
        {
            return _context._db.DeleteEmpty("nc_sc_menu_role", "menu_id=" + menuId);
        }
        public long clearHome()
        {
            long rs = 0;
            try
            {
                var tmp = new Dictionary<string, string>();
                tmp.Add("home", "0");
                var rrs = _context._db.UpdateByColumn("nc_sc_menu", tmp, "home", "1");
                if (rrs)
                    rs = 1;
            }
            catch (Exception e)
            {
                rs = -1;
                NCLogger.Debug("NCMenu - clearHome:" + e.Message);
            }
            return rs;
        }
        public long setHome(long menuId)
        {
            long rs = 0;
            try
            {
                var tmp = new Dictionary<string, string>();
                tmp.Add("home", "1");                
                var rrs = _context._db.UpdateByColumn("nc_sc_menu", tmp, "id", menuId.ToString());
                if (rrs)
                    rs = 1;
            }
            catch (Exception e)
            {
                rs = -1;
                NCLogger.Debug("NCMenu - setHome:" + e.Message);
            }
            return rs;
        }

    }
}
