
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using Dapper;

namespace SyncRevenue
{
    public class nc_accounting_temp_revenue
    {
        IDbConnection _conn = new SqlConnection(Properties.Settings.Default.KEVN);



        public int id { get; set; }

        public string MA_KH { get; set; }

        public string IN_MONTH { get; set; }

        public int? NUM_PACKAGE { get; set; }

        public decimal? DOANH_THU { get; set; }

        public decimal? CUSTOMER_COM_RATE { get; set; }

        public decimal? CUSTOMER_COM_AMOUNT { get; set; }

        public string CUSTOMER_COM_TARGET { get; set; }

        public decimal? PERSON_COM_RATE { get; set; }

        public decimal? PERSON_COM_AMOUNT { get; set; }

        public string PERSON_COM_TARGET { get; set; }

        public decimal? SALE_COM_RATE { get; set; }

        public decimal? SALE_COM_AMOUNT { get; set; }

        public string SALE_COM_TARGET { get; set; }

        public decimal? TOTAL_COM { get; set; }

        public decimal? AVERAGE_COM { get; set; }

        public nc_accounting_temp_revenue findId(int id)
        {
            return _conn.Query<nc_accounting_temp_revenue>("select * from nc_accounting_temp_revenue where id = @id", new { id }).FirstOrDefault();
        }
        public nc_accounting_temp_revenue findWhere(string where = "1=0")
        {
            return _conn.Query<nc_accounting_temp_revenue>("select * from nc_accounting_temp_revenue where " + where).FirstOrDefault();

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
            _conn.Execute(@"UPDATE [nc_accounting_temp_revenue]
             SET [MA_KH] = @MA_KH
                ,[IN_MONTH] = @IN_MONTH
                ,[NUM_PACKAGE] = @NUM_PACKAGE
                ,[DOANH_THU] = @DOANH_THU
                ,[CUSTOMER_COM_RATE]	=	@CUSTOMER_COM_RATE
                ,[CUSTOMER_COM_AMOUNT]	=	@CUSTOMER_COM_AMOUNT
                ,[CUSTOMER_COM_TARGET]	=	@CUSTOMER_COM_TARGET
                ,[PERSON_COM_RATE]	=	@PERSON_COM_RATE
                ,[PERSON_COM_AMOUNT]	=	@PERSON_COM_AMOUNT
                ,[PERSON_COM_TARGET]	=	@PERSON_COM_TARGET
                ,[SALE_COM_RATE]	=	@SALE_COM_RATE
                ,[SALE_COM_AMOUNT]	=	@SALE_COM_AMOUNT
                ,[SALE_COM_TARGET]	=	@SALE_COM_TARGET
                ,[TOTAL_COM]	=	@TOTAL_COM
                ,[AVERAGE_COM]	=	@AVERAGE_COM
             WHERE id = @id", this);
        }
        public void remove()
        {
            _conn.Execute(@"DELETE FROM [nc_accounting_temp_revenue] WHERE id = @id", this);
        }

        private int addNew()
        {
            return _conn.Query<int>(@"INSERT INTO [nc_accounting_temp_revenue](MA_KH) VALUES(null);SELECT CAST(SCOPE_IDENTITY() as int)").FirstOrDefault();

        }
        public void assign(IDbConnection ct)
        {
            _conn = ct;
        }
        public void updateId()
        {
            var tmp = findWhere("MA_KH = '" + this.MA_KH + "' and IN_MONTH='" + this.IN_MONTH + "'");
            if (tmp != null)
            {
                this.id = tmp.id;
            }
            var dis = new nc_accounting_customer_discount();
            var dt = this.toDataTable();
            dis.assign(_conn);
            var cus_com = dis.compareRule(dt, 0);
            if (cus_com != null)
            {
                this.CUSTOMER_COM_RATE = cus_com.rate;
                this.CUSTOMER_COM_TARGET = cus_com.target;
            }
            var per_com = dis.compareRule(dt, 1);
            if (per_com != null)
            {
                this.PERSON_COM_RATE = per_com.rate;
                this.PERSON_COM_TARGET = per_com.target;
            }
            var sale_com = dis.compareRule(dt, 2);
            if (sale_com != null)
            {
                this.SALE_COM_RATE = sale_com.rate;
                this.SALE_COM_TARGET = sale_com.target;
            }
        }

        public DataTable toDataTable()
        {
            DataTable dt = new DataTable("nc_accounting_temp_revenue");
            //var dt = new DataTable();
            dt.Columns.Add("id", System.Type.GetType("System.Int32"));
            dt.Columns.Add("MA_KH", System.Type.GetType("System.String"));
            dt.Columns.Add("IN_MONTH", System.Type.GetType("System.String"));
            dt.Columns.Add("NUM_PACKAGE", System.Type.GetType("System.Int32"));
            dt.Columns.Add("DOANH_THU", System.Type.GetType("System.Decimal"));
            dt.Columns.Add("CUSTOMER_COM_RATE", System.Type.GetType("System.Decimal"));
            dt.Columns.Add("CUSTOMER_COM_AMOUNT", System.Type.GetType("System.Decimal"));
            dt.Columns.Add("CUSTOMER_COM_TARGET", System.Type.GetType("System.String"));
            dt.Columns.Add("PERSON_COM_RATE", System.Type.GetType("System.Decimal"));
            dt.Columns.Add("PERSON_COM_AMOUNT", System.Type.GetType("System.Decimal"));
            dt.Columns.Add("PERSON_COM_TARGET", System.Type.GetType("System.String"));
            dt.Columns.Add("SALE_COM_RATE", System.Type.GetType("System.Decimal"));
            dt.Columns.Add("SALE_COM_AMOUNT", System.Type.GetType("System.Decimal"));
            dt.Columns.Add("SALE_COM_TARGET", System.Type.GetType("System.String"));
            dt.Columns.Add("TOTAL_COM", System.Type.GetType("System.Decimal"));
            dt.Columns.Add("AVERAGE_COM", System.Type.GetType("System.Decimal"));
            //dt.Rows.Add()
            //DataTable dt = new DataTable("nc_accounting_temp_revenue");

            DataRow dr = dt.NewRow();
            dt.Rows.Add(dr);


            dt.Rows[0]["id"] = this.id;
            dt.Rows[0]["MA_KH"] = this.MA_KH;
            dt.Rows[0]["IN_MONTH"] = this.IN_MONTH;
            dt.Rows[0]["NUM_PACKAGE"] = this.NUM_PACKAGE ?? 0;
            dt.Rows[0]["DOANH_THU"] = this.DOANH_THU ?? 0;
            dt.Rows[0]["CUSTOMER_COM_RATE"] = this.CUSTOMER_COM_RATE??0;
            dt.Rows[0]["CUSTOMER_COM_AMOUNT"] = this.CUSTOMER_COM_AMOUNT ?? 0;
            dt.Rows[0]["CUSTOMER_COM_TARGET"] = this.CUSTOMER_COM_TARGET;
            dt.Rows[0]["PERSON_COM_RATE"] = this.PERSON_COM_RATE ?? 0;
            dt.Rows[0]["PERSON_COM_AMOUNT"] = this.PERSON_COM_AMOUNT ?? 0;
            dt.Rows[0]["PERSON_COM_TARGET"] = this.PERSON_COM_TARGET;
            dt.Rows[0]["SALE_COM_RATE"] = this.SALE_COM_RATE ?? 0;
            dt.Rows[0]["SALE_COM_AMOUNT"] = this.SALE_COM_AMOUNT ?? 0;
            dt.Rows[0]["SALE_COM_TARGET"] = this.SALE_COM_TARGET;
            dt.Rows[0]["TOTAL_COM"] = this.TOTAL_COM ?? 0;
            dt.Rows[0]["AVERAGE_COM"] = this.AVERAGE_COM ?? 0;
            return dt;            
        }

        
    }
    

}