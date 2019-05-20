using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using NC.CORE.NCController;
using NC.CORE.App;
using log4net;
using NC.CORE.Log;
using NC.CORE.Session;

namespace NC.APP.Modules.Core.Bootstrap.Controllers
{
    public class BootstrapController : NCAPPController
    {
        public BootstrapController()
        {
            
            //
            this.setApp("Bootstrap"); ///relate to load language,  need to review after
            //
        }
        public ActionResult Load(int? id)//page id
        {
            //set Mode = product || debug
            Dictionary<string, string> p = new Dictionary<string, string>();
            p.Add("mode","debug");
            //TEST MODE
            if (id == null)
            {
                id = 0;
            }
            this._context.setConfig(p);           
            return this.LoadPage((int)id);
        }

    }
}