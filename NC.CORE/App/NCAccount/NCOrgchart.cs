using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Dapper;
using NC.CORE.Context;
using NC.CORE.Log;

namespace NC.CORE.App.NCAccount
{
    public class NCOrgchart
    {
        private NCContext _context = new NCContext();
        public NCOrgchart(NCContext context)
        {
            this. _context = context;
        }
        public IEnumerable<dynamic> list(int parentid = 0)
        {
            var rows = this._context._db.Select("nc_core_orgchart");
            return rows;
        }

        //4. get user have orgchart id
        public long getUserCount(long orgId)
        {
            var rs = 0;

            try
            {
                var tmp = _context._db._conn.Query("select count(id) as Num from nc_core_user_orgchart group by orgchart_id having orgchart_id="+orgId);
                rs = tmp.First().Num;
            }
            catch (Exception e)
            {
                rs = -1;
                NCLogger.Debug("NCOrgchart - getUserCount:" + e.Message);
            }
            return rs;
        }

        //5. get user list in role
        public dynamic getUserList(long orgId)
        {
            return _context._db.Select("nc_core_user_orgchart", select: "user_id", filter: "orgchart_id=" + orgId);
        }

        //6. get orgchart with user count
        public dynamic getOrgchartAndCountUser()
        {
            return _context._db.Select("nc_core_orgchart", select: "*,(select count(id) from nc_core_user_orgchart where orgchart_id=nc_core_orgchart.id) as NumUser");
        }
        public Dictionary<string,string> getOrgchartByUser(string userid)
        {
            string sql = "select id,org_name from nc_core_orgchart where  id in(select orgchart_id from nc_core_user_orgchart where user_id="+userid+") order by parent_id asc";
            var d= _context._db._conn.Query(sql).ToDictionary(row => (string)row.org_name, row => (string)row.id);
            return d;
        }
        public List<dynamic> getOrgchartActive()
        {
            string parent_id_str = "";
            string sql = "select id,org_name,parent_id,0 as mlevel from nc_core_orgchart where  _active=1 and _deleted=0 and (parent_id=0 or parent_id is null)order by id asc";
            var rows = _context._db._conn.Query(sql).ToList();
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
                sql = "select id,org_name,parent_id,(" + item.mlevel + "+1) as mlevel from nc_core_orgchart where  _active=1 and _deleted=0 " + parent_id_str;
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
        public bool checkUserOrgchart(string userid,string orgid)
        {
            List<string> rows = this._context._db.getValueByColumn("nc_core_user_orgchart", "orgchart_id", "user_id", userid);
            foreach(string r in rows)
            {
                if (r == orgid)
                    return true;
            }
            return false;
        }
    }
}
