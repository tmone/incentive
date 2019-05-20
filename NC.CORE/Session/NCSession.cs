using System;
using System.Collections.Generic;
using System.Web;
using NC.CORE.Log;
using NC.CORE.Context;
namespace NC.CORE.Session
{
    public class NCSession
    {
        private NCContext _context = new NCContext();
        public NCSession(NCContext context)
        {
            this._context = context;
        }
        //Get Enviroment varian -->
        //<!-- Session
        public void setSession(string key, string value)
        {
            //NCLogger.Error("Store Session ["+key + "]:" + value);
            HttpContext.Current.Session.Add(key, value);

        }
        public string getSession(string key)
        {
            if (HttpContext.Current.Session[key] != null)
                return HttpContext.Current.Session[key].ToString();
            return "";
        }
        public string getSessionID()
        {
            return HttpContext.Current.Session.SessionID;
        }
        public void updateSession()
        {
            Dictionary<string, string> columns = new Dictionary<string, string>();
            //update session

            columns.Add("lastlogin", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"));
            columns.Add("lang", this.getSession("lang"));
            columns.Add("userid", this._context._session.getSession("userid"));
            this._context._db.UpdateByColumn("nc_core_session", columns, "sessionid", this.getSessionID());

            //delete old session expired 15 minute
            this._context._db.DeleteEmpty("nc_core_session", " datediff(minute,lastlogin,GETDATE()) >60");
        }
        public void clearSession(string userid)
        {
            this._context._db.DeleteEmpty("nc_core_session", "userid='" + userid + "'");
        }
        // Session --!>
    }
}