using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Net.Http.Formatting;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Web.WebPages;
using NC.CORE.Log;
using Newtonsoft.Json.Linq;
using NC.CORE.Log;
using Newtonsoft.Json;

namespace NC.CORE.Helper
{
    public class NCHelper
    {
        public string datetostring(string d, string f = "dd/MM/yyyy HH:mm")
        {
            DateTime D;
            if (!DateTime.TryParse(d, out D))
            {
                return D.ToString(f);
            }
            return "";
        }
        public string datetostring(DateTime d, string f = "dd/MM/yyyy HH:mm")
        {
            return d.ToString(f);
        }
        //public string[] explode(string s, string match)
        //{

        //}
        public  Dictionary<string,string> ConvertPOSTToDic(FormDataCollection formDataCollection)
        {
            //Validator.IsNotNull("formDataCollection", formDataCollection);

            IEnumerator<KeyValuePair<string, string>> pairs = formDataCollection.GetEnumerator();

            Dictionary<string, string> d = new Dictionary<string, string>();

            while (pairs.MoveNext())
            {
                KeyValuePair<string, string> pair = pairs.Current;

                d.Add(pair.Key, pair.Value);
            }

            return d;
        }
        public string[] explode(string s,char c)
        {
            string[] words = s.Split(c);
            return words;
        }
        public dynamic searchDynamic(IEnumerable<dynamic> d,string key,string val)
        {
            //NCLogger.Debug("searchDynamic:"+val);
            foreach (dynamic item in d)
            {
                var data = (IDictionary<string, object>)item;
                object value = data[key];
                if (value.ToString() == val)
                    return item;
            }
            return null;
        }
        public string getRootPath()
        {
            //find current path
            string root_path = "";
            string assemblyFile = (
                new Uri(Assembly.GetExecutingAssembly().CodeBase)
            ).AbsolutePath;
            int pos = assemblyFile.IndexOf("NC.API");
            //NCLogger.Debug("POST1:" + pos.ToString());
            if (pos < 0)
                pos = assemblyFile.IndexOf("NC.APP");
            if(pos<0)
                pos = assemblyFile.IndexOf("NC.VS");
            //NCLogger.Debug("POST2:" + pos.ToString());
            //NCLogger.Debug("PATH:" + assemblyFile);
            root_path = assemblyFile.Substring(0, pos - 1);
            return root_path;
        }
        public string getVSPath()
        {
            return this.getRootPath() + "/NC.VS";
        }
        public string getAPIPath()
        {
            return this.getRootPath() + "/NC.API";
        }
        public string getAPPPath()
        {
            return this.getRootPath() + "/NC.APP";
        }
        public bool checkValidData(string data,string rule)
        {
            string range = "";
            if (rule.IndexOf("[") > 0)
            {
                //min_len[10]
                range = rule.Substring(rule.IndexOf("["), rule.Length - rule.IndexOf("["));
                rule = rule.Substring(0,rule.IndexOf("["));
            }
            switch (rule)
            {
                case "required":
                    break;
                case "min-len":
                    break;
                case "max-len":
                    break;
                case "unique":
                    break;
                case "email":
                    break;
                case "match":
                    break;
                case "digit":
                    break;
                case "alpha":
                    break;
            }
            return false;
        }
        public bool hasPropertyInJSON(dynamic obj, string path)
        {
            //NCLogger.Debug("PATH:" + path);
            if (obj == null)
                return false;
            var temp = obj;
            string[] arr = explode(path, '.');
            //NCLogger.Debug(arr.Count());
            foreach(string p in arr)
            {
                try
                {
                    //NCLogger.Debug(" temp = temp[p]:" + p);
                    temp = temp[p];
                    //NCLogger.Debug(" temp = temp[p]: OK");
                }
                catch
                {
                    return false;
                }

            }
            return true;
            //return obj.GetType().GetProperty(name) != null;
        }
    }
}
