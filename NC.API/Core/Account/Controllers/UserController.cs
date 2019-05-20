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
using NC.CORE.App.NCAccount;
using Newtonsoft.Json;
using Dapper;

namespace NC.API.Core.Account.Controllers
{
    public class UserController : NCAPIController
    {
        public UserController()
        {
            this.setApp("Account");
        }
        public IHttpActionResult Get()
        {
            return Ok(base.Get("nc_core_user"));
        }
        //GET api/core/<controller>/<id>?token=
        public IHttpActionResult Get(int id)
        {
            return Ok(base.Get("nc_core_user", id));
        }
        //POST api/core/<controller>?token=
        public IHttpActionResult Post([FromBody]FormDataCollection formDataCollection)
        {
            //NCLogger.Debug("POST:" + formDataCollection.Get("Orgcharts"));
            //return Ok(); 
            var p = base.Post("nc_core_user", formDataCollection);
            var userLib = new NCUser(_context);
            userLib.addDefaultRole(p.First().id);
            return Ok(p);
        }
        //PUT api/core/<controller>/<id>?token=
        public IHttpActionResult Put(long id, FormDataCollection formDataCollection)
        {
            return Ok(base.Put("nc_core_user", id, formDataCollection));
        }
        //DELETE api/core/<controller>/<id>?token=
        public IHttpActionResult Delete(long id)
        {
            if (id == 1)
                return Ok();
            return Ok(base.Delete("nc_core_user", id));
        }
        [HttpGet]
        [Route("api/core/user/getCurrentId")]
        public String GetCurrentId()
        {
            return _context._token.getUserID();
        }
        [HttpGet]
        [Route("api/core/user/getOrgId")]
        public String GetOrgId()
        {
            return _context._token.getOrgID();
        }
        [HttpGet]
        [Route("api/core/user/getUserName")]
        public String GetUserName()
        {
            var rs = "";
            var d = _context._db.Select("nc_core_user", Int32.Parse(_context._token.getUserID()), select: "username").FirstOrDefault();
            try
            {
                rs = d.username;
            }
            catch (Exception e)
            {
                NCLogger.Error(e);
            }
            return rs;

        }
        [HttpGet]
        [Route("api/core/user/getRoleByUser/{id:int}")]
        public dynamic GetRoleByUser(int id)
        {
            var userLib = new NCUser(this._context);
            return Ok(userLib.getRoleByUserID(id.ToString()));
        }


        [HttpPost]
        [Route("api/core/user/isValidUserCode")]
        public String IsValidUserCode([FromBody]FormDataCollection form)
        {
            var rs = new Dictionary<string, object>();
            rs.Add("Message", "user is ok.");
            rs.Add("Result", true);

            var user_code = form.Get("user_code");
            var user_id = form.Get("user_id");
            if (user_id == null)
            {
                user_id = "0";
            }
            if (user_code == "admin")
                return JsonConvert.SerializeObject(rs);
            if (string.IsNullOrEmpty(user_code) || user_code.Length < 5 || Int32.Parse(user_code) < 10000 || Int32.Parse(user_code) > 10000000)
            {
                rs["Result"] = false;
                rs["Message"] = "Value is number at least 5 to 7 digit";
            }
            else
            {

                var c = _context._db.Select("nc_core_user", filter: "username=N'" + user_code + "' and id<>" + user_id);
                if (c.Count() > 0)
                {
                    rs["Result"] = false;
                    rs["Message"] = "Value is duplicate....";
                }
            }
            return JsonConvert.SerializeObject(rs);
            //_context._token.("userid");
        }
        [HttpPost]
        [Route("api/core/user/ChangePassword")]
        public string ChangePassword([FromBody]FormDataCollection form)
        {
            NCUser user = new NCUser(this._context);
            string oldpass = form.Get("oldpass");
            string newpass = form.Get("newpass");
            string newpassconfirm = form.Get("newpassconfirm");
            if (oldpass == "")
                return this._context._lang.getLang("_OLD_PASSWORD_IS_EMPTY_");
            else if (newpass == "")
                return this._context._lang.getLang("_NEW_PASSWORD_IS_EMPTY_");
            else if (newpass != newpassconfirm)
                return this._context._lang.getLang("_NEW_PASSWORD_NOT_MATCH_");
            else if (user.MatchCurrentPassword(this._context._token.getUserID(), oldpass))
            {
                user.UpdatePassword(this._context._token.getUserID(), newpass);
            }
            else
            {
                return this._context._lang.getLang("_PASSWORD_NOT_MATCH_");
            }
            return this._context._lang.getLang("_PASSWORD_CHANGED_");
        }

