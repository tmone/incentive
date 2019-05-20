using System.Web.Http;
using NC.CORE.NCController;
using System.Net.Http.Formatting;

namespace NC.API.App.Master.Controllers
{
    [RoutePrefix("api/Master/Customer")]
    public class CustomerController : NCAPIController
    {
        public CustomerController()
        {
            this.setApp("Master");
        }
        [Route("")]
        public IHttpActionResult Get()
        {

            return Ok(base.Get("nc_master_customer"));
        }
        //GET api/core/<controller>/<id>?token=
        [Route("{id:int}")]
        public IHttpActionResult Get(int id)
        {
            return Ok(base.Get("nc_master_customer", id));
        }

        //POST api/core/<controller>?token=
        [Route("")]
        public IHttpActionResult Post([FromBody]FormDataCollection formDataCollection)
        {
            //NCLogger.Debug("POST:" + formDataCollection.Get("org_name"));
            //return Ok();
            return Ok(base.Post("nc_master_customer", formDataCollection));
        }
        //PUT api/core/<controller>/<id>?token=
        [Route("{id:int}")]
        public IHttpActionResult Put(long id, FormDataCollection formDataCollection)
        {
            return Ok(base.Put("nc_master_customer", id, formDataCollection));
        }
        //DELETE api/core/<controller>/<id>?token=
        [Route("{id:int}")]
        public IHttpActionResult Delete(long id)
        {
            return Ok(base.Delete("nc_master_customer", id));
        }



    }
}