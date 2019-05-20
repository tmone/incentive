using Dapper;
using NC.CORE.Context;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace NC.API.App.Accounting.Models
{
    public class nc_acc_kpi_customer {
        private NCContext _context;

        public int id { get; set; }
        public string name { get; set; }
        public string description { get; set; }
        public string user { get; set; }
        public int? zone { get; set; }
        public int? type { get; set; }
        public string setting { get; set; }
        [JsonProperty(PropertyName = "default")]
        public decimal? Default { get; set; }
        public int? parent { get; set; }
        public bool? _active { get; set; }
        public bool? _deleted { get; set; }
        public DateTime? _createdate { get; set; }
        public DateTime? _updatedate { get; set; }

        public nc_acc_kpi_customer findId(int id)
        {
            return _context._db._conn.Query<nc_acc_kpi_customer>("select * from nc_acc_kpi_customer where id = @id", new { id }).FirstOrDefault();
        }
        public nc_acc_kpi_customer findWhere(string where = "1=0")
        {
            return _context._db._conn.Query<nc_acc_kpi_customer>("select * from nc_acc_kpi_customer where " + where).FirstOrDefault();

        }
        public void save()
        {
            if (this.id == 0)
            {
                this.id = addNew();
            }
            _context._db._conn.Execute(@"UPDATE [nc_acc_kpi_customer]
             SET 
                	[name] = @name
                ,	[description] = @description
                ,	[user] = @user
                ,	[zone] = @zone
                ,	[type] = @type
                ,	[setting] = @setting
                ,	[default] = @default
                ,	[parent] = @parent
                ,	[_active] = @_active
                ,	[_deleted] = @_deleted
                ,	[_createdate] = @_createdate
                ,	[_updatedate] = @_updatedate
             WHERE id = @id", this);
        }
        public void remove()
        {
            _context._db._conn.Execute(@"DELETE FROM [nc_acc_kpi_customer] WHERE id = @id", this);
        }

        private int addNew()
        {
            return _context._db._conn.Query<int>(@"INSERT INTO [nc_acc_kpi_customer](_active,_deleted,_createdate) VALUES(1,0,getdate());SELECT CAST(SCOPE_IDENTITY() as int)").FirstOrDefault();

        }
        public void assign(NCContext ct)
        {
            _context = ct;
        }
        public void updateId()
        {
            var tmp = findWhere("[name]='" + this.name + "'");
            if (tmp != null)
            {
                this.id = tmp.id;
                this._updatedate = DateTime.Now;
            }
        }
    }
}