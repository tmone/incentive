using System.Web.Http;
using NC.CORE.NCController;
using System.Net.Http.Formatting;

namespace NC.API.App.Master.Controllers
{
    [RoutePrefix("api/Master/Vendor")]
    public class VendorController : NCAPIController
    {
        public VendorController()
        {
            this.setApp("Master");
        }
        [Route("")]
        public IHttpActionResult Get()
        {

            return Ok(base.Get("nc_master_vendor"));
        }
        //GET api/core/<controller>/<id>?token=
        [Route("{id:int}")]
        public IHttpActionResult Get(int id)
        {
            return Ok(base.Get("nc_master_vendor", id));
        }

        //POST api/core/<controller>?token=
        [Route("")]
        public IHttpActionResult Post([FromBody]FormDataCollection formDataCollection)
        {
            //NCLogger.Debug("POST:" + formDataCollection.Get("org_name"));
            //return Ok();
            return Ok(base.Post("nc_master_vendor", formDataCollection));
        }
        //PUT api/core/<controller>/<id>?token=
        [Route("{id:int}")]
        public IHttpActionResult Put(long id, FormDataCollection formDataCollection)
        {
            return Ok(base.Put("nc_master_vendor", id, formDataCollection));
        }
        //DELETE api/core/<controller>/<id>?token=
        [Route("{id:int}")]
        public IHttpActionResult Delete(long id)
        {
            return Ok(base.Delete("nc_master_vendor", id));
        }



    }
}