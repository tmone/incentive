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
namespace NC.APP.Modules.Accounting
{
    public class AccountingController : NCAPPController
    {

        public AccountingController()
        {
            //
            this._app = "Accounting"; ///relate to load language,  need to review after
            //            
        }

        public String Index()
        {
            return this.getRazorViewAsString(null, "~/Modules/Accounting/Views/Depting.cshtml");
        }
        public String Depting()
        {
            return this.getRazorViewAsString(null, "~/Modules/Accounting/Views/Depting.cshtml");
        }
        public String Revenue()
        {
            return this.getRazorViewAsString(null, "~/Modules/Accounting/Views/Revenue.cshtml");
        }
        public String SaleIncentive()
        {
            return this.getRazorViewAsString(null, "~/Modules/Accounting/Views/SaleIncentive.cshtml");
        }
        public String DiscountConfig()
        {
            return this.getRazorViewAsString(null, "~/Modules/Accounting/Views/DiscountConfig.cshtml");
        }
        public String UploadCommistion()
        {
            return this.getRazorViewAsString(null, "~/Modules/Accounting/Views/UploadCommistion.cshtml");
        }
        public String SyncRevenue()
        {
            return this.getRazorViewAsString(null, "~/Modules/Accounting/Views/SyncRevenue.cshtml");
        }
        public String KPIZone()
        {
            return this.getRazorViewAsString(null, "~/Modules/Accounting/Views/KPIZone.cshtml");
        }
        public String KPIPostion()
        {
            return this.getRazorViewAsString(null, "~/Modules/Accounting/Views/KPIPostion.cshtml");
        }
        public String KPISetting()
        {
            return this.getRazorViewAsString(null, "~/Modules/Accounting/Views/KPISetting.cshtml");
        }
        public String KPISaler()
        {
            return this.getRazorViewAsString(null, "~/Modules/Accounting/Views/KPISaler.cshtml");
        }
        public String KPICustomer()
        {
            return this.getRazorViewAsString(null, "~/Modules/Accounting/Views/KPICustomer.cshtml");
        }
        public String KPIView()
        {
            return this.getRazorViewAsString(null, "~/Modules/Accounting/Views/KPIView.cshtml");
        }
    }
}