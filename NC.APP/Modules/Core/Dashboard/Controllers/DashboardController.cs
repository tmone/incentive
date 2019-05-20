using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using NC.CORE.NCController;
using NC.CORE.App;
using log4net;
using NC.CORE.Log;
namespace NC.APP.Modules.Dashboard
{
    public class DashboardController : NCAPPController
    {
        public DashboardController()
        {
           
            //
            this._app = "Dashboard"; ///relate to load language,  need to review after
            //
            //this.account = new NCAccount(this._db);
        }
        public ActionResult Index()
        {
            return View("~/Modules/Core/Dashboard/Views/Dashboard.cshtml");
        }
        public string sectionA()
        {
            return getRazorViewAsString(null,"~/Modules/Core/Dashboard/Views/sectionA.cshtml");
        }
    }
}