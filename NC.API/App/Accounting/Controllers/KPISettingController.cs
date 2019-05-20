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
using System.Threading.Tasks;

namespace NC.API.App.Accounting.Controllers
{
    [RoutePrefix("api/Accounting/KPISetting")]
    public class KPISettingController : NCAPIController
    {
        public KPISettingController()
        {
            this.setApp("Accounting");
        }
        [Route("")]
        public IHttpActionResult Get()
        {
            return Ok(base.Get("nc_acc_kpi_setting"));
        }
        //GET api/core/<controller>/<id>?token=
        [Route("{id:int}")]
        public IHttpActionResult Get(int id)
        {
            return Ok(base.Get("nc_acc_kpi_setting", id));
        }
        //POST api/core/<controller>?token=
        [Route("")]
        public IHttpActionResult Post([FromBody]FormDataCollection formDataCollection)
        {
            //NCLogger.Debug("POST:" + formDataCollection.Get("org_name"));
            //return Ok();
            return Ok(base.Post("nc_acc_kpi_setting", formDataCollection));
        }
        //PUT api/core/<controller>/<id>?token=
        [Route("{id:int}")]
        public IHttpActionResult Put(long id, FormDataCollection formDataCollection)
        {
            return Ok(base.Put("nc_acc_kpi_setting", id, formDataCollection));
        }
        //DELETE api/core/<controller>/<id>?token=
        [Route("{id:int}")]
        public IHttpActionResult Delete(long id)
        {
            return Ok(base.Delete("nc_acc_kpi_setting", id));
        }
        [HttpPost]
        [Route("update_kpi")]
        public IHttpActionResult Update_KPI(long id)
        {
            var t = new Task(() => {
                _context._db._conn.Execute("dbo.portal_kpi");
            });
            t.Start();

            var ts = new Task(() => {
                _context._db._conn.Execute("dbo.portal_data_new");
            });
            ts.Start();
            return Ok();
        }
    }
}