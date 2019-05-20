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
    public class NCRole
    {
        private NCContext _context = new NCContext();
        public NCRole(NCContext context)
        {
            this._context = context;
        }

        //1. clear default role
        public long clearDefault()
        {
            long rs = 0;
            try {
                var tmp = new Dictionary<string, string>();
                tmp.Add("_default", "0");
                var rrs = _context._db.UpdateByColumn("nc_core_role", tmp, "_default", "1");
                if (rrs)
                    rs = 1;
            }
            catch (Exception e)
            {
                rs = -1;
                NCLogger.Debug("NCRole - clearDefault:" + e.Message);
            }
            return rs;
        }

        //2. set a role to default for new user
        public long setDefault(long roleId)
        {
            long rs = 0;
            try
            {
                var tmp = new Dictionary<string, string>();
                tmp.Add("_default", "1");
                var rrs = _context._db.UpdateByColumn("nc_core_role", tmp, "id", roleId.ToString());
                if (rrs)
                    rs = 1;
            }
            catch (Exception e)
            {
                rs = -1;
                NCLogger.Debug("NCRole - setDefault:" + e.Message);
            }
            return rs;
        }

        //3. get default role id
        public long getDefault()
        {
            long rs = 0;
            try
            {
                rs  = long.Parse(_context._db.getFirstValueByColumn("nc_core_role","id","_default","1"));
            }
            catch(Exception e)
            {
                rs = -1;
                NCLogger.Debug("NCRole - getDefault:" + e.Message);
            }

            return rs;
        }

        //4. get user have role id
        public long getUserCount(long roleId)
        {
            var rs = 0;

            try
            {
                var tmp = _context._db._conn.Query("select count(id) as Num from nc_core_user_role group by role_id having role_id ="+roleId);
                rs = tmp.First().Num;
            }
            catch (Exception e)
            {
                rs = -1;
                NCLogger.Debug("NCRole - getUserCount:" + e.Message);
            }
            return rs;
        }

        //5. get user list in role
        public dynamic getUserList(long roleId)
        {
            return _context._db.Select("nc_core_user_role",select:"user_id", filter: "role_id="+roleId);
        }

        //6. get role default
        public dynamic getDefaulRole()
        {
            return _context._db.Select("nc_core_role", filter: "_default=1");
        }

        public dynamic getRoleAndCountUser()
        {
            return _context._db.Select("nc_core_role",select: "*,(select count(id) from nc_core_user_role where role_id=nc_core_role.id) as NumUser");
        }

    }
}
