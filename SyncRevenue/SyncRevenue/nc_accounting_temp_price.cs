using System.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Dapper;
using System.Data.SqlClient;

namespace SyncRevenue
{
    public class nc_accounting_temp_price
    {
        IDbConnection _conn = new SqlConnection(Properties.Settings.Default.KEVN);


        public int id { get; set; }

        public string SO_VAN_DON { get; set; }

        public decimal? CUOC_PUBLIC { get; set; }

        public string MA_KH { get; set; }

        public string IN_MONTH { get; set; }

        public nc_accounting_temp_price findId(int id)
        {
            return _conn.Query<nc_accounting_temp_price>("select * from nc_accounting_temp_price where id = @id", new { id }).FirstOrDefault();
        }

        public nc_accounting_temp_price findWhere(string where = "1=0")
        {
            return _conn.Query<nc_accounting_temp_price>("select * from nc_accounting_temp_price where " + where).FirstOrDefault();

        }
        public void save(bool overider = true)
        {
            if (!overider && this.id > 0)
            {
                return;
            }
            if (this.id == 0)
            {
                this.id = addNew();
            }
            _conn.Execute(@"UPDATE [nc_accounting_temp_price]
               SET [SO_VAN_DON] = @SO_VAN_DON
                ,[CUOC_PUBLIC] = @CUOC_PUBLIC
                ,[MA_KH] = @MA_KH
                ,[IN_MONTH] = @IN_MONTH
             WHERE id = @id", this);
        }
        public void remove()
        {
            _conn.Execute(@"DELETE FROM [nc_accounting_temp_price] WHERE id = @id", this);
        }

        private int addNew()
        {
            return _conn.Query<int>(@"INSERT INTO [nc_accounting_temp_price](SO_VAN_DON) VALUES(null);SELECT CAST(SCOPE_IDENTITY() as int)").FirstOrDefault();

        }
        public void assign(IDbConnection ct)
        {
            _conn = ct;
        }
        public void updateId()
        {
            var tmp = findWhere("SO_VAN_DON='" + this.SO_VAN_DON + "'");
            if (tmp != null)
            {
                this.id = tmp.id;
            }
        }
    }
}