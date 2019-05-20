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
    [RoutePrefix("api/Accounting/KPISaler")]
    public class KPISalerController : NCAPIController
    {
        public KPISalerController()
        {
            this.setApp("Accounting");
        }
        [Route("")]
        public IHttpActionResult Get()
        {
            return Ok(base.Get("nc_acc_kpi_saler"));
        }
        //GET api/core/<controller>/<id>?token=
        [Route("{id:int}")]
        public IHttpActionResult Get(int id)
        {
            return Ok(base.Get("nc_acc_kpi_saler", id));
        }
        //POST api/core/<controller>?token=
        [Route("")]
        public IHttpActionResult Post([FromBody]FormDataCollection formDataCollection)
        {
            //NCLogger.Debug("POST:" + formDataCollection.Get("org_name"));
            //return Ok();
            return Ok(base.Post("nc_acc_kpi_saler", formDataCollection));
        }
        //PUT api/core/<controller>/<id>?token=
        [Route("{id:int}")]
        public IHttpActionResult Put(long id, FormDataCollection formDataCollection)
        {
            return Ok(base.Put("nc_acc_kpi_saler", id, formDataCollection));
        }
        //DELETE api/core/<controller>/<id>?token=
        [Route("{id:int}")]
        public IHttpActionResult Delete(long id)
        {
            return Ok(base.Delete("nc_acc_kpi_saler", id));
        }
        [HttpGet]
        [Route("Saler")]
        public IHttpActionResult Saler()
        {
            return Ok(_context._db._conn.Query(@"select distinct usr.username as id, usr.firstname, usr.lastname, 
            concat('[',usr.username,'] ',usr.lastname,' ',usr.firstname) as CodeName,
            rol.from_date, rol.to_date,
            pos.name as postion, zon.name as zone
            from nc_core_user usr 
            left join nc_acc_kpi_saler_role rol on rol.[user] = usr.id
            left join nc_acc_kpi_postion pos on pos.id = rol.postion
            left join nc_acc_kpi_zone zon on zon.id = rol.zone
            where rol._active = 1 and rol._deleted = 0"));
        }

    }
}