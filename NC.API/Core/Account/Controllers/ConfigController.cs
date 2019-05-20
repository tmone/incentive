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

namespace NC.API.Core.Account.Controllers
{
    public class ConfigController: NCAPIController
    {
        public ConfigController()
        {
            this.setApp("Config");
        }
        public IHttpActionResult Get()
        {
            return Ok(base.Get("nc_core_config"));
        }
        //GET api/core/<controller>/<id>?token=
        public IHttpActionResult Get(int id)
        {
            return Ok(base.Get("nc_core_config", id));
        }
        //POST api/core/<controller>?token=

        public IHttpActionResult Post([FromBody]FormDataCollection formDataCollection)
        {
            //NCLogger.Debug("POST:" + formDataCollection.Get("org_name"));
            //return Ok();
            return Ok(base.Post("nc_core_config", formDataCollection));
        }
        //PUT api/core/<controller>/<id>?token=
        [HttpPut]
        [Route("api/core/config/{id:int}")]
        public IHttpActionResult Put(long id, FormDataCollection formDataCollection)
        {
            
            return Ok(base.Put("nc_core_config", id, formDataCollection));
        }
        //DELETE api/core/<controller>/<id>?token=
        [HttpDelete]
        [Route("api/core/config/{id:int}")]
        public IHttpActionResult Delete(long id)
        {
            return Ok(base.Delete("nc_core_config", id));
        }
        [HttpDelete]
        [Route("api/core/config/ClearType")]
        public IHttpActionResult ClearType()
        {
            try
            {
                var id = _context.getURLParam("object_id");
                var obj = _context.getURLParam("object_name");
                var t = _context.getURLParam("type");
                _context._db.DeleteEmpty("nc_core_config", "type='" + t + "' and object_id = " + id+" and object_name=N'"+obj+"'");
            }
            catch
            {

            }
            return Ok();
        }
        [HttpGet]
        [Route("api/core/config/GetByType")]
        public IHttpActionResult GetByType()
        {
            try
            {
                var id = _context.getURLParam("object_id");
                var obj = _context.getURLParam("object_name");
                var t = _context.getURLParam("type");
                return Ok(_context._db.Select("nc_core_config", filter: "type='" + t + "' and object_id = " + id+" and object_name=N'"+obj+"'"));
            }
            catch
            {

            }
            return Ok();
        }

        [HttpPut]
        [Route("api/core/config/addConfig")]
        public IHttpActionResult addConfig(FormDataCollection formDataCollection)
        {

            try
            {
                var id = _context.getURLParam("object_id");
                var obj = _context.getURLParam("object_name");
                var t = formDataCollection.Get("type").Replace("'", "''");
                var key = formDataCollection.Get("key").Replace("'", "''");
                var old = _context._db.Select("nc_core_config", filter: "[name] = '" + key + "' and object_id = " + id+" and object_name =N'"+obj+"' and type =N'"+t+"'").FirstOrDefault();
                var cl = new Dictionary<string, string>();
                cl.Add("user_id", id);
                cl.Add("type",t );
                cl.Add("name", key);
                cl.Add("config", formDataCollection.Get("config").Replace("'", "''"));
                if (old == null)
                {
                    _context._db.Insert("nc_core_config", cl);
                }
                else
                {
                    _context._db.Update("nc_core_config", cl, old.id);
                }
            }
            catch
            {

            }
            return Ok();
        }

    }
}