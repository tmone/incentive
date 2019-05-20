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

namespace NC.API.Core.System.Controllers
{
    public class CraftAppController : NCAPIController
    {
        public CraftAppController()
        {
            this.setApp( "CraftApp");
        }
        
        //GET api/core/<controller>/<id>?token=
        public IHttpActionResult Get(int id)
        {
            var craftLib = new NC.CORE.App.System.NCCraft(this._context);
            return Ok(craftLib.getCraftOfApp(id));
        }        
    }
}