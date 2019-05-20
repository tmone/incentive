using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Dapper;
using NC.CORE.Model;
using NC.CORE.Log;
using NC.CORE.Context;

namespace NC.CORE.App.System
{
    public class NCPage
    {
        private NCContext _context = new NCContext();

        public NCPage(NCContext context)
        {
            this._context = context;
        }
        //1. check user & role
        public bool checkAccessRightByUserID(string userid,string pageid)
        {
            if (userid == "")
                userid = "-1";//DEBUG MODE
            string sql = "select pageid from nc_sc_menu a,nc_sc_menu_user b " +
                                " where a.id = b.menu_id and b.[allow]=1 "+
	                            " and a._active=1 and b.user_id= "+ userid +" "+
                                " and pageid not in(select pageid from nc_sc_menu a, nc_sc_menu_user b " +
                                "  where a.id= b.menu_id and b.[deny]= 1) and pageid=" +pageid+
                        " union all " +
                        " select pageid from nc_sc_menu a,nc_sc_menu_role b "+
                                  " where a.id=b.menu_id and b.[allow]= 1 and a._active= 1 "+
                                    " and role_id in (select role_id from nc_core_user_role where user_id= "+ userid +") "+
                                " and pageid not in(select pageid from nc_sc_menu a, nc_sc_menu_user b "+
                                " where a.id=b.menu_id and b.[deny]=1) and pageid="+pageid;
            NCLogger.Error(sql);
            var row = this._context._db._conn.ExecuteScalar(sql);
            if (row == null)
                return false;
            if (row.ToString() == pageid)
                return true;
            return false;

        }
       public string loadPageLayout(string pageid)
        {
            return this._context._db.getValueByID("nc_sc_page", "container", pageid);
        }
        public List<string> getPostionInPage(string page_id)
        {
            List<string> p = new List<string>();
            p = this._context._db._conn.Query<string>("select distinct postion  from nc_sc_page_craft where page_id=" + page_id).ToList();
            return p;
        }
        public long getDefaultPage()
        {
            return Int64.Parse(this._context._db.getFirstValueByColumn("nc_sc_menu", "pageid", "home", "1"));
        }
        public string getPageTitle(long id)
        {
            return this._context._db.getValueByID("nc_sc_page", "page_title", id.ToString());
        }
    }
}
