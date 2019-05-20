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

namespace NC.API.Core.Master.Controllers
{
    [RoutePrefix("api/Master/District")]
    public class DistrictController : NCAPIController
    {
        public DistrictController()
        {
            this.setApp("Master");
        }
        [Route("")]
        public IHttpActionResult Get()
        {
              return Ok(base.Get("nc_master_district"));
        }
        //GET api/core/<controller>/<id>?token=
        [Route("{id:int}")]
        public IHttpActionResult Get(int id)
        {
              return Ok(base.Get("nc_master_district", id));
        }
        //POST api/core/<controller>?token=
        [Route("")]
        public IHttpActionResult Post([FromBody]FormDataCollection formDataCollection)
        {
            //NCLogger.Debug("POST:" + formDataCollection.Get("org_name"));
            //return Ok();
            return Ok(base.Post("nc_master_district", formDataCollection));
        }
        //PUT api/core/<controller>/<id>?token=
        [Route("{id:int}")]
        public IHttpActionResult Put(long id, FormDataCollection formDataCollection)
        {
            return Ok(base.Put("nc_master_district", id, formDataCollection));
        }
        //DELETE api/core/<controller>/<id>?token=
        [Route("{id:int}")]
        public IHttpActionResult Delete(long id)
        {
            return Ok(base.Delete("nc_master_district", id));
        }
    }
}