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
    public class FilterController : NCVSController
    {
        public FilterController()
        {
            //
            this._app = "Filter"; ///relate to load language,  need to review after
            //
            
        }
        
        public ActionResult Index()
        {
            return View("/Modules/System/Views/Filter/Index.cshtml");
        }
               

    }
}