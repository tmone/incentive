using System.Collections.Generic;
using Dapper;
using NC.CORE.Context;
using NC.CORE.Encrypt;
using System.Linq;
using NC.CORE.Language;
using NC.CORE.Log;
using System;

namespace NC.CORE.App.NCAccount
{
    public class NCKESUser
    {
        private NCContext _context = new NCContext();
        public NCKESUser(NCContext context)
        {
            this._context = context;
        }
        public bool checkLogin(string username,string password) {
            //string sql = "select login_password from master_user where login_name='" + username + "'";
            //string current_pass = this._context._db_kes_web._conn.ExecuteScalar<string>(sql);
            //if (Kerry.KES.Web.Repositories.Encrpytion.VerifyHash(password, "SHA256", current_pass))
               return true;
            //return false;
        }
        public string getLocationID(string userid)
        {
            //NCUser user = new NCUser(this._context);
            //string DC_Code = user.getOrgCodeByUserID(userid);
            //string sql = "select id from master_dc where dc_code='" + DC_Code + "'";
            //string LocationID =  this._context._db_kes_web._conn.ExecuteScalar<string>(sql);
            return "";
        }
    }
}
