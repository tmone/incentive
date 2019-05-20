using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Z.Dapper.Plus;

namespace SyncRevenue
{
    static public class bulksync
    {
        static public void bulkCustomer(IEnumerable<nc_accounting_temp_customer> list)
        {
            DapperPlusManager.Entity<nc_accounting_temp_customer>("Insert_key")
                .Table("nc_accounting_temp_customer")
                .Key(x => x.MA_KH)
                .InsertIfNotExists();

            DapperPlusManager.Entity<nc_accounting_temp_customer>("Update_key")
                .Table("nc_accounting_temp_customer")
                .Key(x => x.MA_KH);
            using (var conn = new SqlConnection(Properties.Settings.Default.KEVN))
            {
                conn.Open();

                conn.BulkUpdate("Update_key", list);
                conn.BulkInsert("Insert_key", list);

                conn.Close();
            }
        }
    }
}
