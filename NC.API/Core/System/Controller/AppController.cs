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
    public class AppController : NCAPIController
    {
        public AppController()
        {
            this.setApp("App");
        }
        public IHttpActionResult Get()
        {
            //
            NCApp app = new NCApp(this._context);
            return Ok(app.getAppList());
        }
        //GET api/core/<controller>/<id>?token=

        //POST api/core/<controller>?token=
        public IHttpActionResult Post([FromBody]FormDataCollection formDataCollection)
        {
            var app_name = formDataCollection.Get("app_name");
            //
            NCApp app = new NCApp(this._context);
            bool r = app.installApp(app_name);
            if (r)
                return Ok(this.raiseSuccess("_INSTALL_APP_SUCCESS_"));
            else
                return Ok(this.raiseFail("_INSTALL_APP_FAIL_"));
        }

    }
}