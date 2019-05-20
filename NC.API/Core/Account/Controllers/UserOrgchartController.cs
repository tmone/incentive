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
    public class UserOrgchartController: NCAPIController
    {
        public UserOrgchartController()
        {
            this.setApp("Account");
        }
        public IHttpActionResult Get()
        {
            return Ok(base.Get("nc_core_user_orgchart"));
        }
        //GET api/core/<controller>/<id>?token=
        public IHttpActionResult Get(int id)
        {
            return Ok(base.Get("nc_core_user_orgchart", id));
        }
        //POST api/core/<controller>?token=
        public IHttpActionResult Post([FromBody]FormDataCollection formDataCollection)
        {
            //NCLogger.Debug("POST:" + formDataCollection.Get("org_name"));
            //return Ok();
            return Ok(base.Post("nc_core_user_orgchart", formDataCollection));
        }
        //PUT api/core/<controller>/<id>?token=
        public IHttpActionResult Put(long id, FormDataCollection formDataCollection)
        {
            
            return Ok(base.Put("nc_core_user_orgchart", id, formDataCollection));
        }
        //DELETE api/core/<controller>/<id>?token=
        [HttpDelete]
        [Route("api/core/userorgchart/{id:int}")]
        public IHttpActionResult Delete(long id)
        {
            return Ok(base.Delete("nc_core_user_orgchart", id));
        }
        [HttpDelete]
        [Route("api/core/userorgchart/ClearOrgchartByUserId/{id:int}")]
        public IHttpActionResult ClearOrgchartByUserId(long id)
        {
            var userLib = new NC.CORE.App.NCAccount.NCUser(this._context);
            return Ok(userLib.deleteLinkOrgchart(id));
        }
        [HttpGet]
        [Route("api/core/userorgchart/GetOrgchartByUserId/{id:int}")]
        public IHttpActionResult GetOrgchartByUserId(long id)
        {
            return Ok(_context._db.Select("nc_core_user_orgchart",filter:"user_id="+id));
        }

        [HttpPut]
        [Route("api/core/userorgchart/UpdateOrgchartByUserId/{id:int}")]
        public IHttpActionResult UpdateOrgchartByUserId(long id, FormDataCollection formDataCollection)
        {
            var list = "";
            try
            {
                list = formDataCollection.Get("ol");
                var userLib = new NC.CORE.App.NCAccount.NCUser(this._context);
                userLib.deleteLinkOrgchart(id);
                userLib.addLinkOrgchart(id.ToString(), list);
            }
            catch
            {

            }
            
            return Ok();
        }

    }
}