using System.Web.Mvc;

namespace NC.APP.Modules.Core.Bootstrap.Controllers
{ 
    public class BootstrapAreaRegistration : AreaRegistration 
    {
        public override string AreaName 
        {
            get 
            {
                return "Bootstrap";
            }
        }
        public override void RegisterArea(AreaRegistrationContext context) 
        {
            context.MapRoute(
                "Bootstrap_default",
                "Bootstrap/{controller}/{action}/{id}",
                new {action = "Load", id = UrlParameter.Optional },
                namespaces: new[] { "NC.APP.Modules.Core.Bootstrap.Controllers" }
            );
        }
    }
}