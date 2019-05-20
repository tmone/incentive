using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;
using NC.CORE.NCController;
using NC.CORE.Log;
using System.Net.Http.Formatting;
using System.Net.Http.Headers;
using System.Web.Http.Results;
using System.Text;
using Dapper;

namespace NC.API.App.Accounting.Controllers
{
    [RoutePrefix("api/Accounting/Data")]
    public class DataController : NCAPIController
    {
        public DataController()
        {
            this.setApp("Accounting");
        }
        [HttpGet]
        [Route("KH")]
        public IHttpActionResult KH()
        {
            //C_BPARTNER  _context._db_orc.Select("C_BPARTNER")          
            return Ok();
        }

        [HttpGet]
        [Route("KPIData")]
        public IHttpActionResult KPIData()
        {
            return Ok(_context._db._conn.Query(@"
select 
cus.[user] as SALE_MAN,
convert(datetime,in_month+'-01',21) as IN_MONTH	,
concat( '[', ma_KH,'] ',ten_KH, ' -  ', SERVICE_PERIOD) as SaleDescription		 	
		, (doanh_thu) as AR
		, (pricetype1) as PriceType1
		, (pricetype2) as PriceType2
		, (pricetype2A) as PriceType2A
		, (pricetype2B) as PriceType2B
		, (pricetype3) as PriceType3
		, (pricetype4) as PriceType4
		, (incentivetype1) as IncentiveType1
		, (incentivetype3) as IncentiveType3
		, (incentivetype4) as IncentiveType4
		, (case when SERVICE_PERIOD<=3 then doanh_thu else 0 end) as ThreeMonthAR
		, (case when SERVICE_PERIOD>3 then doanh_thu else 0 end) as AfterAR
		from nc_acc_kpi_data dat 
		left join nc_acc_kpi_customer cus on dat.ma_kh = cus.[name]
		where cus.[user] is not null
"));
        }

    }
}