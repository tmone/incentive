using NC.CORE.Context;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Dapper;
namespace NC.API.App.Accounting.Models
{
    public class nc_accounting_temp_invoice
    {
        private NCContext _context;



        public int id { get; set; }

        public string CN { get; set; }

        public string SO_HD { get; set; }

        public DateTime? INVOICE_DATE { get; set; }

        public string IN_MONTH { get; set; }

        public DateTime? NGAY_GHI_SO { get; set; }

        public string NOTE_ORC { get; set; }

        public string STA_XL { get; set; }

        public string DESCRIPTION { get; set; }

        public string MA_KH { get; set; }

        public string TEN_KH { get; set; }

        public decimal? INVOICE_AMOUNT { get; set; }

        public decimal? RECEIPT_AMOUNT { get; set; }

        public DateTime? PAYMENT_DATE { get; set; }

        public nc_accounting_temp_invoice findId(int id)
        {
            return _context._db._conn.Query<nc_accounting_temp_invoice>("select * from nc_accounting_temp_invoice where id = @id", new { id }).FirstOrDefault();
        }
        public nc_accounting_temp_invoice findWhere(string where = "1=0")
        {
            return _context._db._conn.Query<nc_accounting_temp_invoice>("select * from nc_accounting_temp_invoice where " + where).FirstOrDefault();

        }
        public void save()
        {
            if (this.id == 0)
            {
                this.id = addNew();
            }
            _context._db._conn.Execute(@"UPDATE [nc_accounting_temp_invoice]
                 SET [CN] = @CN
                    ,[SO_HD] = @SO_HD
                    ,[INVOICE_DATE] = @INVOICE_DATE
                    ,[IN_MONTH] = @IN_MONTH
                    ,[NGAY_GHI_SO] = @NGAY_GHI_SO
                    ,[NOTE_ORC] = @NOTE_ORC
                    ,[STA_XL] = @STA_XL
                    ,[DESCRIPTION] = @DESCRIPTION
                    ,[MA_KH] = @MA_KH
                    ,[TEN_KH] = @TEN_KH
                    ,[INVOICE_AMOUNT] = @INVOICE_AMOUNT
                    ,[RECEIPT_AMOUNT] = @RECEIPT_AMOUNT
                    ,[PAYMENT_DATE] = @PAYMENT_DATE
             WHERE id = @id", this);
        }
        public void remove()
        {
            _context._db._conn.Execute(@"DELETE FROM [nc_accounting_temp_invoice] WHERE id = @id", this);
        }

        private int addNew()
        {
            return _context._db._conn.Query<int>(@"INSERT INTO [nc_accounting_temp_invoice](SO_HD) VALUES(null);SELECT CAST(SCOPE_IDENTITY() as int)").FirstOrDefault();

        }
        public void assignContext(NCContext ct)
        {
            _context = ct;
        }
        public void assign(NCContext ct)
        {
            _context = ct;
        }
        public void updateId()
        {
            var tmp = findWhere("SO_HD='" + this.SO_HD + "'");
            if (tmp != null)
            {
                this.id = tmp.id;
            }
        }

    }
}