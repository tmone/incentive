using Dapper;
using NC.CORE.Context;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace NC.API.App.Accounting.Models
{
    public class nc_accounting_temp_customer
    {
        private NCContext _context;

        public int id { get; set; }

        public string GROUP_NAME { get; set; }

        public string MA_KH { get; set; }

        public string TEN_KH { get; set; }

        public DateTime? JOIN_DATE { get; set; }

        public nc_accounting_temp_customer findId(int id)
        {
            return _context._db._conn.Query<nc_accounting_temp_customer>("select * from nc_accounting_temp_customer where id = @id", new { id }).FirstOrDefault();
        }

        public nc_accounting_temp_customer findWhere(string where = "1=0")
        {
            return _context._db._conn.Query<nc_accounting_temp_customer>("select * from nc_accounting_temp_customer where " + where).FirstOrDefault();

        }

        public void save()
        {
            if (this.id == 0)
            {
                this.id = addNew();
            }
            _context._db._conn.Execute(@"UPDATE [nc_accounting_temp_customer]
               SET [MA_KH] = @MA_KH
                  ,[TEN_KH] = @TEN_KH
                  ,[GROUP_NAME] = @GROUP_NAME
                  ,[JOIN_DATE] = @JOIN_DATE                  
             WHERE id = @id", this);
        }
        public void remove()
        {
            _context._db._conn.Execute(@"DELETE FROM [nc_accounting_temp_customer] WHERE id = @id", this);
        }

        private int addNew()
        {
            return _context._db._conn.Query<int>(@"INSERT INTO [nc_accounting_temp_customer](MA_KH) VALUES(null);SELECT CAST(SCOPE_IDENTITY() as int)").FirstOrDefault();

        }

        public void assign(NCContext ct)
        {
            _context = ct;
        }
        public void updateId()
        {
            var tmp = findWhere("MA_KH='" + this.MA_KH + "'");
            if (tmp != null)
            {
                this.id = tmp.id;
            }
        }


    }

}