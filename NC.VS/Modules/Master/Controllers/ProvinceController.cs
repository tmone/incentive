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
namespace NC.VS.Modules.Master
{
    public class ProvinceController : NCVSController
    {
        public ProvinceController()
        {
            //
            this._app = "Province"; ///relate to load language,  need to review after
            //
            
        }
        //========== 1. USERS ===============================================
        public ActionResult Index()
        {
            return View("/Modules/Master/Views/Province/Index.cshtml");
        }
        
    }
}