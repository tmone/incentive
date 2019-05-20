
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace NC.CORE.NCController
{
    public class NCFakeController : Controller
    {
    }
    public class ABC
    {
        public static string GetRazorViewAsString(object model, string filePath)
        {
            var st = new System.IO.StringWriter();
            var context = new HttpContextWrapper(HttpContext.Current);
            var routeData = new RouteData();
            var controllerContext = new ControllerContext(new RequestContext(context, routeData), new NCFakeController());
            var razor = new RazorView(controllerContext, filePath, null, false, null);
            razor.Render(new ViewContext(controllerContext, razor, new ViewDataDictionary(model), new TempDataDictionary(), st), st);
            return st.ToString();
        }
    }
}
