using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;
using NC.CORE.NCController;
using NC.CORE.Log;
using System.Net.Http.Formatting;
using System.Net.Http.Headers;
using System.Web.Http.Results;
using System.Text;
using NC.CORE.App.System;

namespace NC.API.Core.System.Controllers
{
    public class MenuHomeController : NCAPIController
    {
        public MenuHomeController()
        {
            this.setApp ( "MenuHome");
        }
        

        [HttpPut]
        public IHttpActionResult SetHome(long id)
        {
            var menuLib = new NCMenu(this._context);
            menuLib.clearHome();
            menuLib.setHome(id);
            return Ok();
        }
    }
}