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
using Dapper;

namespace NC.APP.Modules.Core.Account.Controllers
{
    public class AccountController : NCAPPController
    {
        NCUser user;
        NCOrgchart org;
        public AccountController()
        {
            //
            this.setApp("Account"); ///relate to load language,  need to review after
            //
            this.user = new NCUser(this._context);
            this.org = new NCOrgchart(this._context);
        }
        private bool checkLogged()
        {
            //NCLogger.Error("SESSION:"+this._session.getSession("username"));
            if (this._context._session.getSession("userid") != "")
                return true;
            return false;
        }
        //========== 1. USERS ===============================================
        public ActionResult Index()
        {
            if (this.checkLogged())
            {
                return RedirectToAction("bootstrap", "exc", new { area = "Modules" });
            }
            return View("~/Modules/Core/Account/Views/User/Login.cshtml");
        }
        public ActionResult AccessDeny()
        {
            return View("~/Modules/Core/Account/Views/User/AccessDeny.cshtml", this._context._lang.getLangData());
        }

        public ActionResult Login()
        {
            //NCLogger.Error("TEST");
            if (this.checkLogged())
            {
                return RedirectToAction("bootstrap", "exc", new { area = "Modules" });
            }
            this.ViewBag.org= this.org.getOrgchartActive();
            return View("~/Modules/Core/Account/Views/User/Login.cshtml");
        }

        [HttpPost]
        public ActionResult CheckLogin()
        {
            //if user already loged, redirect to Dashboard page if they try access login page
            if (this.checkLogged())
            {
                return RedirectToAction("Index", "Dashboard", new { area = "Dashboard" });
            }
            //
            NCOrgchart org = new NCOrgchart(this._context);
            NCKESUser user_kes = new NCKESUser(this._context);
            
            //
            string username = this.getVarPOST("username");
            string password = this.getVarPOST("password");
            //string org_id= this.getVarPOST("orgchart");
            string userid = this.user.checkUserLogin(username, password);
            string org_id = this.user.getOrgIDByUserID(userid);
            //check in DB
            if (userid != "")
            {
               
                if (org.checkUserOrgchart(userid, org_id))
                {
                    this._context._session.setSession("userid", userid);
                    this._context._session.setSession("username", username);
                    this._context._session.setSession("orgid", org_id);
                    //this._context._session.setSession("kes_dc_id", user_kes.getLocationID(userid));
                    //insert to session table for check Token API
                    this._context._session.setSession("fullname", user.getFullName(userid));
                    Dictionary<string, string> columns = new Dictionary<string, string>();
                    columns.Add("sessionid", this._context._session.getSessionID());
                    columns.Add("userid", userid);
                    columns.Add("orgchart_id", org_id);
                    columns.Add("lang", this._context._session.getSession("lang"));
                    columns.Add("lastlogin", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"));
                    //

                    //
                    this._context._db.Insert("nc_core_session", columns, false);
                    //
                    return RedirectToAction("Load", "Bootstrap", new { id = 0, area = "Bootstrap" });
                }
            }
            
            this.ViewBag.org = this.org.getOrgchartActive();
            //raise message to View
            return View("~/Modules/Core/Account/Views/User/Login.cshtml");
        }
        public ActionResult Logout()
        {
            this._context._session.clearSession(this._context._session.getSession("userid"));
            Session.Abandon();
            //raise message to View
            return RedirectToAction("Login", "Account", new { area = "Account" });
        }
        //
        public string Users()
        {
            return this.getRazorViewAsString(null, "/Modules/Core/Account/Views/User/Index.cshtml");
        }
        //========== 1.1 USERS Profile===============================================
        [HttpGet]
        public string changePassword()
        {
            return this.getRazorViewAsString(null, "/Modules/Core/Account/Views/User/ChangePassword.cshtml");
        }
        //[HttpPost]
        //public string UpdatePassword()
        //{
        //    string oldpass = this.getVarPOST("oldpass");
        //    string newpass = this.getVarPOST("newpass");
        //    string newpassconfirm = this.getVarPOST("newpassconfirm");
        //    if (oldpass == "")
        //        this.ViewBag["msg"] = this._context._lang.getLang("_OLD_PASSWORD_IS_EMPTY_");
        //    else if (newpass == "")
        //        this.ViewBag["msg"] = this._context._lang.getLang("_NEW_PASSWORD_IS_EMPTY_");
        //    else if (newpass != newpassconfirm)
        //        this.ViewBag["msg"] = this._context._lang.getLang("_NEW_PASSWORD_NOT_MATCH_");
        //    else if (this.user.MatchCurrentPassword(this._context._session.getSession("userid"), oldpass))
        //    {
        //        this.user.UpdatePassword(this._context._session.getSession("userid"), newpass);
        //    }
        //    else
        //    {
        //        this.ViewBag["msg"] = this._context._lang.getLang("_PASSWORD_NOT_MATCH_");
        //    }
        //    return this.getRazorViewAsString(null, "/Modules/Core/Account/Views/User/ChangePassword.cshtml");
        //}
        //========== 2. OrgChart ===============================================
        //public string Orgchart()
        //{
        //    string userid = this._context._session.getSession("userid");
        //    string str_mn = this.getRazorViewAsString(null, "~/Modules/Core/User/Views/OrgChart.cshtml");
        //    return str_mn;
        //}
        public string Orgcharts()
        {
            return this.getRazorViewAsString(null, "~/Modules/Core/Account/Views/Orgchart/OrgChart.cshtml");
        }
        //========== 3. Role ===============================================
        public string Roles()
        {
            return this.getRazorViewAsString(null, "/Modules/Core/Account/Views/Role/Role.cshtml");
        }
    }
}