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

namespace NC.API.Core.System.Controllers
{
    public class CraftPageActionUserController : NCAPIController
    {
        public CraftPageActionUserController()
        {
            this.setApp( "CraftPageActionUser");
        }

        public IHttpActionResult Get()
        {
            return Ok(base.Get("nc_sc_page_craft_action_callback_user"));
        }
        //GET api/core/<controller>/<id>?token=
        public IHttpActionResult Get(int id)
        {
            return Ok(base.Get("nc_sc_page_craft_action_callback_user", id));
        }
        //POST api/core/<controller>?token=
        public IHttpActionResult Post([FromBody]FormDataCollection formDataCollection)
        {
            //NCLogger.Debug("POST:" + formDataCollection.Get("org_name"));
            //return Ok();
            return Ok(base.Post("nc_sc_page_craft_action_callback_user", formDataCollection));
        }
        //PUT api/core/<controller>/<id>?token=
        public IHttpActionResult Put(long id, FormDataCollection formDataCollection)
        {
            return Ok(base.Put("nc_sc_page_craft_action_callback_user", id, formDataCollection));
        }
        //DELETE api/core/<controller>/<id>?token=
        public IHttpActionResult Delete(long id)
        {
            return Ok(base.Delete("nc_sc_page_craft_action_callback_user", id));
        }
    }
}