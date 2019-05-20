using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace NC.CORE.Log
{
    public static class NCLogger
    {
        private static log4net.ILog Log { get; set; }

        static NCLogger()
        {
            Log = log4net.LogManager.GetLogger(typeof(NCLogger));
        }

        public static void Error(object msg)
        {
            Log.Error(msg);
        }

        public static void Error(object msg, Exception ex)
        {
            Log.Error(msg, ex);
        }

        public static void Error(Exception ex)
        {
            Log.Error(ex.Message, ex);
        }

        public static void Info(object msg)
        {
            Log.Info(msg);
        }
        public static void Debug(object msg)
        {
            Log.Warn("DEBUG: "+msg);
        }
        public static void ShowLog(string st)
        {
            HttpContext.Current.Response.Write(st);
            HttpContext.Current.Response.Flush();
            HttpContext.Current.Response.End();
        }
    }
}
