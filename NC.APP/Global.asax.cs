using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace NC.APP
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            //NC  define View path load
            var engine = ViewEngines.Engines.OfType<RazorViewEngine>().Single();
            var NCViewLocations = new string[] {
                   "~/Layout/{1}/{0}.cshtml",
                   "~/Layout/{0}.cshtml"
               };
            var NCAreaLocationss =new string[] {
                    "~/Modules/{2}/Views/{1}/{0}.cshtml",
                    "~/Modules/{2}/Views/Shared/{1}/{0}.cshtml"};
            engine.ViewLocationFormats = NCViewLocations;
            engine.PartialViewLocationFormats = NCViewLocations;
            engine.AreaViewLocationFormats = NCAreaLocationss;

            //
            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            //Log register
            log4net.Config.XmlConfigurator.Configure();
            BundleConfig.RegisterBundles(BundleTable.Bundles);

        }
    }
}
