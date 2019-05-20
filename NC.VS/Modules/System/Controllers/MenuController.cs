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
    public class MenuController : NCVSController
    {
        public MenuController()
        {
            //
            this._app = "Menu"; ///relate to load language,  need to review after
            //
            
        }
        
        public ActionResult Index()
        {
            return View("/Modules/System/Views/Menu/Index.cshtml");
        }

        

    }
}