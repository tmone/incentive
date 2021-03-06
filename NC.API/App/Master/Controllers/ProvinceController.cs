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
using NC.CORE.App.NCMaster;

namespace NC.API.Core.Master.Controllers
{
    [RoutePrefix("api/Master/Province")]
    public class ProvinceController : NCAPIController
    {
        public ProvinceController()
        {
            this.setApp("Master");
        }
        [Route("")]
        public IHttpActionResult Get()
        {
              return Ok(base.Get("nc_master_province"));
        }
        //GET api/core/<controller>/<id>?token=
        [Route("{id:int}")]
        public IHttpActionResult Get(int id)
        {
              return Ok(base.Get("nc_master_province", id));
        }
        //POST api/core/<controller>?token=
        [Route("")]
        public IHttpActionResult Post([FromBody]FormDataCollection formDataCollection)
        {
            //NCLogger.Debug("POST:" + formDataCollection.Get("org_name"));
            //return Ok();
            return Ok(base.Post("nc_master_province", formDataCollection));
        }
        //PUT api/core/<controller>/<id>?token=
        [Route("{id:int}")]
        public IHttpActionResult Put(long id, FormDataCollection formDataCollection)
        {
            return Ok(base.Put("nc_master_province", id, formDataCollection));
        }
        //DELETE api/core/<controller>/<id>?token=
        [Route("{id:int}")]
        public IHttpActionResult Delete(long id)
        {
            var masterLib = new NCMaster(this._context);
            var countDist = masterLib.getDistrictCount(id);
            if (countDist < 1)
            {
                return Ok(base.Delete("nc_master_province", id));
            }
            return Ok();            
        }
    }
}