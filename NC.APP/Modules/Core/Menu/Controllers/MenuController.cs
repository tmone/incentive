using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using NC.CORE.NCController;
using NC.CORE.App;
using log4net;
using NC.CORE.Log;
using NC.CORE.App.System;
using NC.CORE.Context;
namespace NC.APP.Modules.Core.Menu
{
    public class MenuController : NCAPPController
    {
        public MenuController()
        {
            //Init parameter if need       
            //
            this._app = "Menu"; ///relate to load language,  need to review after
            //
        }
        public string loadMenu()
        {
            
         
            NCMenu m_ob = new NCMenu(this._context);
            string userid = this._context._session.getSession("userid");
            var menus = m_ob.getMenuByUserID(userid);
            ViewBag.data = menus;
            var model = ViewBag;
            string str_mn = this.getRazorViewAsString(model, "~/Modules/Core/Menu/Views/Menu.cshtml");
            return str_mn;
        }

        public ActionResult Test()
        {
            return Content("Access direct!");
        }
    }
}