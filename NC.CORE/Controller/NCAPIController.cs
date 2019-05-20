using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using NC.CORE.Log;
using NC.CORE.Base;
using NC.CORE.Model;
using NC.CORE.Xml;
using System.Web.Mvc;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Collections.Specialized;
using NC.CORE.Language;
using NC.CORE.Context;
using NC.CORE.Token;
using System.Web;
using Newtonsoft.Json;
using System.Net.Http.Formatting;
using NC.CORE.Helper;
using System.Web.Http.Cors;
using System.Dynamic;
using NC.CORE.Log;
namespace NC.CORE.NCController
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class NCAPIController : ApiController
    {
        //public NCContext _context = new NCContext();
        //public string _app;
        //1. Inject for check permision
        public NCContext _context = new NCContext();
        public string _app;
        NCHelper helper = new NCHelper();

        protected override void Initialize(HttpControllerContext controllerContext)
        {
            base.Initialize(controllerContext);
            this.init();
        }
        private void init(Dictionary<string, string> config = null)
        {
            //get parameter from URL
            NameValueCollection p = HttpUtility.ParseQueryString(Request.RequestUri.Query);
            //NCLogger.Debug("AbsolutePath:"+Request.RequestUri.AbsolutePath);
            //NCLogger.Debug("AbsoluteUri"+Request.RequestUri.AbsoluteUri);
            //
            //if(config!=null)
            //
            this._context.setConfig(config);
            //set context
            this._context._token = new NCToken(this._context);
            //
            if (p.Count > 0)
            {
                //If not exists Token or Token not avaibility
                if (p["token"] == null || !this._context._token.checkAPIToken(p["token"]))
                {
                    HttpContext.Current.Response.Write(this._context._lang.getLang("_ACCESS_DENY_"));
                    HttpContext.Current.Response.Flush();
                    HttpContext.Current.Response.End();
                }
                else
                {

                    this._context._token.setToken(p["token"]);

                }
            }
            //update org_id & user id for context object
            this._context._user.UserID = Int64.Parse(this._context._token.getUserID());
            this._context._user.OrgID = Int64.Parse(this._context._token.getOrgID());
            this._context.setDBUserContext(this._context._user);
            //init DB
            if (!this._context._db.checkConnection())
            {
                this._context._msg.setDanger("DB_INIT_ERROR: Cannot initial Database", 0);
            }

            //


            //set SQL Query parmater
            /*
             * URL?$select=a,b,c
             * URL?$filter=(col1 eq 1) or (col2 ge 2)
             *        - op: = eq ; > gr ; >= gre ; < le ; <= lee ; <> ne
             * URL?$sort= col1 desc,col2 asc
             * URL?$count&$filter=(col1 eq 1) or (col2 ge 2)
             * Combine: URL $select=col1,col2&$filter=(col1 eq 1) or (col2 ge 2)&$sort= col1 desc,col2 asc
             */
            this._context.setQueryParam(p);

            //<!---5. load Language
            this._context._lang = new NCLanguage(this._context);

            //load Core language
            this._context._lang.loadLang("CORE", this._context._token.getAPISessionLang());

            //load App language
            this._context._lang.loadLang(this._app, this._context._token.getAPISessionLang());

            ////--load Language--!>
        }
        //1. SELECT
        //GET api/core/<controller>?token=

        protected IEnumerable<dynamic> Get(string table)
        {
            return this.select(table);
        }
        //GET api/core/<controller>/<id>?token=
        protected IEnumerable<dynamic> Get(string table, int id)
        {
            return this.select(table, id);
        }
        //GET api/core/<controller>?token=
        /* 
         * Data return format
           arr = {
                   { column1 = "1", column2 = "name", column3= "somevalue" }, 
                   { column1 = "2", column2 = "name2", column3= "somevalue2" },
                   { column1 = "3", column2 = "name3", column3= "somevalue3" }
                }; 
            arr[1].column1 => 2
         */
        protected IEnumerable<dynamic> GetSQL(string sql, bool builder = true)
        {
            return this.Execute(sql, builder);
        }
        //2. NEW
        //POST api/core/<controller>?token=
        //public string Post(string table,int type, [FromBody]string value)
        //{
        //    return "1";
        //}
        protected IEnumerable<dynamic> Post(string table, [FromBody]FormDataCollection formDataCollection)
        {
            return this.add(table, helper.ConvertPOSTToDic(formDataCollection));
        }
        //3. UPDATE
        //PUT api/core/<controller>/<id>?token=
        protected IEnumerable<dynamic> Put(string table, long id, FormDataCollection formDataCollection)
        {
            return this.update(table, helper.ConvertPOSTToDic(formDataCollection), id);
        }

        //4. DELETE api/values/5
        //DELETE api/core/<controller>/<id>?token=
        protected IEnumerable<dynamic> Delete(string table, long id)
        {
            return this.delete(table, id);
        }

        private string jsonPrase(object value)
        {
            var output = JsonConvert.SerializeObject(value);
            return output;
        }
        /*get string error return JSON format
         */
        protected string raiseMsgJSON()
        {
            return this.jsonPrase(this._context._msg.getMsg());
        }
        //1. Select ////////////////////////////
        //Select data by single table
        private IEnumerable<dynamic> select(string table, int id = 0)
        {
            string filter = this._context.getQueryFilter();
            if (this._context.active == true)
                filter += " _active=1 ";
            else
                filter += " _active=0 ";
            var rows = this._context._db.Select(table, id, this._context.getQuerySelect(), this._context.getQueryFilter(), this._context.getQueryCount());
            return rows;

        }
        //Select data by query string
        private IEnumerable<dynamic> Execute(string query, bool builder = true)
        {
            //check filter ??? => add more

            //check 
            var rows = this._context._db.ExecuteQuery(query, builder);
            return rows;
        }
        //2. Insert /////////////////////
        private IEnumerable<dynamic> add(string table, Dictionary<string, string> columns)
        {
            dynamic result = new ExpandoObject();
            long new_id = this._context._db.Insert(table, columns);
            if (new_id > 0)
            {
                return raiseSuccess("_ADD_SUCCESS_", new_id.ToString());
            }
            return raiseSuccess("_ADD_FAIL_");
        }
        //5. Update action
        //[HttpPost]
        private IEnumerable<dynamic> update(string table, Dictionary<string, string> columns, long id)
        {
            dynamic result = new ExpandoObject();
            if (this._context._db.Update(table, columns, id))
                return raiseSuccess("_UPDATE_SUCCESS_");
            return raiseFail("_UPDATE_FAIL_");
        }
        //6. Delete action
        //[HttpPost]
        private IEnumerable<dynamic> delete(string table, long id)
        {
            //check child data
            if (this._context._db.checkExistColumn(table, "parent_id"))
            {
                if (this._context._db.getValueByColumn(table, "id", "parent_id", id.ToString()).Count > 0)
                    return raiseFail("_DATA_HAS_BEEN_USED_");
            }
            //???check link with other table base on Model config XML
            long r = this._context._db.Delete(table, id);
            if (r > 0)
                return raiseSuccess("_DELETE_SUCCESS_", r.ToString());
            return raiseFail("_DELETE_FAIL_", r.ToString());
        }
        //Raise message to client function
        protected IEnumerable<dynamic> raiseSuccess(string msg, string num = "")
        {
            dynamic result = new ExpandoObject();
            IEnumerable<dynamic> r = Enumerable.Empty<dynamic>();
            result.status = 0;
            result.id = num;
            result.msg = this._context._lang.getLang(msg);
            r = new[] { result };
            return r;
        }
        protected IEnumerable<dynamic> raiseFail(string msg, string num = "")
        {
            dynamic result = new ExpandoObject();
            IEnumerable<dynamic> r = Enumerable.Empty<dynamic>();
            result.status = 1;
            result.id = num;
            result.msg = this._context._lang.getLang(msg);
            r = new[] { result };
            return r;
        }
        protected void setApp(string app)
        {
            this._context._db.setApp(app);
            this._app = app;
        }
    }
}
