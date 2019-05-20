using System.Collections.Generic;
using Dapper;
using NC.CORE.Context;
using NC.CORE.Session;
using NC.CORE.Log;
namespace NC.CORE.Language
{
    public class NCLanguage
    {

        private Dictionary<string, string> _lang = new Dictionary<string, string>();
        private NCContext _context = new NCContext();
        public NCLanguage(NCContext context)
        {
            this._context = context;
        }
        public  void loadLang(string app_name,string lang = "")
        {
            if (lang == "")
                lang = this.getLangDefault();
            string sql = "select lang_key as id,lang_value as val " +
                        " from nc_core_language_content,nc_core_language,nc_sc_app " +
                        " where nc_core_language_content.lang_id=nc_core_language.id and nc_sc_app.id=nc_core_language_content.app_id " +
                        " and app_name='"+ app_name + "' and nc_core_language.lang_short_name='" + lang+"' "+
                        "and nc_core_language_content._active=1 and nc_core_language_content._deleted=0";
            this._lang = this._context._db.SelectToDictionary(sql);
        }
        public string getLang(string key)
        {
            if (this._lang.ContainsKey(key))
                return this._lang[key];
            else
                return key;
        }
        public string getLangDefault()
        {
            if (this._context._db._conn == null)
                NCLogger.Debug("DB NULL");
            return this._context._db._conn.ExecuteScalar("select top 1 lang_short_name from nc_core_language where [default]=1").ToString();
        }
        public Dictionary<string,string> getLangData()
        {
            return this._lang;
        }
        public string getCurrentLanguage()
        {
            NCSession s = new NCSession(this._context);
            if (s.getSession("lang") == "")
                return "VI";
            return s.getSession("lang");    
        }
    }
}
