using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Dapper;
using System.Data;
using System.Data.SqlClient;

namespace SyncRevenue
{
    public class nc_accounting_temp_bill
    {
        IDbConnection _conn = new SqlConnection(Properties.Settings.Default.KEVN);


        public int id { get; set; }

        public string MA_KH { get; set; }

        public string SO_VAN_DON { get; set; }

        public decimal? TIEN_HD { get; set; }

        public string SO_HD { get; set; }

        public DateTime? NGAY_HD { get; set; }

        public string IN_MONTH { get; set; }

        public DateTime? CREATED { get; set; }

        public decimal? WEIGHT { get; set; }

        public string DV { get; set; }

        public int? WAY { get; set; }

        public string POST { get; set; }

        public nc_accounting_temp_bill findId(int id)
        {
            return _conn.Query<nc_accounting_temp_bill>("select * from nc_accounting_temp_bill where id = @id",new { id}).FirstOrDefault();
        }

        public nc_accounting_temp_bill findWhere(string where = "1=0")
        {
            return _conn.Query<nc_accounting_temp_bill>("select * from nc_accounting_temp_bill where "+where).FirstOrDefault();

        }

        public void save(bool overider = true)
        {
            if(!overider && this.id > 0)
            {
                return;
            }
            
            if (this.id==0)
            {
                this.id = addNew();
            }
            _conn.Execute(@"UPDATE [nc_accounting_temp_bill]
               SET [MA_KH] = @MA_KH
                  ,[SO_VAN_DON] = @SO_VAN_DON
                  ,[TIEN_HD] = @TIEN_HD
                  ,[SO_HD] = @SO_HD
                  ,[NGAY_HD] = @NGAY_HD
                  ,[IN_MONTH] = @IN_MONTH
                  ,[CREATED] = @CREATED
                  ,[WEIGHT] = @WEIGHT
                  ,[DV] = @DV
                  ,[WAY] = @WAY
                  ,[POST] = @POST
             WHERE id = @id", this);
        }
        public void remove()
        {
            _conn.Execute(@"DELETE FROM [nc_accounting_temp_bill] WHERE id = @id", this);
        }

        private int addNew()
        {
            return _conn.Query<int>(@"INSERT INTO [nc_accounting_temp_bill](CREATED) VALUES(getdate());SELECT CAST(SCOPE_IDENTITY() as int)").FirstOrDefault();

        }

        public void assign(IDbConnection ct)
        {
            _conn = ct;
        }
        public void updateId()
        {
            var tmp = findWhere("SO_VAN_DON='"+this.SO_VAN_DON+"' AND SO_HD='" + this.SO_HD +"' AND IN_MONTH='" + this.IN_MONTH +"'");
            if (tmp != null)
            {
                this.id = tmp.id;
            }
        }


    }
}