        [HttpGet]
        [Route("api/core/user/GetMyFriend")]
        public IHttpActionResult GetMyFriend()
        {
            var id = "0";
            try
            {
                id = _context._token.getUserID();
            }
            catch { }

            String varname1 = "";
            varname1 = varname1 + "SELECT DISTINCT a.id, a.username, a.firstname, a.lastname, (select org_name from nc_core_orgchart where id = b.orgchart_id) as org_name " + "\n";
            varname1 = varname1 + "FROM   nc_core_user a " + "\n";
            varname1 = varname1 + "       JOIN nc_core_user_orgchart b " + "\n";
            varname1 = varname1 + "         ON a.id = b.user_id  and a._active = 1 and a._deleted = 0  and b._deleted = 0 and b._active =1" + "\n";
            varname1 = varname1 + "WHERE  b.orgchart_id IN (SELECT orgchart_id " + "\n";
            varname1 = varname1 + "                         FROM   nc_core_user_orgchart " + "\n";
            varname1 = varname1 + "                         WHERE  user_id = " + id + "  and _active = 1 and _deleted = 0) " + "\n";
            //varname1 = varname1 + "       AND b.user_id <> "+id;
            return Ok(_context._db._conn.Query(varname1));
        }

        [HttpGet]
        [Route("api/core/user/GetUserInOrgchart")]
        public IHttpActionResult GetUserInOrgchart()
        {
            var id = "1=0";
            try
            {
                id = _context.getURLParam("$filter");
                id = id.Replace("eq", "=");
            }
            catch { }

            String varname1 = "";
            varname1 = varname1 + "SELECT a.[id], " + "\n";
            varname1 = varname1 + "       a.[username], " + "\n";
            varname1 = varname1 + "       a.[password], " + "\n";
            varname1 = varname1 + "       a.[email], " + "\n";
            varname1 = varname1 + "       a.[firstname], " + "\n";
            varname1 = varname1 + "       a.[lastname], " + "\n";
            varname1 = varname1 + "       a.[sex], " + "\n";
            varname1 = varname1 + "       a.[brithday], " + "\n";
            varname1 = varname1 + "       a.[avatar], " + "\n";
            varname1 = varname1 + "       a.[location], " + "\n";
            varname1 = varname1 + "       a.[province], " + "\n";
            varname1 = varname1 + "       a.[district], " + "\n";
            varname1 = varname1 + "       a.[subdistrict], " + "\n";
            varname1 = varname1 + "       a.[fulladdress], " + "\n";
            varname1 = varname1 + "       a.[org_id], " + "\n";
            varname1 = varname1 + "       a.[_active], " + "\n";
            varname1 = varname1 + "       a.[_deleted], " + "\n";
            varname1 = varname1 + "       a.[_createdate], " + "\n";
            varname1 = varname1 + "       a.[_updatedate], " + "\n";
            varname1 = varname1 + "       a.[_orc_user_name], " + "\n";
            varname1 = varname1 + "       a.[_orc_pass], " + "\n";
            varname1 = varname1 + "       a.[_orc_user_id], " + "\n";
            varname1 = varname1 + "       a.[_orc_sync], " + "\n";
            varname1 = varname1 + "       b.orgchart_id as org " + "\n";
            varname1 = varname1 + "FROM   [kevncore].[dbo].[nc_core_user] a " + "\n";
            varname1 = varname1 + "       JOIN [dbo].[nc_core_user_orgchart] b " + "\n";
            varname1 = varname1 + "         ON a.id = b.user_id " + "\n";
            varname1 = varname1 + "            AND a._active = 1 " + "\n";
            varname1 = varname1 + "            AND a._deleted = 0 " + "\n";
            varname1 = varname1 + "            AND b._active = 1 " + "\n";
            varname1 = varname1 + "            AND b._deleted = 0 " + "\n";
            if (!String.IsNullOrEmpty(id))
            {
                varname1 = varname1 + "WHERE " + id;
            }

            return Ok(_context._db._conn.Query(varname1));
        }

        [HttpGet]
        [Route("api/core/user/GetUserInOrgchart/{id:int}")]
        public IHttpActionResult GetUserInOrgchart(int id)
        {
            return Ok(_context._db.Select("nc_core_user", id));
        }
    }
}