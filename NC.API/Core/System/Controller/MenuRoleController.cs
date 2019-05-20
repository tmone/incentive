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
    public class MenuRoleController : NCAPIController
    {
        public MenuRoleController()
        {
            this.setApp ( "MenuRole");
        }
        public IHttpActionResult Get()
        {
              return Ok(base.Get("nc_sc_menu_role"));
        }
        //GET api/core/<controller>/<id>?token=
        public IHttpActionResult Get(int id)
        {
              return Ok(base.Get("nc_sc_menu_role", id));
        }
        //POST api/core/<controller>?token=
        public IHttpActionResult Post([FromBody]FormDataCollection formDataCollection)
        {
            //NCLogger.Debug("POST:" + formDataCollection.Get("org_name"));
            //return Ok();
            return Ok(base.Post("nc_sc_menu_role", formDataCollection));
        }
        //PUT api/core/<controller>/<id>?token=
        public IHttpActionResult Put(long id, FormDataCollection formDataCollection)
        {
            return Ok(base.Put("nc_sc_menu_role", id, formDataCollection));
        }
        //DELETE api/core/<controller>/<id>?token=
        public IHttpActionResult Delete(long id)
        {
            var menuLib = new NC.CORE.App.System.NCMenu(this._context);
            return Ok(menuLib.clearRoleByMenuId(id));
        }
        [HttpPut]
        [Route("api/core/MenuRole/updateMenuByRole/{id:int}")]
        public IHttpActionResult updateMenu(int id)
        {
            String menuList = "";
            try { menuList = _context.getURLParam("ml"); } catch { }
            var list = menuList.Split(',');
            if (list.Length > 0)
            {
                _context._db.Delete("nc_sc_menu_role", "role_id="+id);
                foreach(var li in list)
                {
                    var tmp = new Dictionary<string, string>();
                    tmp.Add("role_id", id.ToString());
                    tmp.Add("menu_id", li);
                    tmp.Add("allow", "1");
                    _context._db.Insert("nc_sc_menu_role", tmp);
                }
            }
            return Ok();
        }
    }
}