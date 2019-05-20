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
    public class NCAPPController : Controller
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

            //NCLogger.Debug("SESSION:" + this._context._session.getSession("userid"));
        }
        //set Context
        public void setContext(NCContext context)
        {
            this._context = context;
        }
        //0. Main controller load Page
        public ActionResult LoadPage(long pageid = 0)
        {
            //1. Init parameter,
            //-- Init DB, Load language, extend or config parameters
            // NCLogger.Debug("SESSION: "+ this._context._session.getSession("userid"));
            //2. Check Session exist
            if (this._context._session.getSession("userid") == "")
            {

                return RedirectToAction("Login", "Account", new { area = "Account" });
            }
            //2.1 update user id & org id context 
            this._context._user.UserID = Int64.Parse(this._context._session.getSession("userid"));
            this._context._user.OrgID = Int64.Parse(this._context._session.getSession("orgid"));
            this._context.setDBUserContext(this._context._user);
            //3. Check access right base on PageID
            NCPage p = new NCPage(this._context);
            NCCraft c = new NCCraft(this._context);
            //bool hasACL = false;
            if (pageid == 0)
                pageid = p.getDefaultPage();
            if (!p.checkAccessRightByUserID(this._context._session.getSession("userid"), pageid.ToString()))
            {
                return RedirectToAction("AccessDeny", "Account", new { area = "Account" });
            }
            //4.Load Master Layout
            string l = this.getRazorViewAsString(null, "~/Layout/LAdmin.cshtml");
            //4.1 Load Page
            string p_html = p.loadPageLayout(pageid.ToString());

            //5. Insert Token for Authentication of API
            l = l.Replace("{{#TOKEN#}}", this._context._session.getSessionID());
            //5.1 Insert User Information
            l = l.Replace("{{#USERINFO#}}", "["+this._context._session.getSession("username") + "] " + this._context._session.getSession("fullname"));
            //5.2 Insert Page Title
            l = l.Replace("{{=PAGE_TITLE=}}", p.getPageTitle(pageid));
            //6. Load System Menu base on Access Right
            string sysmenu = this.Run("Menu", "loadMenu", this._context);
            l = l.Replace("{{=SYSMENU=}}", sysmenu);
            //7. JSON Permision
            string JS_JSON_Permision = "<script type=\"text/javascript\"> var acl=[";
            //8. Load Widgets in Page base on PageID
            //NCLayout l_ob = new NCLayout(this._context);
            //List<string> postion = l_ob.getPostionInLayout(pageid.ToString());
            List<string> postion_page = p.getPostionInPage(pageid.ToString());
            //
            p_html = p_html.Replace("class=\"container\"", "");

            if (postion_page.Count > 0)
            {
                //Load all Postion in Page
                NCCraft c_ob = new NCCraft(this._context);
                foreach (var post in postion_page)
                {
                    List<dynamic> crafts = c_ob.getCraftByPostionPage(pageid.ToString(), post.ToString());

                    // Execute Craft and return HML
                    string html = "";

                    foreach (var cr in crafts)
                    {
                        //get Permission, ACL for Widget
                        //NCLogger.Debug("ACL:"+pageid.ToString()+"-"+ this._context._session.getSession("userid"));
                        List<string> acl = c.getACL(pageid, Int32.Parse(this._context._session.getSession("userid")));
                        if (acl.Count > 0)
                        {
                            //hasACL = true;
                            JS_JSON_Permision += "{widget:\"" + cr.craft_name + "\",acl:[";
                            foreach (string ac in acl)
                            {
                                JS_JSON_Permision += "{" + ac + ":1},";
                            }
                            JS_JSON_Permision = JS_JSON_Permision.Substring(0, JS_JSON_Permision.Length - 1);
                            JS_JSON_Permision += "]}";
                        }

                        // Load View string
                        string v = this.Run(cr.controller, cr.action, this._context);

                        //. Check Permision base on Action on Form....

                        // Merge View to Layout
                        html += v;
                        //7. check Function Access Right  and remove actions are limited from new View

                    }
                    //Merge Crafts with Layout
                    p_html = p_html.Replace(post.ToString(), html);
                    //NCLogger.Debug("HTML PAGE " + p_html);
                }
            }
            //if (hasACL)
            JS_JSON_Permision += "];</script>";
            //else
            //    JS_JSON_Permision = "";
            //NCLogger.Debug(JS_JSON_Permision);
            //add ACL for widget fuction
            l = l.Replace("{{#ACL#}}", JS_JSON_Permision);
            //add page layout
            l = l.Replace("{{=PAGELAYOUT=}}", p_html);
            //Load JS

            return Content(l);
        }
        //
        
        //1. HMVC 
        //1.1 Excute Action in other Controller and return string
        public string Run(string controllerName, string actionName, NCContext context)
        {
            NCLogger.Debug(controllerName+"|"+actionName);
            var tempRequestContext = new RequestContext(Request.RequestContext.HttpContext, new RouteData());
            tempRequestContext.RouteData.DataTokens["Area"] = "";
            //tempRequestContext.RouteData.DataTokens["Namespaces"] = "NC.APP.Modules.Core";
            // get the controller
            var ctrlFactory = ControllerBuilder.Current.GetControllerFactory();

            var ctrl = ctrlFactory.CreateController(tempRequestContext, controllerName) as NCAPPController;

            //var ctrlContext = new ControllerContext(this.Request.RequestContext, ctrl);
            var ctrlContext = new ControllerContext(tempRequestContext, ctrl);

            var ctrlDesc = new ReflectedControllerDescriptor(ctrl.GetType());

            // get the action
            var actionDesc = ctrlDesc.FindAction(ctrlContext, actionName);
            //Ignore Data paremerter for next verion
            //var model = 1;
            Dictionary<string, object> data = new Dictionary<string, object>();
            data.Add("context", context);
            //Set context, because Controller can not create instance, so CONTRUCTOR from NCAPPController can not run
            var contextDesc = ctrlDesc.FindAction(ctrlContext, "setContext");
            var result2 = contextDesc.Execute(ctrlContext, data) as string;
            //Execute Action
            var result = actionDesc.Execute(ctrlContext, data) as string;

            // return the other action result as the current action result
            return result;
        }

        //1.2 Get View as String
        public string getRazorViewAsString(object model, string filePath)
        {
            var st = new StringWriter();
            var context = new HttpContextWrapper(System.Web.HttpContext.Current);
            var routeData = new RouteData();
            var controllerContext = new ControllerContext(new RequestContext(context, routeData), new NCFakeController());
            var razor = new RazorView(controllerContext, filePath, null, false, null);
            razor.Render(new ViewContext(controllerContext, razor, new ViewDataDictionary(model), new TempDataDictionary(), st), st);
            return st.ToString();
        }

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
