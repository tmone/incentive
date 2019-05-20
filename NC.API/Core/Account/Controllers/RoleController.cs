﻿using System;
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
using NC.CORE.App.NCAccount;
namespace NC.API.Core.Account.Controllers
{
    public class RoleController : NCAPIController
    {
        public RoleController()
        {
            this.setApp("Account");
        }
        public IHttpActionResult Get()
        {
            var roleLib = new NCRole(this._context);
            var roleWithCountUser = roleLib.getRoleAndCountUser();
              return Ok(roleWithCountUser);
        }
        //GET api/core/<controller>/<id>?token=
        public IHttpActionResult Get(int id)
        {
              return Ok(base.Get("nc_core_role", id));
        }
        //POST api/core/<controller>?token=
        public IHttpActionResult Post([FromBody]FormDataCollection formDataCollection)
        {
            //NCLogger.Debug("POST:" + formDataCollection.Get("org_name"));
            //return Ok();
            return Ok(base.Post("nc_core_role", formDataCollection));
        }
        //PUT api/core/<controller>/<id>?token=
        public IHttpActionResult Put(long id, FormDataCollection formDataCollection)
        {
            return Ok(base.Put("nc_core_role", id, formDataCollection));
        }
        //DELETE api/core/<controller>/<id>?token=
        public IHttpActionResult Delete(long id)
        {
            if (id == 1)
                return Ok();
            return Ok(base.Delete("nc_core_role", id));
        }        
    }
}