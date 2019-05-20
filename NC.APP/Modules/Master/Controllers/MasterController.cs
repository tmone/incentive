using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using NC.CORE.App.NCAccount;
using NC.CORE.NCController;
using log4net;
using NC.CORE.Log;
using NC.CORE.Encrypt;
namespace NC.APP.Modules.Master
{
    public class MasterController : NCAPPController
    {
        
        public MasterController()
        {
            //
            this._app = "Master"; ///relate to load language,  need to review after
            //            
        }
        public String Index()
        {
            return Customer();
        }
        public String Customer()
        {            
            return this.getRazorViewAsString(null, "~/Modules/Master/Views/Customer.cshtml");
        }
        public String Employee()
        {
            return this.getRazorViewAsString(null, "~/Modules/Master/Views/Employee.cshtml");
        }
        public String Province()
        {
            return this.getRazorViewAsString(null, "~/Modules/Master/Views/Province.cshtml");
        }
        public String District()
        {
            return this.getRazorViewAsString(null, "~/Modules/Master/Views/District.cshtml");
        }
        public String Service()
        {
            return this.getRazorViewAsString(null, "~/Modules/Master/Views/Service.cshtml");
        }
        public String Unit()
        {
            return this.getRazorViewAsString(null, "~/Modules/Master/Views/Unit.cshtml");
        }
        public String Vendor()
        {
            return this.getRazorViewAsString(null, "~/Modules/Master/Views/Vendor.cshtml");
        }

    }
}