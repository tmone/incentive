using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Formatting;
using System.Web.Http;
using System.Web.Http.Cors;

namespace NC.API
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            config.MapHttpAttributeRoutes();
            // Web API configuration and services
            config.Routes.MapHttpRoute(
               name: "API_CORE_AREA",
               routeTemplate: "api/core/{controller}/{id}",
               defaults: new { id = RouteParameter.Optional }
            );
            
            config.Routes.MapHttpRoute(
              name: "API_CORE_AREA_EXTEND",
              routeTemplate: "api/core/{controller}/{action}/{id}",
              defaults: new { id = RouteParameter.Optional }
            );
            


            var cors = new EnableCorsAttribute("*", "*", "*");
            config.EnableCors(cors);
        }
    }
}
