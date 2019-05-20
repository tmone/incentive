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
namespace NC.VS.Modules.System
{
    public class AppController : NCVSController
    {
        public AppController()
        {
            //
            this._app = "App"; ///relate to load language,  need to review after
            //
            
        }
        public ActionResult Manage()
        {
            return View("/Modules/System/Views/App/AppList.cshtml");
        }


    }
}