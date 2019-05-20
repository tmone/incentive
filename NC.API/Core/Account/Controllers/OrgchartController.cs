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
using NC.CORE.App.NCAccount;

namespace NC.API.Core.Account.Controllers
{
    public class OrgchartController : NCAPIController
    {
        public OrgchartController()
        {
            this.setApp("Account");
        }
        public IHttpActionResult Get()
        {
            var orgcharLib = new NCOrgchart(this._context);
              return Ok(orgcharLib.getOrgchartAndCountUser());
        }
        //GET api/core/<controller>/<id>?token=
        public IHttpActionResult Get(int id)
        {
              return Ok(base.Get("nc_core_orgchart", id));
        }
        
        //POST api/core/<controller>?token=
        public IHttpActionResult Post([FromBody]FormDataCollection formDataCollection)
        {
            //NCLogger.Debug("POST:" + formDataCollection.Get("org_name"));
            //return Ok();
            return Ok(base.Post("nc_core_orgchart", formDataCollection));
        }
        //PUT api/core/<controller>/<id>?token=
        public IHttpActionResult Put(long id, FormDataCollection formDataCollection)
        {
            
            return Ok(base.Put("nc_core_orgchart", id, formDataCollection));
        }
        //DELETE api/core/<controller>/<id>?token=
        public IHttpActionResult Delete(long id)
        {
            return Ok(base.Delete("nc_core_orgchart", id));
        }
        [HttpGet]
        [Route("api/core/orgchart/getOrgchartCode/{id:int}")]
        public string getOrgchartCode(int id)
        {
            string rs = "";
            try
            {
                rs = _context._db.Select("nc_core_orgchart", id, select: "_orc_org_code as code").First().code;
            }
            catch { }
            return rs;
        }
        [HttpGet]
        [Route("api/core/orgchart/getOrgchartNewCode/{id:int}")]
        public string getOrgchartNewCode(int id)
        {
            string rs = "";
            try
            {
                rs = _context._db.Select("nc_core_orgchart", id, select: "code").First().code;
            }
            catch { }
            return rs;
        }
        [HttpGet]
        [Route("api/core/orgchart/getOrgchartAt/{id:int}")]
        public IHttpActionResult getOrgchartAt(int id)
        {
            String varname1 = "";
            varname1 = varname1 + "WITH n AS " + "\n";
            varname1 = varname1 + "	(SELECT * " + "\n";
            varname1 = varname1 + "	FROM [nc_core_orgchart] " + "\n";
            varname1 = varname1 + "	WHERE ID = " +id+ "\n";
            varname1 = varname1 + "	AND _deleted = 0" + "\n";
            varname1 = varname1 + "	UNION ALL " + "\n";
            varname1 = varname1 + "	SELECT nplus1.* " + "\n";
            varname1 = varname1 + "	FROM [nc_core_orgchart] as nplus1, n " + "\n";
            varname1 = varname1 + "	WHERE n.ID = nplus1.Parent_ID " + "\n";
            varname1 = varname1 + "	AND nplus1._deleted = 0)" + "\n";
            varname1 = varname1 + "	SELECT * FROM n";
            return Ok(_context._db.ExecuteQuery(varname1,false));
        }

        [HttpGet]
        [Route("api/core/orgchart/getMyOrgchart")]
        public IHttpActionResult getOrgchartAt()
        {

            var usr = _context._token.getUserID();
            String varname1 = "";
            varname1 = varname1 + "SELECT a.* " + "\n";
            varname1 = varname1 + "FROM   [dbo].[nc_core_orgchart] a " + "\n";
            varname1 = varname1 + "       JOIN [dbo].[nc_core_user_orgchart] b " + "\n";
            varname1 = varname1 + "         ON a._active = 1 " + "\n";
            varname1 = varname1 + "            AND a._deleted = 0 " + "\n";
            varname1 = varname1 + "            AND b._active = 1 " + "\n";
            varname1 = varname1 + "            AND b._deleted = 0 " + "\n";
            varname1 = varname1 + "            AND a.id = b.orgchart_id " + "\n";
            varname1 = varname1 + "WHERE  b.user_id = " + usr;
            return Ok(_context._db.ExecuteQuery(varname1, false));
        }
        [HttpGet]
        [Route("api/core/orgchart/getUserOrgchart/{id:int}")]
        public IHttpActionResult getUserOrgchart(int id)
        {


            String varname1 = "";
            varname1 = varname1 + "SELECT a.* " + "\n";
            varname1 = varname1 + "FROM   [dbo].[nc_core_orgchart] a " + "\n";
            varname1 = varname1 + "       JOIN [dbo].[nc_core_user_orgchart] b " + "\n";
            varname1 = varname1 + "         ON a._active = 1 " + "\n";
            varname1 = varname1 + "            AND a._deleted = 0 " + "\n";
            varname1 = varname1 + "            AND b._active = 1 " + "\n";
            varname1 = varname1 + "            AND b._deleted = 0 " + "\n";
            varname1 = varname1 + "            AND a.id = b.orgchart_id " + "\n";
            varname1 = varname1 + "WHERE  b.user_id = " + id;
            return Ok(_context._db.ExecuteQuery(varname1, false));
        }
    }
}