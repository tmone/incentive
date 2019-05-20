using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Dapper;
using NC.CORE.Context;
using NC.CORE.Log;
namespace NC.CORE.App.NCMaster
{
    public class NCMaster
    {
        private NCContext _context = new NCContext();
        public NCMaster(NCContext context)
        {
            this._context = context;
        }

        
        //4. get distric
        public long getDistrictCount(long provinceId)
        {
            var rs = 0;

            try
            {
                var tmp = _context._db._conn.Query("select count(id) as Num from nc_master_district group by province_id having province_id =" + provinceId);
                rs = tmp.First().Num;
            }
            catch (Exception e)
            {
                rs = -1;
                NCLogger.Debug("NCMaster - getDistrictCount:" + e.Message);
            }
            return rs;
        }

        //5. get user list in role
        public dynamic getDistrictList(long provinceId)
        {
            return _context._db.Select("nc_master_district", filter: "province_id=" + provinceId);
        }

    }
}
