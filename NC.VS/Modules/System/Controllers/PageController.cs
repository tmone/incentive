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
using Newtonsoft.Json;

namespace NC.VS.Modules.System
{
    public class PageController : NCVSController
    {
        public PageController()
        {
            //
            this._app = "Page"; ///relate to load language,  need to review after
            //
            
        }
        
        public ActionResult Index()
        {
            return View("/Modules/System/Views/Page/Index.cshtml");
        }

        //public ActionResult Config(long id)
        //{
        //    ViewBag.ID = id;
        //    return View("/Modules/System/Views/Page/Config.cshtml");
        //}
        public ActionResult Config(long id)
        {
            ViewBag.ID = id;
            var craftLib = new NC.CORE.App.System.NCCraft(this._context);
            var craf = craftLib.getCraftCanPage(id);
            ViewBag.CRAF = JsonConvert.SerializeObject(craf);
            return View("/Modules/System/Views/Page/Config.cshtml");
        }

        public ActionResult Build(long id)
        {
            ViewBag.ID = id;
            return View("/Modules/System/Views/Page/Build.cshtml");
        }
        public ActionResult Design(long id)
        {
            ViewBag.ID = id;
            return View("/Modules/System/Views/Page/Design.cshtml");
        }

    }
}