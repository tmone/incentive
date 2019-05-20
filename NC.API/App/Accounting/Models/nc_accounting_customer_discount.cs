using Dapper;
using NC.CORE.Context;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;

namespace NC.API.App.Accounting.Models
{
    public class nc_accounting_customer_discount
    {
        private NCContext _context;

        public int id { get; set; }

        public int? type_rule { get; set; }

        public string depcription { get; set; }

        public decimal? rate { get; set; }

        public string target { get; set; }

        public DateTime? from_date { get; set; }

        public DateTime? to_date { get; set; }

        public int? period { get; set; }

        public string filter_dx { get; set; }

        public string filter_sql { get; set; }

        public int? user_create { get; set; }

        public int? user_approve { get; set; }

        public DateTime? approved_date { get; set; }

        public bool? _active { get; set; }

        public bool? _deleted { get; set; }

        public DateTime? _createdate { get; set; }

        public DateTime? _updatedate { get; set; }

        public nc_accounting_customer_discount findId(int id)
        {
            return _context._db._conn.Query<nc_accounting_customer_discount>("select * from nc_accounting_customer_discount where id = @id", new { id }).FirstOrDefault();
        }
        public nc_accounting_customer_discount findWhere(string where = "1=0")
        {
            return _context._db._conn.Query<nc_accounting_customer_discount>("select * from nc_accounting_customer_discount where " + where).FirstOrDefault();

        }
        public void save()
        {
            if (this.id == 0)
            {
                this.id = addNew();
            }
            _context._db._conn.Execute(@"UPDATE [nc_accounting_customer_discount]
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
            _context._db._conn.Execute(@"DELETE FROM [nc_accounting_customer_discount] WHERE id = @id", this);
        }

        private int addNew()
        {
            return _context._db._conn.Query<int>(@"INSERT INTO [nc_accounting_customer_discount](_createdate) VALUES(getdate());SELECT CAST(SCOPE_IDENTITY() as int)").FirstOrDefault();

        }
        public void assign(NCContext ct)
        {
            _context = ct;
        }
        
        public IEnumerable<nc_accounting_customer_discount> getWhere(string where = "1=0")
        {
            return _context._db._conn.Query<nc_accounting_customer_discount>("select * from nc_accounting_customer_discount where _active=1 and _deleted = 0 and "+where);
        }

        public nc_accounting_customer_discount compareRule(DataTable dt, int type)
        {
            var list = getWhere("type_rule=" + type+ " and not (user_approve is null) and (from_date is null or (from_date <= getdate())) and (to_date is null or (to_date >= getdate())) order by isnull(period,-999999) desc");
            foreach( var it in list)
            {
                if (dt.Select(it.filter_sql.Replace("N'","'")).Length > 0)
                {
                    return it;
                }
            }
            return null;
        }

    }
}