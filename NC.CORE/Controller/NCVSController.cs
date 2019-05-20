using System;
using System.Collections.Generic;
using NC.CORE.Base;
using NC.CORE.Model;
using NC.CORE.Xml;
using NC.CORE.Session;
using NC.CORE.App.System;
using System.Web.Mvc;
using System.IO;
using System.Web;
using System.Web.Routing;
using NC.CORE.Language;
using NC.CORE.Context;
using NC.CORE.Log;
namespace NC.CORE.NCController
{
    public class NCVSController : Controller
    {
        public string _app;
        public NCContext _context = new NCContext();
        //Init
        protected override void Initialize(System.Web.Routing.RequestContext requestContext)
        {
            base.Initialize(requestContext);
            //NCLogger.Debug("Initialize");
            this.init();
            //MODE DEBUG
            //this._context._session.setSession("userid", "1");

           
            string controller = requestContext.RouteData.Values["controller"].ToString();
            string action = requestContext.RouteData.Values["action"].ToString();
            
            if (this._context._session.getSession("userid") == "")
            {
                NCLogger.Debug("CONTROLLER:" + controller+" | "+action);
                if (!(controller == "Account" && (action == "Login" || action == "CheckLogin")))
                {
                    Response.Write("<script>document.location.href=\""+this._context.getBaseUrl()+"\";</script>");
                    Response.Flush();
                    Response.End();
                }
            }
        }
        //set Context
        public void setContext(NCContext context)
        {
            this._context = context;
        }
        //0. Main controller load Page
      
        //2.
        public List<NCDTOMsg> raiseMsg()
        {
            return this._context._msg.getMsg();
        }
        //2. List action
        //[HttpGet]
        public ActionResult List(string table)
        {

            return View();
        }
        //3. Edit action
        //[HttpGet]
        public ActionResult Edit(string table, int id)
        {
            return View();
        }
        //4. Insert action
        //[HttpPost]
        public string add(string table)
        {
            Dictionary<string, string> var = this.getVarPOST();
            long id = this._context._db.Insert(table, var);
            if (id > 0)
                return "";
            else
                return "";
        }
        //5. Update action
        //[HttpPost]
        public string update(string table)
        {
            Dictionary<string, string> var = this.getVarPOST();
            if (var != null)
            {
                if (var.ContainsKey("id"))
                {
                    long id = Int64.Parse(var["id"]);
                    bool r = this._context._db.Update(table, var, id);
                    if (r)
                        return "";
                    else
                        return "";
                }
                else
                {
                    return "";
                }
            }
            else
                return "";
        }
        //6. Delete action
        //[HttpPost]
        public string delete(string table)
        {
            Dictionary<string, string> var = this.getVarPOST();
            if (var != null)
            {
                if (var.ContainsKey("id"))
                {
                    long key = Int64.Parse(var["id"]);
                    long r = this._context._db.Delete(table, key);
                    if (r > 0)
                        return "";
                    else
                        return "";
                }
                {
                    return "";
                }
            }
            else
                return "";
        }
        //
        public void init(Dictionary<string, string> config = null)
        {
            //
            // Some object can not access from libraries class, we need pass them from inherit class
            //

            /*2 Set Parameters config from inherit class
            /- DB Connection string
            /- 
            */
            NCLogger.Debug("==INIT==");
            //this._context.setParams(config);
            //4. check & init DB object
            if (!this._context._db.checkConnection())//Default connection string read from web.conf
            {
                this._context._msg.setDanger("DB_INIT_ERROR: Cannot initial Database", 0);
            }
            this._context._session = new NCSession(this._context);
            //<!---5. load Language
            this._context._lang = new NCLanguage(this._context);
            //load Core language
            this._context._lang.loadLang("CORE", this._context._session.getSession("lang"));
            //load App language
            this._context._lang.loadLang(this._app, this._context._session.getSession("lang"));
            ////--load Language--!>
            this._context._session.updateSession();
        }
        //1. init Config Object Array
        //public void initConfig(string path)
        //{
        //    if (!this._conf.load(@"" + path + "/Config/conf.xml"))
        //    {
        //        this._base._msg.setDanger("MODULE_PATH_CONFIG is Not Valid: " + path + "/Config/conf.xml", 0);
        //    }
        //}

        //.
        //2. init DB
        public bool initDB()
        {
            //NCLogger.Error("Controller:"+ this._params["DB_CONN_STR"]);
            return this._context._db.initConnection(this._context._config["DB_CONN_STR"]);
        }

        //1. Transfer HTTP Post param to Dictionary  => file form ?
        //<!-- Get Enviroment varian
        public Dictionary<string, string> getVarPOST()
        {
            //
            var keys = Request.Form.Keys;
            Dictionary<string, string> list = new Dictionary<string, string>();
            foreach (string key in keys)
            {
                list.Add(key, Request.Form[key].ToString());
            }
            return list;
        }
        public string getVarPOST(string name)
        {
            //
            return Request.Form[name];
        }
        //2. Transfer HTTP GET param to Dictionary
        public Dictionary<string, string> getVarGET()
        {
            var keys = Request.QueryString.Keys;
            Dictionary<string, string> list = new Dictionary<string, string>();
            foreach (string key in keys)
            {
                list.Add(key, Request.QueryString[key].ToString());
            }
            return list;
        }
        public string getVarGET(string name)
        {
            return Request.QueryString[name].ToString();
        }
        protected void setApp(string app)
        {
            this._context._db.setApp(app);
            this._app = app;
        }
    }
}
