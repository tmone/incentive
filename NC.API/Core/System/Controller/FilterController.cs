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
using System.Dynamic;
using System.Text.RegularExpressions;

namespace NC.API.Core.System.Controllers
{
    public class FilterController : NCAPIController
    {
        public FilterController()
        {
            this.setApp("Filter");
        }
        public IHttpActionResult Get()
        {
            return Ok(_context._db.Select("nc_sc_table_filter", select: "*,(select app_id from (select table_name as tn, app_id from [dbo].[nc_sc_table]) a where a.tn = table_name) as app_id"));
        }
        //GET api/core/<controller>/<id>?token=
        public IHttpActionResult Get(int id)
        {
            return Ok(base.Get("nc_sc_table_filter", id));
        }
        //POST api/core/<controller>?token=
        public IHttpActionResult Post([FromBody]FormDataCollection formDataCollection)
        {
            //NCLogger.Debug("POST:" + formDataCollection.Get("org_name"));
            //return Ok();
            return Ok(base.Post("nc_sc_table_filter", formDataCollection));
        }
        //PUT api/core/<controller>/<id>?token=
        public IHttpActionResult Put(long id, FormDataCollection formDataCollection)
        {
            return Ok(base.Put("nc_sc_table_filter", id, formDataCollection));
        }
        //DELETE api/core/<controller>/<id>?token=
        public IHttpActionResult Delete(long id)
        {
            _context._db.Delete("nc_sc_table_role", "filter_id=" + id.ToString());
            _context._db.Delete("nc_sc_table_user", "filter_id=" + id.ToString());
            return Ok(base.Delete("nc_sc_table_filter", id));
        }
        [Route("api/core/filter/getTable")]
        [HttpGet]
        public IHttpActionResult GetTable()
        {
            return Ok(_context._db.Select("nc_sc_table", select: "*, (select app_name from nc_sc_app where id = app_id) as app_name"));
        }
        
        [HttpDelete]
        [Route("api/core/filter/clearRole/{id:int}")]
        public IHttpActionResult clearRole(int id)
        {
            //_context._db.Delete("nc_sc_table_role", "filter_id=" + id.ToString());
            //_context._db.Delete("nc_sc_table_user", "filter_id=" + id.ToString());
            return Ok(_context._db.Delete("nc_sc_table_role", "filter_id=" + id.ToString()));
        }
        [HttpDelete]
        [Route("api/core/filter/clearUser/{id:int}")]
        public IHttpActionResult clearUser(int id)
        {
            //_context._db.Delete("nc_sc_table_role", "filter_id=" + id.ToString());
            //_context._db.Delete("nc_sc_table_user", "filter_id=" + id.ToString());
            return Ok(_context._db.Delete("nc_sc_table_user", "filter_id=" + id.ToString()));
        }

    } 
}