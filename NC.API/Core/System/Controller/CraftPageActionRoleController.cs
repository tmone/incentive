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
    public class CraftPageActionRoleController : NCAPIController
    {
        public CraftPageActionRoleController()
        {
            this.setApp( "CraftPageActionRole");
        }

        public IHttpActionResult Get()
        {
            return Ok(base.Get("nc_sc_page_craft_action_callback_role"));
        }
        //GET api/core/<controller>/<id>?token=
        public IHttpActionResult Get(int id)
        {
            return Ok(base.Get("nc_sc_page_craft_action_callback_role", id));
        }
        //POST api/core/<controller>?token=
        public IHttpActionResult Post([FromBody]FormDataCollection formDataCollection)
        {
            //NCLogger.Debug("POST:" + formDataCollection.Get("org_name"));
            //return Ok();
            return Ok(base.Post("nc_sc_page_craft_action_callback_role", formDataCollection));
        }
        //PUT api/core/<controller>/<id>?token=
        public IHttpActionResult Put(long id, FormDataCollection formDataCollection)
        {
            return Ok(base.Put("nc_sc_page_craft_action_callback_role", id, formDataCollection));
        }
        //DELETE api/core/<controller>/<id>?token=
        public IHttpActionResult Delete(long id)
        {
            return Ok(base.Delete("nc_sc_page_craft_action_callback_role", id));
        }
        [HttpGet]
        [Route("api/core/CraftPageActionRole/getActionByRole/{id:int}")]
        public IHttpActionResult getActionByRole(int id)
        {
            String varname1 = "";
            varname1 = varname1 + "select distinct " + "\n";
            varname1 = varname1 + "	a.id, a.title, b.page_id , (select allow from [dbo].[nc_sc_page_craft_action_callback_role] e where page_id = b.page_id and craft_action_callback_id = a.id and _deleted = 0 and _active =1 and role_id = " + id + ") as allow " + "\n";
            varname1 = varname1 + "FROM [dbo].[nc_sc_craft_action_callback] a " + "\n";
            varname1 = varname1 + "JOIN [dbo].[nc_sc_page_craft] b on a.craft_id = b.craft_id " + "\n";
            varname1 = varname1 + "where page_id in (select c.pageid " + "\n";
            varname1 = varname1 + "from [dbo].[nc_sc_menu] c " + "\n";
            varname1 = varname1 + "join [dbo].[nc_sc_menu_role] d on c.id = d.menu_id and d._active = 1 and d.allow =1 and d._deleted = 0 " + "\n";
            varname1 = varname1 + "where d.role_id =" + id + " )";
            //varname1 = _context._db.queryBuilder(varname1);
            return Ok(_context._db.ExecuteQuery(varname1,false));
        }
        [HttpPut]
        [Route("api/core/CraftPageActionRole/updateActionByRole/{id:int}")]
        public IHttpActionResult updateActionByRole(int id)
        {
            String menuList = "";
            try { menuList = _context.getURLParam("al"); } catch { }
            var list = menuList.Split(',');
            if (list.Length > 0)
            {
                _context._db.Delete("nc_sc_page_craft_action_callback_role", "role_id=" + id);
                foreach (var li in list)
                {
                    var lis = li.Split('_');
                    var tmp = new Dictionary<string, string>();
                    tmp.Add("role_id", id.ToString());
                    tmp.Add("craft_action_callback_id", lis[0]);
                    tmp.Add("page_id", lis[1]);
                    tmp.Add("allow", "true");
                    tmp.Add("deny", "false");
                    _context._db.Insert("nc_sc_page_craft_action_callback_role", tmp);
                }
            }
            return Ok();
        }
    }
}