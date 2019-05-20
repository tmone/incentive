//NCTOKEN

using System;
using System.Collections.Generic;
using System.Web;
using NC.CORE.Log;
using NC.CORE.Context;
namespace NC.CORE.Token
{
    public class NCToken
    {
        private NCContext _context = new NCContext();
        string _token = "";
        public NCToken(NCContext context)
        {
            this._context = context;
        }
        public void setToken(string tk)
        {
            this._token = tk;
        }
        public string getToken()
        {
            return this._token;
        }
        public bool checkAPIToken()
        {
            if (this._context._db.getFirstValueByColumn("nc_core_session", "userid", "sessionid", this._token, false) != "")
                return true;
            return false;
        }
        public string getUserID()
        {
            return this._context._db.getFirstValueByColumn("nc_core_session", "userid", "sessionid", this._token, false);
        }
        public string getOrgID()
        {
            NCLogger.Debug("ORG_ID:" + this.getUserID());
            return this._context._db.getFirstValueByColumn("nc_core_session", "orgchart_id", "userid", this.getUserID(),false);
        }
        public bool checkAPIToken(string token)
        {
            if (this._context._db.getFirstValueByColumn("nc_core_session", "userid", "sessionid", token, false) != "")
                return true;
            return false;
        }
        public string getAPISessionLang()
        {
            return this._context._db.getFirstValueByColumn("nc_core_session", "lang", "sessionid", this._token, false);
        }
        public string Login()
        {
            return "";
        }
        private string generateToken()
        {
            return "";
        }
    }
}
