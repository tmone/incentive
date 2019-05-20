using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Dapper;
using NC.CORE.Context;
using NC.CORE.Log;
using System;
using static System.Net.Mime.MediaTypeNames;
using System.IO;
using System.Dynamic;
using NC.CORE.Helper;
using NC.CORE.Xml;
namespace NC.CORE.App.System
{
    public class NCApp
    {
        private NCContext _context = new NCContext();
        public NCApp(NCContext context)
        {
            this._context = context;
        }
        public List<dynamic> getAppListInFolder()
        {
            NCHelper helper = new NCHelper();
            List<dynamic> l = new List<dynamic>();
            //find current path
            string vs_path = "";
            vs_path = helper.getVSPath()+"/Modules";
            NCLogger.Debug("CS PATH:" + vs_path);
            string[] folders = Directory.GetDirectories(vs_path);
            for (int i = 0; i < folders.Length; i++)
            {
                NCLogger.Debug( folders[i] + "/conf.xml");
                if (File.Exists(folders[i] + "/conf.xml"))
                {
                    dynamic app = new ExpandoObject();
                    app.path_config = folders[i] + "/conf.xml";
                    l.Add(app);
                }

            }
            return l;
        }
        public IEnumerable<dynamic> getAppList()
        {
            NCHelper helper = new NCHelper();
            var app_register = this._context._db.Select("nc_sc_app");
            var full_app = app_register;
            //NCLogger.Debug("app_register:"+app_register.Count());
            var list_app = this.getAppListInFolder();
            //NCLogger.Debug("LIST APP:"+list_app.Count);
            foreach (dynamic app in list_app)
            {
                //NCLogger.Debug("app.path_config:"+app.path_config);
                dynamic app_new = new ExpandoObject();
                NCXml xml = new NCXml();
                dynamic app_schema = xml.XmlToDynamic(app.path_config);
                dynamic app_result = helper.searchDynamic(app_register, "app_name", app_schema.module.information.name.ToString());
                if (app_result == null)//new app
                {
                  
                    app_new.id = 0;
                    app_new.app_name = app_schema.module.information.name;
                    app_new.description = app_schema.module.information.description;
                    app_new._active = "";
                    app_new._deleted = "";
                    app_new._createdate = "";
                    app_new._updatedate = "";
                    full_app = full_app.Concat(new[]{ app_new });
                }
            }
            return full_app;
            
        }
        public bool installApp(string app_name)
        {
            NCHelper helper = new NCHelper();
            string path_config = helper.getVSPath() + "/Modules/" + app_name + "/conf.xml";
            dynamic app_new = new ExpandoObject();
            NCXml xml = new NCXml();
            dynamic app_schema = xml.XmlToDynamic(path_config);
            if (app_schema != null)
            {
                //insert to nc_sc_app table
                Dictionary<string, string> d = new Dictionary<string, string>();
                d.Add("app_name", app_schema.module.information.name.ToString());
                d.Add("description", app_schema.module.information.description.ToString());
              
                long l = this._context._db.Insert("nc_sc_app", d);
                string new_id = this._context._db.getIDbyColumn("nc_sc_app", "app_name", app_schema.module.information.name.ToString());
                if (l > 0)
                {
                    //NCLogger.Debug("AAA");
                    //insert craft to widget table
                    foreach (var craft in app_schema.module.crafts.craft)
                    {
                        //NCLogger.Debug("BBB");
                        Dictionary<string, string> c = new Dictionary<string, string>();
                        c.Add("craft_name", craft.craftinfo.name.ToString());
                        c.Add("title", craft.craftinfo.title.ToString());
                        c.Add("app_id", new_id);
                        c.Add("controller", craft.craftinfo.controller.ToString());
                        c.Add("action", craft.craftinfo.action.ToString());
                        c.Add("action_view", craft.craftinfo.view.ToString());
                        c.Add("description", craft.craftinfo.description.ToString());
                        long r = this._context._db.Insert("nc_sc_craft", c);
                        string craft_id = this._context._db.getIDbyColumn("nc_sc_craft", "craft_name", craft.craftinfo.name.ToString());
                        //insert callback action
                        foreach (var acl in craft.acls.acl){
                            Dictionary<string, string> d_acl = new Dictionary<string, string>();
                            d_acl.Add("name", acl.name.ToString());
                            d_acl.Add("title", acl.title.ToString());
                            d_acl.Add("description", acl.description.ToString());
                            d_acl.Add("controller", acl.controller.ToString());
                            d_acl.Add("action", acl.action.ToString());
                            d_acl.Add("app_id", new_id);
                            d_acl.Add("craft_id", craft_id);
                            long r1 = this._context._db.Insert("nc_sc_craft_action_callback", d_acl);
                        }
                    }
                    //
                    return true;
                }
               
                return false;
            }
            return false;
        }
        public bool unInstallApp(string app_name)
        {
            string app_id = this._context._db.getIDbyColumn("nc_sc_app", "app_name", app_name);
            if (this._context._db.DeleteEmpty("nc_sc_app", Int64.Parse(app_id)) > 0){
                this._context._db.DeleteEmpty("nc_sc_craft", "app_id=" + Int64.Parse(app_id));
                this._context._db.DeleteEmpty("nc_sc_craft_action_callback", "app_id=" + Int64.Parse(app_id));
                return true;
            }
            return false;
        }
    }
}
