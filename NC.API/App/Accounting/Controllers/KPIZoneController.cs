using System.Web.Http;
using NC.CORE.NCController;
using System.Net.Http.Formatting;
using Dapper;
using System.Data;
using System;
using NC.CORE.App.NCAccount;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using Newtonsoft.Json;
using System.Linq;

namespace NC.API.App.Accounting.Controllers
{
    [RoutePrefix("api/Accounting/KPIZone")]
    public class KPIZoneController : NCAPIController
    {
        public KPIZoneController()
        {
            this.setApp("Accounting");
        }
        [Route("")]
        public IHttpActionResult Get()
        {
            return Ok(base.Get("nc_acc_kpi_zone"));
        }
        //GET api/core/<controller>/<id>?token=
        [Route("{id:int}")]
        public IHttpActionResult Get(int id)
        {
            return Ok(base.Get("nc_acc_kpi_zone", id));
        }
        //POST api/core/<controller>?token=
        [Route("")]
        public IHttpActionResult Post([FromBody]FormDataCollection formDataCollection)
        {
            //NCLogger.Debug("POST:" + formDataCollection.Get("org_name"));
            //return Ok();
            return Ok(base.Post("nc_acc_kpi_zone", formDataCollection));
        }
        //PUT api/core/<controller>/<id>?token=
        [Route("{id:int}")]
        public IHttpActionResult Put(long id, FormDataCollection formDataCollection)
        {
            return Ok(base.Put("nc_acc_kpi_zone", id, formDataCollection));
        }
        //DELETE api/core/<controller>/<id>?token=
        [Route("{id:int}")]
        public IHttpActionResult Delete(long id)
        {
            return Ok(base.Delete("nc_acc_kpi_zone", id));
        }

        
    }
}