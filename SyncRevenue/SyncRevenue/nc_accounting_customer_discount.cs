using Dapper;
using System.Data;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Data.SqlClient;
using Z.Expressions;

namespace SyncRevenue
{
    public class nc_accounting_customer_discount
    {
        IDbConnection _conn = new SqlConnection(Properties.Settings.Default.KEVN);


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
        public string custom_result { get; set; }

        public int? user_create { get; set; }

        public int? user_approve { get; set; }

        public DateTime? approved_date { get; set; }

        public bool? _active { get; set; }

        public bool? _deleted { get; set; }

        public DateTime? _createdate { get; set; }

        public DateTime? _updatedate { get; set; }

        public nc_accounting_customer_discount findId(int id)
        {
            return _conn.Query<nc_accounting_customer_discount>("select * from nc_accounting_customer_discount where id = @id", new { id }).FirstOrDefault();
        }
        public nc_accounting_customer_discount findWhere(string where = "1=0")
        {
            return _conn.Query<nc_accounting_customer_discount>("select * from nc_accounting_customer_discount where " + where).FirstOrDefault();

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
            _conn.Execute(@"UPDATE [nc_accounting_customer_discount]
             SET [type_rule]	=	@type_rule
                [depcription]	=	@depcription
                [rate]	=	@rate
                [target]	=	@target
                [from_date]	=	@from_date
                [to_date]	=	@to_date
                [period]	=	@period
                [filter_dx]	=	@filter_dx
                [filter_sql]	=	@filter_sql
                [custom_result]	=	@custom_result
                [user_create]	=	@user_create
                [user_approve]	=	@user_approve
                [approved_date]	=	@approved_date
                [_active]	=	@_active
                [_deleted]	=	@_deleted
                [_createdate]	=	@_createdate
                [_updatedate]	=	@_updatedate
             WHERE id = @id", this);
        }
        public void remove()
        {
            _conn.Execute(@"DELETE FROM [nc_accounting_customer_discount] WHERE id = @id", this);
        }

        private int addNew()
        {
            return _conn.Query<int>(@"INSERT INTO [nc_accounting_customer_discount](_createdate) VALUES(getdate());SELECT CAST(SCOPE_IDENTITY() as int)").FirstOrDefault();

        }
        public void assign(IDbConnection ct)
        {
            _conn = ct;
        }
        
        public IEnumerable<nc_accounting_customer_discount> getWhere(string where = "1=0")
        {
            return _conn.Query<nc_accounting_customer_discount>("select * from nc_accounting_customer_discount where _active=1 and _deleted = 0 and "+where);
        }

        public nc_accounting_customer_discount compareRule(DataTable dt, int type)
        {
            var list = getWhere("type_rule=" + type+ " and not (user_approve is null) and (from_date is null or (from_date <= getdate())) and (to_date is null or (to_date >= getdate())) order by isnull(period,-999999) desc");
            foreach( var it in list)
            {
                if (dt.Select(it.filter_sql.Replace("N'","'")).Length > 0)
                {
                    if (!string.IsNullOrEmpty(it.custom_result)){
                        try
                        {
                            var dict = dt.Columns
                                  .Cast<DataColumn>()
                                  .ToDictionary(c => c.ColumnName, c => dt.Rows[0][c]);
                            it.rate = (decimal) Eval.Execute<double>(it.custom_result, dict);
                        }
                        catch(Exception ex)
                        {
                            it.rate = 0;
                        }                        
                    }
                    return it;
                }
            }
            return null;
        }

    }
}