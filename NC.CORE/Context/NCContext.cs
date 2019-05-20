using System.Collections.Generic;
using NC.CORE.Model;
using NC.CORE.Language;
using NC.CORE.Base;
using NC.CORE.Session;
using NC.CORE.Token;
using NC.CORE.Log;
using System.Collections.Specialized;
using System.Web;

namespace NC.CORE.Context
{
    public class NCContext
    {
        public NCMSSQLBase _db = new NCMSSQLBase();
        //public NCMSSQLBase _db_api = new NCMSSQLBase();
        //public NCMSSQLBase _db_kes_web = new NCMSSQLBase();
        //public NCMSSQLBase _db_kes_mobile = new NCMSSQLBase();
        public NCOracle _db_orc = new NCOracle();
        public Dictionary<string, string> _config = new Dictionary<string, string>();
        public NCLanguage _lang;
        public NCBMsg _msg = new NCBMsg();
        public NCToken _token;
        public NCSession _session;
        public NCUser _user = new NCUser();
        public bool active = true;
        private string _select = "";
        private string _filter = "";
        private string _sort = "";
        private string _count = "";
        public Dictionary<string, string> _URL_params = new Dictionary<string, string>();

        public NCContext()
        {
            //set connection string, other defaul
            //this._db_api.initConnection("KE_DB_API");
            //this._db_kes_web.initConnection("KE_DB_KES_WEB");
            //this._db_kes_mobile.initConnection("KE_DB_KES_MOBI");
        }
        public void setDBUserContext(NCUser user)
        {
            this._db.setDBUserContext(user);
        }
        public void setConfig(Dictionary<string, string> p = null)
        {
            //NCLogger.Error("SETPARAM");
            if (p != null)
                foreach (KeyValuePair<string, string> k in p)
                {
                    //NCLogger.Error("ERRO" + k.Key + ":" + k.Value);
                    this._config.Add(k.Key, k.Value);
                }
        }
        public string getURLParam(string p)
        {
            if (this._URL_params.ContainsKey(p))
                return this._URL_params[p];
            return "";
        }
        // SQL Operator
        public void setQueryParam(NameValueCollection p)
        {
            foreach (string key in p.AllKeys)
            {
                this._URL_params.Add(key, p[key]);
            }
            if (p["$select"] != null)
                this.setSelect(p["$select"]);
            if (p["$filter"] != null)
            {
                string s = p["$filter"];
                // =
                s = s.Replace("eq", "=");
                // >
                s = s.Replace("eq", "gr");
                // >=
                s = s.Replace("eq", "gre");
                //<
                s = s.Replace("eq", "le");
                //<=
                s = s.Replace("eq", "lee");
                //<>
                s = s.Replace("eq", "ne");
                this.setFilter(s);
            }
            if (p["$sort"] != null)
            {
                this.setSort(p["$sort"]);
            }
            if (p["$count"] != null)
            {
                this.setCount(p["$count"]);
            }
        }
        private void setFilter(string f)
        {
            this._filter = f;
        }
        private void setSelect(string s)
        {
            this._select = s;
        }
        private void setSort(string o)
        {
            this._sort = o;
        }
        private void setCount(string c)
        {
            this._count = c;
        }
        public string getQuerySelect()
        {
            return this._select;
        }
        public string getQueryFilter()
        {
            return this._filter;
        }
        public string getQuerySort()
        {
            return this._sort;
        }
        public string getQueryCount()
        {
            return this._count;
        }
        public string getBaseUrl()
        {
            var request = HttpContext.Current.Request;
            var appUrl = HttpRuntime.AppDomainAppVirtualPath;

            if (appUrl != "/")
                appUrl = "/" + appUrl;

            var baseUrl = string.Format("{0}://{1}{2}", request.Url.Scheme, request.Url.Authority, appUrl);

            return baseUrl;
        }
    }
}
