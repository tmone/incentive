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
using Dapper;
using NC.CORE.App.NCAccount;

namespace NC.API.Core.Account.Controllers
{
    public class RoleDefaultController : NCAPIController
    {
        public RoleDefaultController()
        {
            this.setApp("Account");
        }
        [HttpGet]
        public IHttpActionResult GetDefault()
        {
            var roleLib = new NCRole(this._context);
            return Ok(roleLib.getDefaulRole());
        }

        [HttpPut]
        public IHttpActionResult SetDefault(long id)
        {
            var roleLib = new NCRole(this._context);
            roleLib.clearDefault();
            roleLib.setDefault(id);
            return Ok();
        }
    }
}