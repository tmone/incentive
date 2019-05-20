using System.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Dapper;
using System.Data.SqlClient;

namespace SyncRevenue
{
    public class nc_accounting_temp_discount
    {
        IDbConnection _conn = new SqlConnection(Properties.Settings.Default.KEVN);


        public int id { get; set; }

        public string MA_KH { get; set; }

        public string IN_MONTH { get; set; }

        public string SO_VAN_DON { get; set; }

        public decimal? DC { get; set; }

        public nc_accounting_temp_discount findId(int id)
        {
            return _conn.Query<nc_accounting_temp_discount>("select * from nc_accounting_temp_discount where id = @id", new { id }).FirstOrDefault();
        }

        public nc_accounting_temp_discount findWhere(string where = "1=0")
        {
            return _conn.Query<nc_accounting_temp_discount>("select * from nc_accounting_temp_discount where " + where).FirstOrDefault();

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
            _conn.Execute(@"UPDATE [nc_accounting_temp_discount]
               SET [MA_KH] = @MA_KH
                  ,[IN_MONTH] = @IN_MONTH
                  ,[SO_VAN_DON] = @SO_VAN_DON
                  ,[DC] = @DC
             WHERE id = @id", this);
        }
        public void remove()
        {
            _conn.Execute(@"DELETE FROM [nc_accounting_temp_discount] WHERE id = @id", this);
        }

        private int addNew()
        {
            return _conn.Query<int>(@"INSERT INTO [nc_accounting_temp_discount](MA_KH) VALUES(null);SELECT CAST(SCOPE_IDENTITY() as int)").FirstOrDefault();

        }
        public void assign(IDbConnection ct)
        {
            _conn = ct;
        }
        public void updateId()
        {
            var tmp = findWhere("SO_VAN_DON='" + this.SO_VAN_DON + "' AND IN_MONTH='"+this.IN_MONTH+"'");
            if (tmp != null)
            {
                this.id = tmp.id;
            }
        }
    }
}