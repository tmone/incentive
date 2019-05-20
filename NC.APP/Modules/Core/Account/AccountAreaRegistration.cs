using System.Web.Mvc;

namespace NC.APP.Modules.Core.Account.Controllers
{
    public class AccountAreaRegistration : AreaRegistration 
    {
        public override string AreaName 
        {
            get 
            {
                return "Account";
            }
        }

        public override void RegisterArea(AreaRegistrationContext context) 
        {
            context.MapRoute(
                "Account_default",
                "Account/{controller}/{action}/{id}",
                new { action = "Index", id = UrlParameter.Optional },
                namespaces: new[] { "NC.APP.Modules.Core.Account.Controllers" }
            );
        }
    }
}