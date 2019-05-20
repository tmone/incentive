using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using NC.CORE.App.NCAccount;
using NC.CORE.NCController;
using log4net;
using NC.CORE.Log;
using NC.CORE.Encrypt;
namespace NC.VS.Modules.Account
{
    public class AccountController : NCVSController
    {
        NCUser user;
        public AccountController()
        {
            //
            this.setApp("Account"); ///relate to load language,  need to review after
            //
            this.user = new NCUser(this._context);
        }
        //========== 1. USERS ===============================================
        //public ActionResult Index()
        //{
        //    if (this.checkLogged())
        //    {
        //        return RedirectToAction("Account", "Login", new { area = "Modules" });
        //    }
        //    return View("/Modules/Account/Views/OrgChart/OrgChart.cshtml");
        //}
        public ActionResult AccessDeny()
        {
            return View("/Views/Account/User/AccessDeny.cshtml", this._context._lang.getLangData());
        }

        [HttpGet]
        public ActionResult Login()
        {
            //NCLogger.Error("TEST");
            if (this.checkLogged())
            {
                return RedirectToAction("Orgcharts", "Account", new { area = "Account" });
            }
            return View("~/Modules/Account/Views/User/Login.cshtml");
        }
        [HttpPost]
        public ActionResult CheckLogin()
        {
            //if user already loged, redirect to Dashboard page if they try access login page
            if (this.checkLogged())
            {
                return RedirectToAction("Orgcharts", "Account", new { area = "Account" });
            }
            //
            string username = this.getVarPOST("username");
            string password = this.getVarPOST("password");
            string userid = this.user.checkUserLogin(username, password);
            //check in DB
            if (userid!="")
            {
                //delete old session if already login before
                if (this._context._db.getFirstValueByColumn("nc_core_session", "sessionid", "userid", userid,false) != "")
                {
                    this._context._db.DeleteEmpty("nc_core_session", "userid=" + userid);
                }
                if (this.user.checkSupperAdmin(userid))
                {
                   this._context._session.setSession("userid", userid);
                    this._context._session.setSession("username", username);
                    
                    this._context._session.setSession("orgid", "1");
                    //insert to session table for check Token API
                    Dictionary<string, string> columns = new Dictionary<string, string>();
                    columns.Add("sessionid", this._context._session.getSessionID());
                    columns.Add("userid", userid);
                    columns.Add("orgchart_id", "1");
                    columns.Add("lang", this._context._session.getSession("lang"));
                    columns.Add("lastlogin", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"));
                    //
                    this._context._db.Insert("nc_core_session", columns, false);
                    //
                    return RedirectToAction("Orgcharts", "Account", new { area = "Account" });
                }
            }
            //raise message to View
            return View("~/Modules/Account/Views/User/Login.cshtml");
        }
        private bool checkLogged()
        {
            NCLogger.Error("SESSION CHECKLOGED:"+this._context._session.getSession("username"));
            if (this._context._session.getSession("userid") != "")
                return true;
            return false;
        }
        public ActionResult Users()
        {
            return View("/Modules/Account/Views/User/Index.cshtml");
        }


        //========== 2. OrgChart ===============================================
        //public string Orgchart()
        //{
        //    string userid = this._context._session.getSession("userid");
        //    string str_mn = this.getRazorViewAsString(null, "~/Modules/Core/User/Views/OrgChart.cshtml");
        //    return str_mn;
        //}
        public ActionResult Orgcharts()
        {
            return View("/Modules/Account/Views/OrgChart/OrgChart.cshtml");
        }
        //========== 3. Role ===============================================
        public ActionResult Roles()
        {
            return View("/Modules/Account/Views/Role/Role.cshtml");
        }
        
    }
}