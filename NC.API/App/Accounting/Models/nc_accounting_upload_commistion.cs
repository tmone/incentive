using Dapper;
using NC.CORE.Context;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace NC.API.App.Accounting.Models
{
    public class nc_accounting_upload_commistion
    {
        private NCContext _context;

        public int id { get; set; }

        public string client_code { get; set; }

        public string in_month { get; set; }

        public decimal? commission_rate { get; set; }

        public string type { get; set; }

        public string invoice_no { get; set; }

        public decimal? after_discount { get; set; }

        public bool? on_time { get; set; }

        public string receipt_ref { get; set; }

        public decimal? actual_payment_received { get; set; }

        public decimal? actual_commission_paid { get; set; }

        public string commission_receipt_ref { get; set; }

        public DateTime? receipt_date { get; set; }

        public string receipient { get; set; }

        public string staff_code { get; set; }

        public decimal? incentive_rate { get; set; }

        public decimal? sales_incentive { get; set; }

        public string note { get; set; }

        public string template_ref { get; set; }

        public bool? _active { get; set; }

        public bool? _deleted { get; set; }

        public DateTime? _createdate { get; set; }

        public DateTime? _updatedate { get; set; }

        public nc_accounting_upload_commistion findId(int id)
        {
            return _context._db._conn.Query<nc_accounting_upload_commistion>("select * from nc_accounting_upload_commistion where id = @id", new { id }).FirstOrDefault();
        }
        public nc_accounting_upload_commistion findWhere(string where = "1=0")
        {
            return _context._db._conn.Query<nc_accounting_upload_commistion>("select * from nc_accounting_upload_commistion where " + where).FirstOrDefault();

        }
        public void save()
        {
            if (this.id == 0)
            {
                this.id = addNew();
            }
            _context._db._conn.Execute(@"UPDATE [nc_accounting_upload_commistion]
             SET [client_code]	=	@client_code
                ,[in_month]	=	@in_month
                ,[commission_rate]	=	@commission_rate
                ,[type]	=	@type
                ,[invoice_no]	=	@invoice_no
                ,[after_discount]	=	@after_discount
                ,[on_time]	=	@on_time
                ,[receipt_ref]	=	@receipt_ref
                ,[actual_payment_received]	=	@actual_payment_received
                ,[actual_commission_paid]	=	@actual_commission_paid
                ,[commission_receipt_ref]	=	@commission_receipt_ref
                ,[receipt_date]	=	@receipt_date
                ,[receipient]	=	@receipient
                ,[staff_code]	=	@staff_code
                ,[incentive_rate]	=	@incentive_rate
                ,[sales_incentive]	=	@sales_incentive
                ,[note]	=	@note
                ,[template_ref]	=	@template_ref
                ,[_active]	=	@_active
                ,[_deleted]	=	@_deleted
                ,[_createdate]	=	@_createdate
                ,[_updatedate]	=	@_updatedate
             WHERE id = @id", this);
        }
        public void remove()
        {
            _context._db._conn.Execute(@"DELETE FROM [nc_accounting_upload_commistion] WHERE id = @id", this);
        }

        private int addNew()
        {
            return _context._db._conn.Query<int>(@"INSERT INTO [nc_accounting_upload_commistion](_active,_deleted,_createdate) VALUES(1,0,getdate());SELECT CAST(SCOPE_IDENTITY() as int)").FirstOrDefault();

        }
        public void assign(NCContext ct)
        {
            _context = ct;
        }
        public void updateId()
        {
            var tmp = findWhere("client_code='" + this.client_code + "' and in_month='" + this.in_month + "'");
            if (tmp != null)
            {
                this.id = tmp.id;
                this._updatedate = DateTime.Now;
            }
        }

    }

}