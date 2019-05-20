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
using System.IO;
using DevExpress.Pdf;
using DevExpress.Compression;
using Dapper;
using NC.CORE.Model;
using Oracle.DataAccess.Client;
using System.Data;
using Oracle.DataAccess.Types;
using DevExpress.Spreadsheet;
using DevExpress.XtraSpreadsheet.Services;
using DevExpress.XtraSpreadsheet.Services.Implementation;
using System.Text.RegularExpressions;
using NC.API.App.Accounting.Models;
using Newtonsoft.Json;
using System.Drawing;
using System.Web.Hosting;
using System.Data.SqlClient;
using System.Configuration;
using DevExpress.XtraSpreadsheet.Export;
using System.Xml;

namespace NC.API.App.Accounting.Controllers
{
    [RoutePrefix("api/Accounting/Report")]
    public class ReportsController : NCAPIController
    {
        public ReportsController()
        {
            this.setApp("Accounting");
        }
        [HttpGet]
        [Route("Depting")]
        public IHttpActionResult Depting()
        {
            //_context._session.getSession("userid");

            var user = "0";// _context._token.getOrgID(); //_context.getURLParam("org");
            string rs = "";
            String varname1 = "";
            try
            {
                user = _context._token.getUserID();

                varname1 = varname1 + "SELECT DISTINCT a.code " + "\n";
                varname1 = varname1 + "FROM   [kevncore].[dbo].[nc_core_user_orgchart] b " + "\n";
                varname1 = varname1 + "       JOIN [dbo].[nc_core_orgchart] a " + "\n";
                varname1 = varname1 + "         ON a.id = b.orgchart_id " + "\n";
                varname1 = varname1 + "WHERE  NOT ( a.code IS NULL ) " + "\n";
                varname1 = varname1 + "       AND a._deleted = 0 " + "\n";
                varname1 = varname1 + "       AND a._active = 1 " + "\n";
                varname1 = varname1 + "       AND b._active = 1 " + "\n";
                varname1 = varname1 + "       AND b._deleted = 0 " + "\n";
                varname1 = varname1 + "       AND b.user_id = " + user;

            }
            catch { }
            var dat = _context._db._conn.Query<string>(varname1).ToArray();
            rs = "" + String.Join(",", dat) + "";
            List<dynamic> tol = new List<dynamic>();
            //foreach(var ri in dat)
            //{
            var p = new OracleDynamicParameters();
            p.Add("org_value", value: rs, dbType: OracleDbType.NVarchar2, direction: ParameterDirection.Input);
            p.Add("data_list", dbType: OracleDbType.RefCursor, direction: ParameterDirection.Output);
            var data = _context._db_orc._conn.Query("d_list_bangkecongno", param: p, commandType: CommandType.StoredProcedure, commandTimeout: 300).ToList();
            tol.AddRange(data);
            //}
            //

            return Ok(tol);
        }

        [HttpGet]
        [Route("KPI")]
        public IHttpActionResult KPI()
        {

            try
            {
                //var rs = _context._db._conn.Query(@"
                //select 
                //SALE_MAN
                //,IN_MONTH
                //,AR
                //,PriceType1
                //,PriceType2
                //,PriceType3
                //,PriceType4
                //,case when kpi<0.8 then 0 else incentivetype1 end as IncentiveType1
                //,case
                // when kpi>=1 and kpi<1.1 then 1000000
                // when kpi>=1.1 and kpi<1.2 then 2000000
                // when kpi>=1.2 and kpi<1.5 then 3000000
                // when kpi>=1.5 then 5000000
                // else 0
                //    end as BonusType1
                //,case 
                // when PriceType2B >=150000000 and PriceType2B < 300000000 then 5000000
                // when PriceType2B >=300000000 and PriceType2B < 500000000 then 10000000
                // when PriceType2B >=500000000 and PriceType2B < 1000000000 then 15000000
                // when PriceType2B >=1000000000 and PriceType2B < 3000000000 then 20000000
                // when PriceType2B >=3000000000 then 35000000
                // else 0
                //    end + 
                //    case postion 
                // when 4 then case when 0.05 * PriceType2A < 2000000 then  0.05 * PriceType2A else 2000000 end
                // when 5 then case when 0.03 * PriceType2A < 2000000 then  0.05 * PriceType2A else 2000000 end
                //    end as IncentiveType2
                //,IncentiveType3
                //,IncentiveType4
                //,ThreeMonthAR
                //,AfterAR
                //,TARGET
                //,KPI
                //,ZONE1
                //,ZONE2
                //,ZONE3
                //,ZONE4
                //,ZONE5
                //from 
                // (select ar.*, saler.postion
                // ,isnull(sett.value,isnull(sett.[default],0)) as [TARGET]
                // ,ar.ar / case sett.value when null then case sett.[default] when null then 1 when 0 then 1 else sett.[default] end when 0 then 1 else sett.value end as KPI
                // ,zone1.name as ZONE1
                // ,zone2.name as ZONE2
                // ,zone3.name as ZONE3
                // ,zone4.name as ZONE4
                // ,zone5.name as ZONE5				
                // from 
                // (
                // select SALE_MAN
                // , convert(datetime,in_month+'-01',21) as IN_MONTH
                // , sum(doanh_thu) as AR
                // , sum(pricetype1) as PriceType1
                // , sum(pricetype2) as PriceType2
                // , sum(pricetype2A) as PriceType2A
                // , sum(pricetype2B) as PriceType2B
                // , sum(pricetype3) as PriceType3
                // , sum(pricetype4) as PriceType4
                // , sum(incentivetype1) as IncentiveType1
                // , sum(incentivetype3) as IncentiveType3
                // , sum(incentivetype4) as IncentiveType4
                // , sum(case when SERVICE_PERIOD<=3 then doanh_thu else 0 end) as ThreeMonthAR
                // , sum(case when SERVICE_PERIOD>3 then doanh_thu else 0 end) as AfterAR
                // from nc_acc_kpi_data
                // group by SALE_MAN, in_month) ar
                // join nc_acc_kpi_saler saler on ar.SALE_MAN = saler.name
                // join nc_acc_kpi_setting sett on sett.zone = saler.zone and sett.postion = saler.postion 
                // left join nc_acc_kpi_zone zone1 on zone1.id = sett.zone
                // left join nc_acc_kpi_zone zone2 on zone2.id = zone1.parent
                // left join nc_acc_kpi_zone zone3 on zone3.id = zone2.parent
                // left join nc_acc_kpi_zone zone4 on zone4.id = zone3.parent
                // left join nc_acc_kpi_zone zone5 on zone5.id = zone4.parent) arr
                //");

                var rs = _context._db._conn.Query(@"select distinct kpi.*, concat( '[', usr.username,'] ',usr.lastname,' ',usr.firstname, ' -  ', pos.description) as SaleDescription
                ,par1.SALE_PARENT as PAR1
                ,par2.SALE_PARENT as PAR2
                ,par3.SALE_PARENT as PAR3
                ,par4.SALE_PARENT as PAR4
                from nc_acc_kpi_kpi kpi left join nc_core_user usr on usr.username = kpi.sale_man
                left join nc_acc_kpi_setting sett on sett.id = kpi.Settingtype
                left join nc_acc_kpi_postion pos on pos.id = sett.postion
				left join (
					select usr.username as SALE_NAME, par.username as SALE_PARENT, rol.kpi_id as SettingType from nc_acc_kpi_saler_role rol join nc_core_user usr on rol.[user] = usr.id
					left join nc_core_user par on par.id = rol.parent
				) par1 on par1.SALE_NAME = usr.username and par1.SettingType = sett.id
				left join (
					select usr.username as SALE_NAME, par.username as SALE_PARENT, rol.kpi_id as SettingType from nc_acc_kpi_saler_role rol join nc_core_user usr on rol.[user] = usr.id
					left join nc_core_user par on par.id = rol.parent
				) par2 on par2.SALE_NAME = par1.SALE_PARENT
				left join (
					select usr.username as SALE_NAME, par.username as SALE_PARENT, rol.kpi_id as SettingType from nc_acc_kpi_saler_role rol join nc_core_user usr on rol.[user] = usr.id
					left join nc_core_user par on par.id = rol.parent
				) par3 on par3.SALE_NAME = par2.SALE_PARENT
				left join (
					select usr.username as SALE_NAME, par.username as SALE_PARENT, rol.kpi_id as SettingType from nc_acc_kpi_saler_role rol join nc_core_user usr on rol.[user] = usr.id
					left join nc_core_user par on par.id = rol.parent
				) par4 on par4.SALE_NAME = par3.SALE_PARENT
                ");
                return Ok(rs);
            }
            catch (Exception ex)
            {

            }
            return Ok();
        }

        [HttpGet]
        [Route("KPI_NEW")]
        public IHttpActionResult KPI_NEW()
        {
            try
            {

                var rs = _context._db._conn.Query(@"select distinct kpi.*, concat( '[', usr.username,'] ',usr.lastname,' ',usr.firstname) as SaleDescription
                ,par1.SALE_PARENT as PAR1
                ,par2.SALE_PARENT as PAR2
                ,par3.SALE_PARENT as PAR3
                ,par4.SALE_PARENT as PAR4
				,pos.description
				,dat.*
                from nc_acc_kpi_kpi_new kpi left join nc_core_user usr on usr.username = kpi.sale_man
                left join nc_acc_kpi_setting sett on sett.id = kpi.Settingtype
                left join nc_acc_kpi_postion pos on pos.id = sett.postion
				left join (
					select usr.username as SALE_NAME, par.username as SALE_PARENT, rol.kpi_id as SettingType from nc_acc_kpi_saler_role rol join nc_core_user usr on rol.[user] = usr.id
					left join nc_core_user par on par.id = rol.parent
				) par1 on par1.SALE_NAME = usr.username and par1.SettingType = sett.id
				left join (
					select usr.username as SALE_NAME, par.username as SALE_PARENT, rol.kpi_id as SettingType from nc_acc_kpi_saler_role rol join nc_core_user usr on rol.[user] = usr.id
					left join nc_core_user par on par.id = rol.parent
				) par2 on par2.SALE_NAME = par1.SALE_PARENT
				left join (
					select usr.username as SALE_NAME, par.username as SALE_PARENT, rol.kpi_id as SettingType from nc_acc_kpi_saler_role rol join nc_core_user usr on rol.[user] = usr.id
					left join nc_core_user par on par.id = rol.parent
				) par3 on par3.SALE_NAME = par2.SALE_PARENT
				left join (
					select usr.username as SALE_NAME, par.username as SALE_PARENT, rol.kpi_id as SettingType from nc_acc_kpi_saler_role rol join nc_core_user usr on rol.[user] = usr.id
					left join nc_core_user par on par.id = rol.parent
				) par4 on par4.SALE_NAME = par3.SALE_PARENT
				join nc_acc_kpi_data_new dat on kpi.SALE_MAN = dat.SALE_MAN and kpi.IN_MONTH = convert(datetime,dat.in_month+'-01',21)
                ");
                return Ok(rs);
            }
            catch (Exception ex)
            {

            }
            return Ok();
        }

        [HttpGet]
        [Route("QO")]
        public IHttpActionResult QueryOracle()
        {
            try
            {
                var q = _context.getURLParam("q");
                q = q.Replace("( )", "(+)");
                if (!string.IsNullOrEmpty(q))
                {
                    var table_name = _context.getURLParam("t");
                    IEnumerable<dynamic> data = null;
                    if (string.IsNullOrEmpty(table_name))
                    {
                        data = _context._db_orc._conn.Query(q, commandTimeout: 3000);
                    }
                    else
                    {
                        if (table_name == "nc_accounting_temp_bill")
                        {
                            data = _context._db_orc._conn.Query<nc_accounting_temp_bill>(q, commandTimeout: 3000);
                        }
                        else if (table_name == "nc_accounting_temp_discount")
                        {
                            data = _context._db_orc._conn.Query<nc_accounting_temp_discount>(q, commandTimeout: 3000);
                        }
                        else if (table_name == "nc_accounting_temp_invoice")
                        {
                            data = _context._db_orc._conn.Query<nc_accounting_temp_invoice>(q, commandTimeout: 3000);
                        }
                        else if (table_name == "nc_accounting_temp_revenue")
                        {
                            data = _context._db_orc._conn.Query<nc_accounting_temp_revenue>(q, commandTimeout: 3000);
                        }
                        else if (table_name == "nc_accounting_temp_customer")
                        {
                            data = _context._db_orc._conn.Query<nc_accounting_temp_customer>(q, commandTimeout: 3000);

                        }
                        else
                        {

                        }

                        if (data != null)
                        {

                            HostingEnvironment.QueueBackgroundWorkItem(ct => updateTemplate(data));
                        }

                    }
                    return Ok(data);
                }
                else
                {

                }

            }
            catch (Exception ex)
            {

            }
            return Ok();
        }

        private void updateTemplate(IEnumerable<dynamic> data)
        {
            if (data != null)
            {
                foreach (var it in data)
                {
                    it.assign(_context);
                    it.updateId();
                    it.save();
                }
            }
            //if (table == "nc_accounting_temp_bill")
            //{
            //    IEnumerable<nc_accounting_temp_bill> dat = data as IEnumerable<nc_accounting_temp_bill>;
        }
        private void updateItem(dynamic it)
        {
            try
            {
                it.assign(_context);
                it.updateId();
                it.save();
            }
            catch (Exception ex)
            {

            }
        }

        [HttpGet]
        [Route("Revenues")]
        public IHttpActionResult Revenues()
        {

            string customer_code = null;
            try
            {
                customer_code = _context.getURLParam("CUSTOMER_CODE");
            }
            catch (Exception ex)
            {
                customer_code = null;
            }


            String varname1 = "";
            varname1 = varname1 + "select " + "\n";
            varname1 = varname1 + "rev.MA_KH " + "\n";
            varname1 = varname1 + ",cus.customer_name as TEN_KH " + "\n";
            varname1 = varname1 + ",cus.first_sale as JOIN_DATE " + "\n";
            varname1 = varname1 + ",DATEDIFF(month, cus.first_sale, convert(datetime,rev.IN_MONTH+'-01',121)) AS SERVICE_PERIOD " + "\n";
            varname1 = varname1 + ", rev.IN_MONTH " + "\n";
            varname1 = varname1 + ", rev.DOANH_THU " + "\n";
            varname1 = varname1 + ", rev.NUM_PACKAGE " + "\n";
            varname1 = varname1 + ", dis.DC " + "\n";
            varname1 = varname1 + ", bill.THD as BILL_INVOICE " + "\n";
            varname1 = varname1 + ",rev.DOANH_THU - isnull(dis.DC,0) as AFTER_DISCOUNT " + "\n";
            varname1 = varname1 + ",pay.INVOICE_AMOUNT " + "\n";
            varname1 = varname1 + ",pay.RECEIPT_AMOUNT " + "\n";
            varname1 = varname1 + ",isnull(pay.RECEIPT_AMOUNT,0) - isnull(rev.DOANH_THU,0) + isnull(dis.DC,0) as BALANCE " + "\n";
            varname1 = varname1 + ",act.commission_rate as ACT_CUSTOMER_COM_RATE " + "\n";
            varname1 = varname1 + ",act.actual_commission_paid as ACT_CUSTOMER_COM_AMOUNT  " + "\n";
            varname1 = varname1 + ",act.receipient as ACT_CUSTOMER_COM_TARGET  " + "\n";
            varname1 = varname1 + ",act.[staff_code] as ACT_SALE_COM_TARGET  " + "\n";
            varname1 = varname1 + ",act.[incentive_rate] as ACT_SALE_COM_RATE  " + "\n";
            varname1 = varname1 + ",act.[sales_incentive] as ACT_SALE_COM_AMOUNT  " + "\n";
            varname1 = varname1 + " from " + "\n";
            varname1 = varname1 + " ( " + "\n";
            varname1 = varname1 + " select distinct SUBSTRING(MA_KH, 1, 7) as MA_KH, IN_MONTH, NUM_PACKAGE, DOANH_THU from nc_accounting_temp_revenue " + "\n";
            varname1 = varname1 + " where convert(datetime,IN_MONTH +'-01',121)>=@from_date and convert(datetime,IN_MONTH +'-01',121)<=@to_date " + "\n";
            if (!string.IsNullOrEmpty(customer_code))
            {
                varname1 = varname1 + " and MA_KH like '" + customer_code + "%' \n";
            }
            varname1 = varname1 + " ) rev left join " + "\n";
            varname1 = varname1 + " ( " + "\n";
            varname1 = varname1 + " SELECT MA_KH, IN_MONTH, sum(TIEN_HD) as THD " + "\n";
            varname1 = varname1 + "  FROM [kevncore].[dbo].[nc_accounting_temp_bill] " + "\n";
            varname1 = varname1 + "  where convert(datetime,IN_MONTH +'-01',121)>=@from_date and convert(datetime,IN_MONTH +'-01',121)<=@to_date " + "\n";
            if (!string.IsNullOrEmpty(customer_code))
            {
                varname1 = varname1 + " and MA_KH='" + customer_code + "' \n";
            }
            varname1 = varname1 + "  group by mA_KH, IN_MONTH " + "\n";
            varname1 = varname1 + " ) bill on rev.MA_KH = bill.MA_KH and rev.IN_MONTH = bill.IN_MONTH " + "\n";
            varname1 = varname1 + " left join ( " + "\n";
            varname1 = varname1 + " select MA_KH, IN_MONTH, sum(DC) as DC " + "\n";
            varname1 = varname1 + " FROM [kevncore].[dbo].[nc_accounting_temp_discount] " + "\n";
            varname1 = varname1 + "  where convert(datetime,IN_MONTH +'-01',121)>=@from_date and convert(datetime,IN_MONTH +'-01',121)<=@to_date " + "\n";
            if (!string.IsNullOrEmpty(customer_code))
            {
                varname1 = varname1 + " and MA_KH='" + customer_code + "' \n";
            }
            varname1 = varname1 + "  group by MA_KH, IN_MONTH " + "\n";
            varname1 = varname1 + " ) dis on rev.MA_KH = dis.MA_KH and rev.IN_MONTH = dis.IN_MONTH " + "\n";
            varname1 = varname1 + " left join nc_master_customer cus on SUBSTRING(rev.MA_KH, 1, 7) = SUBSTRING(cus._orc_partner_code, 1, 7) " + "\n";
            varname1 = varname1 + " left join " + "\n";
            varname1 = varname1 + " ( " + "\n";
            varname1 = varname1 + " SELECT bill.MA_KH, bill.IN_MONTH, sum(INVOICE_AMOUNT) As INVOICE_AMOUNT, sum(RECEIPT_AMOUNT) AS RECEIPT_AMOUNT " + "\n";
            varname1 = varname1 + "  FROM [kevncore].[dbo].[nc_accounting_temp_invoice] HD join [dbo].[nc_accounting_temp_bill] bill on bill.SO_HD = hd.SO_HD " + "\n";
            varname1 = varname1 + "  where convert(datetime,bill.IN_MONTH +'-01',121)>=@from_date and convert(datetime,bill.IN_MONTH +'-01',121)<=@to_date " + "\n";
            if (!string.IsNullOrEmpty(customer_code))
            {
                varname1 = varname1 + " and bill.MA_KH='" + customer_code + "' \n";
            }
            varname1 = varname1 + "  group by bill.MA_KH, bill.IN_MONTH " + "\n";
            varname1 = varname1 + " )pay on rev.MA_KH = pay.MA_KH and rev.IN_MONTH = pay.IN_MONTH " + "\n";
            varname1 = varname1 + " left join( " + "\n";
            varname1 = varname1 + " SELECT [client_code] " + "\n";
            varname1 = varname1 + "      ,[in_month] " + "\n";
            varname1 = varname1 + "      ,[commission_rate] " + "\n";
            varname1 = varname1 + "      ,[after_discount] " + "\n";
            varname1 = varname1 + "      ,[actual_payment_received] " + "\n";
            varname1 = varname1 + "      ,[actual_commission_paid] " + "\n";
            varname1 = varname1 + "      ,[commission_receipt_ref] " + "\n";
            varname1 = varname1 + "      ,[receipient] " + "\n";
            varname1 = varname1 + "      ,[staff_code] " + "\n";
            varname1 = varname1 + "      ,[incentive_rate] " + "\n";
            varname1 = varname1 + "      ,[sales_incentive] " + "\n";
            varname1 = varname1 + "  FROM [kevncore].[dbo].[nc_accounting_upload_commistion] " + "\n";
            varname1 = varname1 + "  where _active = 1 and _deleted = 0 " + "\n";
            if (!string.IsNullOrEmpty(customer_code))
            {
                varname1 = varname1 + " and client_code='" + customer_code + "' \n";
            }
            varname1 = varname1 + ") act on act.client_code = rev.MA_KH  and rev.IN_MONTH = act.IN_MONTH";


            DateTime from_date;
            DateTime to_date;
            try
            {
                to_date = DateTime.Parse(_context.getURLParam("TO_DATE"));
                //to_date = to_date.Date;
            }
            catch (Exception ex)
            {
                var pre = DateTime.Now;
                to_date = new DateTime(pre.Year, pre.Month, 01).AddSeconds(-1);
            }
            try
            {
                from_date = DateTime.Parse(_context.getURLParam("FROM_DATE")).Date;
            }
            catch (Exception ex)
            {
                var pre = DateTime.Now;
                from_date = new DateTime(pre.Year, 01, 01).Date;
            }




            var data = _context._db._conn.Query("nc_accounting_revenue", new
            {
                from_date,
                to_date,
                customer_code
            },
            commandType: CommandType.StoredProcedure,
            commandTimeout: 3000);


            return Ok(data);
        }



        [HttpGet]
        [Route("getKPISaler")]
        public HttpResponseMessage getKPISaler()
        {

            var saler = "";
            var type = "";
            var value = "";
            try
            {
                saler = this._context.getURLParam("s");
            }
            catch
            {
                saler = "00000";
            }
            try
            {
                type = this._context.getURLParam("t");
            }
            catch
            {
                type = "pdf";
            }
            try
            {
                value = this._context.getURLParam("v");
            }
            catch
            {
                value = DateTime.Now.ToString("yyyy-MM");
            }


            MemoryStream ostream = createExcelKPI(saler, type, value);


            //ostream.Close();
            ostream.Seek(0, SeekOrigin.Begin);
            ostream.Position = 0;

            HttpResponseMessage result = new HttpResponseMessage(HttpStatusCode.OK);
            result.Content = new StreamContent(ostream);
            // Generic Content Header
            var ctype = "application/pdf";
            if (type == "xlsx")
            {
                ctype = "application/octet-stream";
            }
            else if (type == "pdf")
            {
                ctype = "application/pdf";
            }
            else if (type == "htm" || type == "html")
            {
                ctype = "text/html";
            }
            else if (type == "xml")
            {
                ctype = "application/xml";
            }
            result.Content.Headers.ContentType = new MediaTypeHeaderValue(ctype);
            result.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("inline");

            //Set Filename sent to client
            result.Content.Headers.ContentDisposition.FileName = String.Format("{2}.{1}", 0, type, saler);

            return result;

        }

        [HttpGet]
        [Route("getKPIMonth")]
        public HttpResponseMessage getKPIMonth()
        {

            var saler = "";
            var type = "";
            var value = "";
            try
            {
                saler = this._context.getURLParam("s");
            }
            catch
            {
                saler = "00000";
            }
            try
            {
                type = this._context.getURLParam("t");
            }
            catch
            {
                type = "pdf";
            }
            try
            {
                value = this._context.getURLParam("v");
            }
            catch
            {
                value = DateTime.Now.ToString("yyyy-MM");
            }
            string com = "false";
            MemoryStream ostream = new MemoryStream();
            ZipArchive ar = new ZipArchive();
            if (type == "xml")
            {
                ostream = createKPIMonth(saler, value.Split(',')[0], type);
            }
            else if (type == "pdf")
            {
                using (PdfDocumentProcessor pdfDocumentProcessor = new PdfDocumentProcessor())
                {
                    if (com == "false")
                    {
                        pdfDocumentProcessor.CreateEmptyDocument(ostream);
                    }


                    foreach (var month in value.Split(','))
                    {
                        var tmp = createKPIMonth(saler, month, type);
                        if (com == "false")
                        {
                            pdfDocumentProcessor.AppendDocument(tmp);
                        }
                        else
                        {
                            tmp.Seek(0, SeekOrigin.Begin);
                            ar.AddStream(month + ".pdf", tmp);
                        }
                    }
                }
            }
            else if (type == "xlsx")
            {
                using (Workbook sourceWorkbook = new Workbook())
                {
                    foreach (var month in value.Split(','))
                    {
                        var tmp = createKPIMonth(saler, month, type);
                        if (com == "false")
                        {
                            var tmpbook = new Workbook();
                            tmpbook.LoadDocument(tmp);
                            var tmpsheet = tmpbook.Worksheets.ActiveWorksheet;
                            var mkh = month;//.Replace("-","_");
                            var csheet = sourceWorkbook.Worksheets.Add(mkh);
                            csheet.CopyFrom(tmpsheet);
                        }
                        else
                        {
                            tmp.Seek(0, SeekOrigin.Begin);
                            ar.AddStream(month + ".xlsx", tmp);
                        }

                    }
                    if (com == "false")
                    {
                        try
                        {
                            sourceWorkbook.Worksheets.Remove(sourceWorkbook.Worksheets["Sheet1"]);
                        }
                        catch { }

                        sourceWorkbook.SaveDocument(ostream, DocumentFormat.OpenXml);
                    }

                }

            }
            else if (type == "htm")
            {
                foreach (var month in value.Split(','))
                {
                    var tmp = createKPIMonth(saler, month, type);
                    tmp.CopyTo(ostream);
                }
            }
            if (com == "true")
            {
                ostream.Seek(0, SeekOrigin.Begin);
                ar.Save(ostream);
            }


            //ostream.Close();
            ostream.Seek(0, SeekOrigin.Begin);
            ostream.Position = 0;

            HttpResponseMessage result = new HttpResponseMessage(HttpStatusCode.OK);
            result.Content = new StreamContent(ostream);
            // Generic Content Header
            var ctype = "application/pdf";
            if (type == "xlsx")
            {
                ctype = "application/octet-stream";
            }
            else if (type == "pdf")
            {
                ctype = "application/pdf";
            }
            else if (type == "htm" || type == "html")
            {
                ctype = "text/html";
            }
            else if (type == "xml")
            {
                ctype = "application/xml";
            }
            result.Content.Headers.ContentType = new MediaTypeHeaderValue(ctype);
            result.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("inline");

            //Set Filename sent to client
            result.Content.Headers.ContentDisposition.FileName = String.Format("{2}.{1}", 0, type, "Incentive");

            return result;

        }

        [HttpGet]
        [Route("getIncentiveMonth")]
        public HttpResponseMessage getIncentiveMonth()
        {

            var saler = "";
            var type = "";
            var value = "";
            try
            {
                saler = this._context.getURLParam("s");
            }
            catch
            {
                saler = "00000";
            }
            try
            {
                type = this._context.getURLParam("t");
            }
            catch
            {
                type = "pdf";
            }
            try
            {
                value = this._context.getURLParam("v");
            }
            catch
            {
                value = DateTime.Now.ToString("yyyy-MM");
            }
            string com = "false";
            MemoryStream ostream = new MemoryStream();
            ZipArchive ar = new ZipArchive();
            if (type == "xml")
            {
                ostream = createExcelIncentiveMonth(saler, value.Split(',')[0], type);
            }
            else if (type == "pdf")
            {
                using (PdfDocumentProcessor pdfDocumentProcessor = new PdfDocumentProcessor())
                {
                    if (com == "false")
                    {
                        pdfDocumentProcessor.CreateEmptyDocument(ostream);
                    }


                    foreach (var month in value.Split(','))
                    {
                        var tmp = createExcelIncentiveMonth(saler, month, type);
                        if (com == "false")
                        {
                            pdfDocumentProcessor.AppendDocument(tmp);
                        }
                        else
                        {
                            tmp.Seek(0, SeekOrigin.Begin);
                            ar.AddStream(month + ".pdf", tmp);
                        }
                    }
                }
            }
            else if (type == "xlsx")
            {
                using (Workbook sourceWorkbook = new Workbook())
                {
                    foreach (var month in value.Split(','))
                    {
                        var tmp = createExcelIncentiveMonth(saler, month, type);

                        var tmpbook = new Workbook();
                        tmpbook.LoadDocument(tmp);
                        var tmpsheet = tmpbook.Worksheets.ActiveWorksheet;

                        var csheet = sourceWorkbook.Worksheets.Add(month);
                        csheet.CopyFrom(tmpsheet);
                    }
                    try
                    {
                        sourceWorkbook.Worksheets.Remove(sourceWorkbook.Worksheets["Sheet1"]);
                    }
                    catch { }
                    sourceWorkbook.SaveDocument(ostream, DocumentFormat.Xlsx);
                }
                //ostream = createExcelIncentiveMonth(saler, value, type);
            }
            else if (type == "htm")
            {
                foreach (var month in value.Split(','))
                {
                    var tmp = createKPIMonth(saler, month, type);
                    tmp.CopyTo(ostream);
                }
            }
            if (com == "true")
            {
                ostream.Seek(0, SeekOrigin.Begin);
                ar.Save(ostream);
            }


            //ostream.Close();
            ostream.Seek(0, SeekOrigin.Begin);
            ostream.Position = 0;

            HttpResponseMessage result = new HttpResponseMessage(HttpStatusCode.OK);
            result.Content = new StreamContent(ostream);
            // Generic Content Header
            var ctype = "application/pdf";
            if (type == "xlsx")
            {
                ctype = "application/octet-stream";
            }
            else if (type == "pdf")
            {
                ctype = "application/pdf";
            }
            else if (type == "htm" || type == "html")
            {
                ctype = "text/html";
            }
            else if (type == "xml")
            {
                ctype = "application/xml";
            }
            result.Content.Headers.ContentType = new MediaTypeHeaderValue(ctype);
            result.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("inline");

            //Set Filename sent to client
            result.Content.Headers.ContentDisposition.FileName = String.Format("{2}.{1}", 0, type, "Incentive");

            return result;

        }

        private static int Qr(DateTime dt)
        {
            return (dt.Month + 2) / 3;
        }

        private IEnumerable<nc_acc_kpi_data> getDataSaler(string saler, string in_month)
        {
            return _context._db._conn.Query<nc_acc_kpi_data>(@"select * from nc_acc_kpi_data where SALE_MAN =@SALE_MAN and IN_MONTH= @IN_MONTH", new { SALE_MAN = saler, IN_MONTH = in_month });
        }
        private IEnumerable<nc_acc_kpi_data> getDataSalerNew(string saler, string in_month)
        {
            return _context._db._conn.Query<nc_acc_kpi_data>(@"select * from nc_acc_kpi_data_new where SALE_MAN =@SALE_MAN and IN_MONTH= @IN_MONTH", new { SALE_MAN = saler, IN_MONTH = in_month });
        }
        private IEnumerable<nc_acc_kpi_kpi> getKPISaler(string saler, string in_month, int type)
        {
            return _context._db._conn.Query<nc_acc_kpi_kpi>(@"select * from nc_acc_kpi_kpi where SALE_MAN =@SALE_MAN and format(IN_MONTH,'yyyy-MM')= @IN_MONTH and SettingType = @SettingType", new { SALE_MAN = saler, IN_MONTH = in_month, SettingType = type });
        }
        private IEnumerable<nc_acc_kpi_kpi> getKPISalerNew(string saler, string in_month, int type)
        {
            return _context._db._conn.Query<nc_acc_kpi_kpi>(@"select * from nc_acc_kpi_kpi_new where SALE_MAN =@SALE_MAN and format(IN_MONTH,'yyyy-MM')= @IN_MONTH and SettingType = @SettingType", new { SALE_MAN = saler, IN_MONTH = in_month, SettingType = type });
        }

        private List<string> getChild(string saler)
        {
            var l = new List<string>();
            var tmp = _context._db._conn.Query<string>(@"select usr.username as CHILD
                from nc_acc_kpi_saler_role rol join nc_core_user usr on rol.[user] = usr.id
                left join nc_core_user par on par.id = rol.parent
                where par.username = @Saler", new { Saler = saler }).ToList();
            foreach (var i in tmp)
            {
                l.Add(i);
                foreach (var ii in getChild(i))
                {
                    l.Add(ii);
                }
            }
            return l;
        }

        private List<string> getValue(DateTime d)
        {
            var list = new List<string>();
            if (d.Month == 1)
            {
                list.Add(d.Year + "-01");
            }
            else if (d.Month == 2)
            {
                list.Add(d.Year + "-01");
                list.Add(d.Year + "-02");
            }
            else if (d.Month == 3)
            {
                list.Add(d.Year + "-01");
                list.Add(d.Year + "-02");
                list.Add(d.Year + "-03");
            }
            else if (d.Month == 4)
            {
                list.Add(d.Year + "-04");

            }
            else if (d.Month == 5)
            {
                list.Add(d.Year + "-04");
                list.Add(d.Year + "-05");

            }
            else if (d.Month == 6)
            {
                list.Add(d.Year + "-04");
                list.Add(d.Year + "-05");
                list.Add(d.Year + "-06");
            }
            else if (d.Month == 7)
            {
                list.Add(d.Year + "-07");

            }
            else if (d.Month == 8)
            {
                list.Add(d.Year + "-07");
                list.Add(d.Year + "-08");

            }
            else if (d.Month == 9)
            {
                list.Add(d.Year + "-07");
                list.Add(d.Year + "-08");
                list.Add(d.Year + "-09");
            }
            else if (d.Month == 10)
            {
                list.Add(d.Year + "-10");

            }
            else if (d.Month == 11)
            {
                list.Add(d.Year + "-10");
                list.Add(d.Year + "-11");

            }
            else if (d.Month == 12)
            {
                list.Add(d.Year + "-10");
                list.Add(d.Year + "-11");
                list.Add(d.Year + "-12");
            }

            return list;
        }


        private MemoryStream createExcelKPI(string saler, string type = "", string value = "")
        {

            var userId = _context._token.getUserID();
            if (string.IsNullOrEmpty(type))
            {
                type = "pdf";
            }
            if (string.IsNullOrEmpty(value))
            {
                value = DateTime.Now.ToString("yyyy-MM");
            }
            var tmpDate = DateTime.Parse(value + "-01");
            DataSet KPI = new DataSet();

            //var strMain = @"
            //    select  nc_acc_kpi_kpi.SALE_MAN ,  nc_acc_kpi_kpi.IN_MONTH ,
            //        nc_acc_kpi_kpi.AR ,  nc_acc_kpi_kpi.IncentiveType1 ,
            //        nc_acc_kpi_kpi.BonusType1 ,
            //        nc_acc_kpi_kpi.IncentiveType2 ,
            //        nc_acc_kpi_kpi.IncentiveType3 ,
            //        nc_acc_kpi_kpi.IncentiveType4 ,  nc_acc_kpi_kpi.TARGET ,
            //        nc_acc_kpi_kpi.KPI ,  nc_acc_kpi_kpi.IncentiveTotal ,
            //        nc_acc_kpi_kpi.SettingType ,  nc_acc_kpi_setting.name ,
            //        nc_acc_kpi_setting.description ,
            //     nc_acc_kpi_setting.type
            //    from ( dbo.nc_acc_kpi_kpi   nc_acc_kpi_kpi 
            //    inner join  dbo.nc_acc_kpi_setting   nc_acc_kpi_setting 
            //        on ( nc_acc_kpi_setting.id  =  nc_acc_kpi_kpi.SettingType ))
            //    where (nc_acc_kpi_kpi.SALE_MAN = '" + saler + @"' and 1=1)
            //    order by nc_acc_kpi_kpi.IN_MONTH asc
            //    ";

            decimal?
                yar = 0, ytr = 0, ykr = 0,
                mar = 0, mtr = 0, mkr = 0,
                qar = 0, qtr = 0, qkr = 0;
            //SqlDataAdapter detailAdapter = new SqlDataAdapter(strMain.Replace("1=1","format(IN_MONTH,'yyyy-MM')='"+value+"'"), ConfigurationManager.ConnectionStrings["KE_DB_MSSQL_STR_CONN"].ConnectionString);
            //detailAdapter.Fill(KPI, "nc_acc_kpi_kpi");

            nc_acc_kpi_kpi header = null;

            //if (KPI.Tables["nc_acc_kpi_kpi"].Rows.Count == 0)
            //{
            var newMain = _context._db._conn.Query<nc_acc_kpi_kpi>(@"
                    select nc_core_user.username SALE_MAN,
                    convert(datetime,'" + value + @"-01',21) IN_MONTH,
                    0.0 as AR,
                    0.0  as IncentiveType1 ,
                    0.0  as BonusType1 ,
                    0.0  as IncentiveType2 ,
                    0.0  as IncentiveType3 ,
                    0.0  as IncentiveType4 ,  
                    nc_acc_kpi_setting.[value] as [TARGET] ,
                    0.0  as KPI ,  
                    0.0  as IncentiveTotal ,
                    nc_acc_kpi_setting.id as  SettingType,  
                    nc_acc_kpi_setting.name ,
                    nc_acc_kpi_setting.description ,
                    nc_acc_kpi_setting.type,
                    zon.name as ZONE1,
                    pos.name as description
                    from nc_acc_kpi_saler_role left join  nc_acc_kpi_setting on nc_acc_kpi_saler_role.kpi_id = nc_acc_kpi_setting.id
                    left join nc_core_user on nc_core_user.id = nc_acc_kpi_saler_role.[user]
                    left join nc_acc_kpi_zone zon on zon.id = nc_acc_kpi_setting.zone
                    left join nc_acc_kpi_postion pos on pos.id = nc_acc_kpi_setting.postion
                    where nc_core_user.username = '" + saler + @"'
                    and isnull(nc_acc_kpi_saler_role.from_date,convert(datetime,'2018-01-01',21))<=convert(datetime,'" + value + @"-01',21)
                    and isnull(nc_acc_kpi_saler_role.to_date,convert(datetime,'2030-12-31',21))>=convert(datetime,'" + value + @"-01',21)
                    and nc_acc_kpi_saler_role._active = 1 and nc_acc_kpi_saler_role._deleted = 0
                    and isnull(nc_acc_kpi_setting.from_date,convert(datetime,'2018-01-01',21))<=convert(datetime,'" + value + @"-01',21)
                    and isnull(nc_acc_kpi_setting.to_date,convert(datetime,'2030-12-31',21))>=convert(datetime,'" + value + @"-01',21)
                    and nc_acc_kpi_setting._active = 1 and nc_acc_kpi_setting._deleted = 0
                    ");
            var mainTable = new nc_acc_kpi_kpi().getDatatable();
            KPI.Tables.Add(mainTable);
            var detailTable = new nc_acc_kpi_data().getDatatable();
            KPI.Tables.Add(detailTable);
            if (newMain != null)
            {
                header = newMain.FirstOrDefault();

                foreach (var t in newMain)
                {

                    if (t.type == 1)
                    {
                        var kpi = getKPISaler(saler, value, t.SettingType).FirstOrDefault();
                        if (kpi != null)
                        {
                            KPI.Tables["nc_acc_kpi_kpi"].Rows.Add(kpi.toDataRow().ItemArray);
                            mar += kpi.AR;
                        }
                        else
                        {
                            KPI.Tables["nc_acc_kpi_kpi"].Rows.Add(t.toDataRow().ItemArray);
                            mar += t.AR;
                        }
                        var datatmp = getDataSaler(saler, value);
                        foreach (var dd in datatmp)
                        {
                            KPI.Tables["nc_acc_kpi_data"].Rows.Add(dd.toDataRow().ItemArray);
                        }
                        mtr = t.TARGET;
                    }
                    else
                    {
                        for (var i = 1; i <= tmpDate.Month; i++)
                        {
                            var key = tmpDate.Year + "-" + (i < 10 ? "0" : "") + i;
                            foreach (var c in getChild(saler))
                            {

                                foreach (var dd in getDataSaler(c, key))
                                {
                                    if (key == value)
                                    {
                                        dd.IN_MONTH = DateTime.Parse(key + "-01");
                                        dd.SALE_MAN_CHILD = dd.SALE_MAN;
                                        dd.SALE_MAN = saler;
                                        KPI.Tables["nc_acc_kpi_data"].Rows.Add(dd.toDataRow().ItemArray);
                                        mar += dd.SERVICE_PERIOD <= 3 ? dd.doanh_thu : 0;
                                    }
                                    if (getValue(tmpDate).Contains(key))
                                    {
                                        qar += dd.SERVICE_PERIOD <= 3 ? dd.doanh_thu : 0;
                                    }

                                    yar += dd.SERVICE_PERIOD <= 3 ? dd.doanh_thu : 0;
                                    t.AR = qar;
                                }
                            }

                        }
                        mtr = t.TARGET;
                        t.TARGET = t.TARGET * 3;
                        t.KPI = t.AR / t.TARGET;
                        //mtr = t.TARGET;
                        KPI.Tables["nc_acc_kpi_kpi"].Rows.Add(t.toDataRow().ItemArray);
                    }

                }
            }

            //}
            //else
            //{
            //    var tmpDate = DateTime.Parse(value + "-01");
            //    var tmpMain = _context._db._conn.Query<nc_acc_kpi_kpi>(strMain);
            //    if (tmpMain != null)
            //    {
            //        header = tmpMain.FirstOrDefault();
            //        yar = tmpMain.Where(x => x.IN_MONTH.Value.Year == tmpDate.Year).Sum(x => x.AR);
            //        mar = tmpMain.Where(x => x.IN_MONTH.Value.Month == tmpDate.Month).Sum(x => x.AR);
            //        qar = tmpMain.Where(x => Qr(x.IN_MONTH.Value) == Qr(tmpDate)).Sum(x => x.AR);
            //        mtr = tmpMain.Where(x => x.IN_MONTH.Value.Month == tmpDate.Month).Sum(x => x.TARGET);
            //        qtr = mtr * 3;
            //        ytr = mtr * 12;
            //        ykr = yar / (ytr > 0 ? ytr : 1);
            //        qkr = qar / (qtr > 0 ? qtr : 1);
            //        mkr = mar / (mtr > 0 ? mtr : 1);
            //    }
            //}



            //var sqlStr = @"select nc_acc_kpi_data.ma_kh,
            //           nc_acc_kpi_data.ten_kh,
            //           nc_acc_kpi_data.join_date,
            //           nc_acc_kpi_data.SERVICE_PERIOD,
            //           nc_acc_kpi_data.PriceType1,
            //           nc_acc_kpi_data.PriceType1A,
            //           nc_acc_kpi_data.PriceType1B,
            //           nc_acc_kpi_data.PriceType2,
            //           nc_acc_kpi_data.PriceType2A,
            //           nc_acc_kpi_data.PriceType2B,
            //           nc_acc_kpi_data.PriceType3,
            //           nc_acc_kpi_data.PriceType4,
            //           convert(datetime,nc_acc_kpi_data.in_month+'-01',21) as IN_MONTH,
            //           nc_acc_kpi_data.doanh_thu,
            //           nc_core_user.firstname,
            //           nc_core_user.lastname,
            //           nc_acc_kpi_customer.[user] as SALE_MAN
            //      from ((dbo.nc_acc_kpi_data nc_acc_kpi_data
            //      inner join dbo.nc_acc_kpi_customer
            //           nc_acc_kpi_customer
            //           on (nc_acc_kpi_customer.name = nc_acc_kpi_data.ma_kh))
            //      inner join dbo.nc_core_user nc_core_user
            //           on (nc_core_user.username = nc_acc_kpi_customer.[user]))";
            //SqlDataAdapter customerAdapter = new SqlDataAdapter(sqlStr + " WHERE nc_acc_kpi_customer.[user]='"+saler+"'",
            //    ConfigurationManager.ConnectionStrings["KE_DB_MSSQL_STR_CONN"].ConnectionString);
            //customerAdapter.Fill(KPI, "nc_acc_kpi_data");

            //var all = _context._db._conn.Query(sqlStr);


            //DataColumn par, chi;
            var par_1 = KPI.Tables["nc_acc_kpi_kpi"].Columns["SALE_MAN"];
            var par_2 = KPI.Tables["nc_acc_kpi_kpi"].Columns["IN_MONTH"];
            var chi_1 = KPI.Tables["nc_acc_kpi_data"].Columns["SALE_MAN"];
            var chi_2 = KPI.Tables["nc_acc_kpi_data"].Columns["IN_MONTH"];
            var rel1 = new DataRelation("nc_acc_kpi_kpinc_acc_kpi_data", new DataColumn[] { par_1, par_2 }, new DataColumn[] { chi_1, chi_2 }, false);
            KPI.Relations.Add(rel1);
            string path = System.Web.HttpContext.Current.Request.MapPath(String.Format("~/App_Data/ExcelTemplate/SalerKPI.xlsx"));

            Workbook workbook = new DevExpress.Spreadsheet.Workbook();

            workbook.LoadDocument(path);



            if (header != null)
            {

                var headd = header.toDictionary();

                var usr = _context._db._conn.Query(@"select * from nc_core_user where username='" + saler + "'").FirstOrDefault();
                if (usr != null)
                {
                    headd.Add("FULL_NAME", usr.lastname + " " + usr.firstname);
                }

                headd.Add("M_AR", mar);
                headd.Add("M_TARGET", mtr);
                headd.Add("Q_AR", qar);
                headd.Add("Q_TARGET", mtr * 3);
                headd.Add("Y_AR", yar);
                headd.Add("Y_TARGET", mtr * 12);
                headd.Add("FROM_DATE", tmpDate);
                headd.Add("TO_DATE", tmpDate.AddMonths(1).AddDays(-1));


                var headt = workbook.Worksheets.ActiveWorksheet.DefinedNames.GetDefinedName("HEADERRANGE");
                foreach (Cell c in headt.Range.Search("FIELD("))
                {
                    try
                    {
                        var or = c.Value.ToString();
                        var nr = new Regex("\\[([A-Za-z0-9_]+)\\]");

                        c.SetValueFromText(nr.Replace(or, m =>
                        {
                            var gr = m.Groups[1].Value;
                            var ge = headd[gr];
                            if (ge == null)
                                return "";
                            var t = ge.GetType();
                            if (t == typeof(DateTime))
                                return String.Format("{0:yyyy-MM-dd}", ge);
                            if (t == typeof(decimal))
                                return String.Format("{0:0}", ge);
                            return ge.ToString();
                        }));
                        //c.Value = ;
                    }
                    catch (Exception ex)
                    {

                    }

                }
                var foott = workbook.Worksheets.ActiveWorksheet.DefinedNames.GetDefinedName("FOOTERRANGE");
                foreach (Cell c in foott.Range.Search("FIELD("))
                {
                    try
                    {
                        var or = c.Value.ToString();
                        var nr = new Regex("\\[([A-Za-z0-9_]+)\\]");
                        c.Value = nr.Replace(or, m =>
                        {
                            var gr = m.Groups[1].Value;
                            var ge = headd[gr];
                            var t = ge.GetType();
                            if (t == typeof(DateTime))
                                return String.Format("{0:dd/MM/yyyy}", ge);
                            if (t == typeof(decimal))
                                return String.Format("{0:#,#}", ge);
                            return ge.ToString();
                        });
                    }
                    catch (Exception ex)
                    {

                    }

                }
            }
            var acsheet = workbook.Worksheets.ActiveWorksheet;



            MemoryStream ostream = new MemoryStream();
            workbook.MailMergeDataSource = KPI;
            workbook.MailMergeDataMember = "nc_acc_kpi_kpi";
            workbook.AddService(typeof(IChartControllerFactoryService), new ChartControllerFactoryService());
            workbook.AddService(typeof(IChartImageService), new ChartImageService());
            //var datamember = workbook.Worksheets.ActiveWorksheet.DefinedNames.GetDefinedName("DETAILDATAMEMBER0");
            //datamember.RefersTo = "link";
            var result = workbook.GenerateMailMergeDocuments();
            //result[0].Sheets[0].
            foreach (var book in result)
            {
                book.AddService(typeof(IChartControllerFactoryService), new ChartControllerFactoryService());
                book.AddService(typeof(IChartImageService), new ChartImageService());

            }


            if (type == "xlsx")
            {
                //workbook.SaveToStream(ostream, FileFormat.Version2007);
                result[0].SaveDocument(ostream, DocumentFormat.Xlsx);

            }
            else if (type == "pdf")
            {
                //workbook.ConverterSetting.SheetFitToPage = true;
                //workbook.SaveToStream(ostream, FileFormat.PDF);
                result[0].ExportToPdf(ostream);
            }
            else if (type == "htm" || type == "html")
            {
                var option = new HtmlDocumentExporterOptions();
                option.EmbedImages = true;
                //option.ExportImages = true;
                option.SheetIndex = 0;

                //option.FontUnit = DevExpress.XtraSpreadsheet.Export.Html.HtmlFontUnit.Pixel;
                //option.OverrideImageResolution = 72;

                result[0].ExportToHtml(ostream, option);
            }
            else if (type == "xml")
            {
                KPI.WriteXmlSchema(ostream);
            }

            ostream.Seek(0, SeekOrigin.Begin);
            ostream.Position = 0;

            return ostream;
        }

        private List<string> getChild(List<string> saler)
        {
            var rs = new List<string>();
            rs = _context._db._conn.Query<string>(@"SELECT 	
	            user_par.username as SALE_MAN
              FROM [kevncore].[dbo].[nc_acc_kpi_saler_role]
              left join nc_core_user user_par on [nc_acc_kpi_saler_role].[user] = user_par.id
              left join nc_core_user user_chi on [nc_acc_kpi_saler_role].parent = user_chi.id
              where user_chi.username in @saler and user_par.username is not null", new { saler = saler.ToArray() }).ToList<string>();
            if (rs.Count > 0)
            {
                rs.AddRange(getChild(rs));
            }
            rs.AddRange(saler);
            return rs;
        }

        private MemoryStream createExcelIncentiveMonth(String Saler, string value = "", string type = "")
        {

            var userId = _context._token.getUserID();
            if (string.IsNullOrEmpty(type))
            {
                type = "pdf";
            }
            if (string.IsNullOrEmpty(value))
            {
                value = DateTime.Now.ToString("yyyy-MM");
            }
            Workbook workbook = new DevExpress.Spreadsheet.Workbook();
            IWorkbook rstbook = new Workbook();
            MemoryStream ostream = new MemoryStream();
            //var tmpDate = DateTime.Parse(value + "-01");
            DataSet KPI = new DataSet();
            string pathResult = System.Web.HttpContext.Current.Request.MapPath(String.Format("~/App_Data/IncentiveResult/{0}.xlsx", value));
            string pathXML = System.Web.HttpContext.Current.Request.MapPath(String.Format("~/App_Data/IncentiveResult/Incentive.xml"));
            if (System.IO.File.Exists(pathXML) && type == "xml")
            {
                XmlDocument doc = new XmlDocument();
                doc.Load(pathXML);
                doc.Save(ostream);
            }
            else if (System.IO.File.Exists(pathResult))
            {
                workbook.LoadDocument(pathResult);
                rstbook = workbook;
            }
            else
            {



                var IN_MONTH = new DataTable("IN_MONTH");
                IN_MONTH.Columns.Add("IN_MONTH", typeof(string));
                IN_MONTH.Columns.Add("REF", typeof(int));
                foreach (var im in value.Split(','))
                {

                    IN_MONTH.Rows.Add(im, 1);
                }
                KPI.Tables.Add(IN_MONTH);

                var fromDate = DateTime.Today;
                var toDate = new DateTime(2018, 01, 01);
                foreach (var dt in value.Split(','))
                {
                    string str = dt + "-01";
                    var tmpD = DateTime.Parse(str);
                    if (fromDate > tmpD)
                    {
                        fromDate = tmpD;
                    }
                    if (toDate < tmpD)
                    {
                        toDate = tmpD;
                    }
                }

                var tmpRol = _context._db._conn.Query<tmpROLE>(@"SELECT       nc_acc_kpi_saler_role.[user], nc_acc_kpi_setting.name, nc_acc_kpi_setting.type, nc_acc_kpi_setting.zone, nc_acc_kpi_setting.postion, nc_acc_kpi_setting.[default] as _default, nc_acc_kpi_setting.value AS TARGET, 
                         nc_acc_kpi_setting.formula, ISNULL(nc_acc_kpi_saler_role.parent, nc_acc_kpi_saler_role.[user]) AS PARENT, nc_core_user.username, nc_core_user.lastname, nc_core_user.firstname, nc_core_user_1.username AS PIC, 
                         nc_acc_kpi_postion.name AS postion_name, nc_acc_kpi_postion.description AS postion_description, nc_acc_kpi_zone.name AS zone_name, nc_acc_kpi_zone.description AS zone_description, nc_acc_kpi_month.IN_MONTH, 
                         nc_acc_kpi_month.MONTH
                FROM            nc_acc_kpi_saler_role AS nc_acc_kpi_saler_role INNER JOIN
                         nc_acc_kpi_setting AS nc_acc_kpi_setting ON nc_acc_kpi_setting.id = nc_acc_kpi_saler_role.kpi_id LEFT OUTER JOIN
                         nc_core_user AS nc_core_user ON nc_core_user.id = nc_acc_kpi_saler_role.[user] LEFT OUTER JOIN
                         nc_core_user AS nc_core_user_1 ON nc_core_user_1.id = nc_acc_kpi_saler_role.parent LEFT OUTER JOIN
                         nc_acc_kpi_postion AS nc_acc_kpi_postion ON nc_acc_kpi_postion.id = nc_acc_kpi_setting.postion LEFT OUTER JOIN
                         nc_acc_kpi_zone AS nc_acc_kpi_zone ON nc_acc_kpi_zone.id = nc_acc_kpi_setting.zone INNER JOIN
                         nc_acc_kpi_month AS nc_acc_kpi_month ON nc_acc_kpi_month.REF = nc_acc_kpi_saler_role.type
                WHERE        (nc_acc_kpi_saler_role._active = 1) AND (nc_acc_kpi_saler_role._deleted = 0) AND (nc_acc_kpi_setting._active = 1) AND (nc_acc_kpi_setting._deleted =0) AND (nc_acc_kpi_saler_role.from_date IS NULL OR
                         nc_acc_kpi_saler_role.from_date <= @FROM_DATE) AND (nc_acc_kpi_saler_role.to_date IS NULL OR
                         nc_acc_kpi_saler_role.to_date >=@TO_DATE) AND (nc_acc_kpi_setting.from_date IS NULL OR
                         nc_acc_kpi_setting.from_date <= @FROM_DATE) AND (nc_acc_kpi_setting.to_date IS NULL OR
                         nc_acc_kpi_setting.to_date >=@TO_DATE) --AND nc_core_user.username in @SALER
                         and nc_acc_kpi_month.MONTH >=@FROM_DATE and nc_acc_kpi_month.MONTH <= @TO_DATE
                ORDER BY nc_acc_kpi_setting.postion, nc_core_user.username, nc_acc_kpi_setting.zone", new
                {
                    FROM_DATE = fromDate,
                    TO_DATE = toDate,
                    SALER = getChild(Saler.Split(',').ToList<string>()).ToArray()
                });

                var ROLE = new tmpROLE().getDatatable();
                foreach (var it in tmpRol)
                {
                    ROLE.Rows.Add(it.toDataRow().ItemArray);

                }
                KPI.Tables.Add(ROLE);
                var tmpDat = _context._db._conn.Query<tmpDATA>(@"SELECT        ma_kh, ten_kh, join_date, customer_type, SERVICE_PERIOD, in_month, doanh_thu, num_package, ISNULL(dc, 0) AS DC, person_com_rate, person_com_target, customer_com_rate, customer_com_target, 
                                            sale_com_rate, sale_com_target, SALE_MAN, PriceType1, PriceType1A, PriceType1B, PriceType2, PriceType2A, PriceType2B, PriceType3, PriceType4, IncentiveType1, IncentiveType3, IncentiveType4, ISNULL(com, 0) AS COM, 
                                            CUOC_PUBLIC, First3Month, After3Month, invoice_date, payment_date
                                        FROM            dbo.nc_acc_kpi_data_new AS nc_acc_kpi_data_new
                                        WHERE 1=1 --AND SALE_MAN in @SALER 
                                        AND IN_MONTH in @IN_MONTH      
                                        ORDER BY in_month, ma_kh", new { SALER = getChild(Saler.Split(',').ToList<string>()).ToArray(), IN_MONTH = value.Split(',') }
                );

                var DATA = new tmpDATA().getDatatable();
                foreach (var it in tmpDat)
                {
                    DATA.Rows.Add(it.toDataRow().ItemArray);
                }
                KPI.Tables.Add(DATA);

                var par_1 = KPI.Tables["IN_MONTH"].Columns["IN_MONTH"];
                var par_2 = KPI.Tables["IN_MONTH"].Columns["REF"];
                var chi_1 = KPI.Tables["ROLE"].Columns["IN_MONTH"];
                var chi_2 = KPI.Tables["ROLE"].Columns["type"];
                var chi_3 = KPI.Tables["ROLE"].Columns["username"];
                var dat_1 = KPI.Tables["DATA"].Columns["in_month"];
                var dat_2 = KPI.Tables["DATA"].Columns["SALE_MAN"];
                var rel1 = new DataRelation("IN_MONTHROLE", new DataColumn[] { par_1 }, new DataColumn[] { chi_1 }, false);
                var rel2 = new DataRelation("ROLEDATA", new DataColumn[] { chi_1, chi_3 }, new DataColumn[] { dat_1, dat_2 }, false);
                KPI.Relations.Add(rel1);
                KPI.Relations.Add(rel2);
                string path = System.Web.HttpContext.Current.Request.MapPath(String.Format("~/App_Data/ExcelTemplate/IncentiveMonthFinal.xlsx"));

                workbook.LoadDocument(path);


                workbook.MailMergeDataSource = KPI;
                workbook.MailMergeDataMember = "IN_MONTH";

                var result = workbook.GenerateMailMergeDocuments();
                rstbook = result[0];
                rstbook.SaveDocument(pathResult, DocumentFormat.Xlsx);
            }

            if (type == "xlsx")
            {
                //workbook.SaveToStream(ostream, FileFormat.Version2007);
                rstbook.SaveDocument(ostream, DocumentFormat.Xlsx);

            }
            else if (type == "pdf")
            {
                rstbook.ExportToPdf(ostream);
            }
            else if (type == "htm" || type == "html")
            {
                var option = new HtmlDocumentExporterOptions();
                option.EmbedImages = true;
                //option.ExportImages = true;
                option.SheetIndex = 0;
                rstbook.ExportToHtml(ostream, option);
            }
            else if (type == "xml")
            {
                try
                {
                    KPI.WriteXmlSchema(ostream);
                    KPI.WriteXmlSchema(pathXML);
                }
                catch (Exception ex) { }

            }

            ostream.Seek(0, SeekOrigin.Begin);
            ostream.Position = 0;

            return ostream;
        }



        private MemoryStream createKPIMonth(string saler, string value = "", string type = "")
        {

            var userId = _context._token.getUserID();
            if (string.IsNullOrEmpty(type))
            {
                type = "pdf";
            }
            if (string.IsNullOrEmpty(value) || value == "undefined")
            {
                value = DateTime.Now.ToString("yyyy-MM");
            }
            var tmpDate = DateTime.Parse(value + "-01");
            DataSet KPI = new DataSet();

            var monthTable = KPI.Tables.Add("MONTH");
            var main_2 = monthTable.Columns.Add("IN_MONTH", typeof(DateTime));
            monthTable.Rows.Add(value);

            var mainTable = new nc_acc_kpi_kpi().getDatatable();
            KPI.Tables.Add(mainTable);
            var detailTable = new nc_acc_kpi_data().getDatatable();
            KPI.Tables.Add(detailTable);

            //maintable.Columns.Add("SALE_MAN", typeof(string));
            //foreach(var sale in saler.Split(','))
            //{

            //}

            var commis = _context._db._conn.Query(@"select com.client_code as MA_KH, com.in_month as IN_MONTH, sum(isnull(com.actual_commission_paid,0)) as COM 
                from [dbo].[nc_accounting_upload_commistion] com
                group by com.client_code, com.in_month");
            var discount = _context._db._conn.Query(@"select dis.ma_kh as MA_KH, dis.in_month as IN_MONTH, sum(isnull(dis.dc,0)) as DC 
                from nc_accounting_temp_discount dis
                group by MA_KH, IN_MONTH");

            var par_data = _context._db._conn.Query<nc_acc_kpi_kpi>(@"
            select nc_core_user.username SALE_MAN,
                    convert(datetime,'" + value + @"-01',21) IN_MONTH,
                    0.0 as AR,
                    0.0  as IncentiveType1 ,
                    0.0  as BonusType1 ,
                    0.0  as IncentiveType2 ,
                    0.0  as IncentiveType3 ,
                    0.0  as IncentiveType4 ,  
                    nc_acc_kpi_setting.[value] as [TARGET] ,
                    0.0  as KPI ,  
                    0.0  as IncentiveTotal ,
                    nc_acc_kpi_setting.id as  SettingType,  
                    nc_acc_kpi_setting.name ,                    
                    nc_acc_kpi_setting.type,
                    zon.name as ZONE1,
                    nc_core_user.lastname+' '+nc_core_user.firstname as name,
                    pos.name description
                    from nc_acc_kpi_saler_role left join  nc_acc_kpi_setting on nc_acc_kpi_saler_role.kpi_id = nc_acc_kpi_setting.id
                    left join nc_core_user on nc_core_user.id = nc_acc_kpi_saler_role.[user]
                    left join nc_acc_kpi_zone zon on zon.id = nc_acc_kpi_setting.zone
                    left join nc_acc_kpi_postion pos on pos.id = nc_acc_kpi_setting.postion
                    where nc_core_user.username in('" + String.Join("','", saler.Split(',')) + @"')
                    and isnull(nc_acc_kpi_saler_role.from_date,convert(datetime,'2018-01-01',21))<=convert(datetime,'" + value + @"-01',21)
                    and isnull(nc_acc_kpi_saler_role.to_date,convert(datetime,'2030-12-31',21))>=convert(datetime,'" + value + @"-01',21)
                    and nc_acc_kpi_saler_role._active = 1 and nc_acc_kpi_saler_role._deleted = 0
                    and isnull(nc_acc_kpi_setting.from_date,convert(datetime,'2018-01-01',21))<=convert(datetime,'" + value + @"-01',21)
                    and isnull(nc_acc_kpi_setting.to_date,convert(datetime,'2030-12-31',21))>=convert(datetime,'" + value + @"-01',21)
                    and nc_acc_kpi_setting._active = 1 and nc_acc_kpi_setting._deleted = 0
            ");

            foreach (var t in par_data)
            {
                if (t.type == 1)
                {
                    if (tmpDate < new DateTime(2018, 07, 01))
                    {
                        //var kpi = getKPISalerNew(t.SALE_MAN, value, t.SettingType).FirstOrDefault() ?? new nc_acc_kpi_kpi();
                        t.IncentiveTotal = 0;
                        t.AR = 0;
                        t.DC = 0;
                        t.COM = 0;
                        var datatmp = getDataSalerNew(t.SALE_MAN, value);
                        foreach (var dd in datatmp)
                        {
                            decimal? newAR = dd.doanh_thu ?? 0;
                            t.AR += newAR;
                            decimal? dc = 0;
                            decimal? com = 0;
                            try
                            {
                                com = commis.Where(x => x.MA_KH == dd.ma_kh && String.Format("{0:yyyy-MM}", tmpDate) == x.IN_MONTH).Sum(x => (decimal)x.COM);
                                dc = discount.Where(x => x.MA_KH == dd.ma_kh && String.Format("{0:yyyy-MM}", tmpDate) == x.IN_MONTH).Sum(x => (decimal)x.DC);
                            }
                            catch (Exception ex) { }
                            newAR -= com;
                            newAR -= dc;
                            t.COM += com;
                            t.DC += dc;
                            if (newAR > 0)
                            {
                                dd.IncentiveType1 = newAR * 0.01m;
                                t.IncentiveTotal += newAR * 0.01m;
                            }
                            KPI.Tables["nc_acc_kpi_data"].Rows.Add(dd.toDataRow().ItemArray);
                        }
                        t.IncentiveTotal = t.IncentiveTotal > 2000000 ? 2000000 : t.IncentiveTotal;
                        KPI.Tables["nc_acc_kpi_kpi"].Rows.Add(t.toDataRow().ItemArray);
                    }
                    else
                    {
                        var kpi = getKPISalerNew(t.SALE_MAN, value, t.SettingType).FirstOrDefault();
                        if (kpi != null)
                        {

                            KPI.Tables["nc_acc_kpi_kpi"].Rows.Add(kpi.toDataRow().ItemArray);

                        }
                        else
                        {
                            KPI.Tables["nc_acc_kpi_kpi"].Rows.Add(t.toDataRow().ItemArray);

                        }
                        var datatmp = getDataSalerNew(t.SALE_MAN, value);
                        foreach (var dd in datatmp)
                        {
                            KPI.Tables["nc_acc_kpi_data"].Rows.Add(dd.toDataRow().ItemArray);
                        }
                    }


                }
                else
                {
                    var pos = _context._db._conn.Query<int>(@"select isnull(postion,0) as pos
                        from nc_acc_kpi_setting 
                        where id = 2").FirstOrDefault();
                    decimal? mar = 0,
                        nar = 0,
                        mtr = t.TARGET;
                    List<nc_acc_kpi_data> tam = new List<nc_acc_kpi_data>();
                    var gvl = getValue(tmpDate);
                    foreach (var mo in gvl)
                    {

                        foreach (var sale in saler.Split(','))
                        {

                            foreach (var c in getChild(sale))
                            {
                                foreach (var dd in getDataSalerNew(c, mo))
                                {

                                    //dd.IN_MONTH = DateTime.Parse(value + "-01");
                                    dd.SALE_MAN_CHILD = c;
                                    dd.SALE_MAN = sale;
                                    if (dd.SERVICE_PERIOD <= 3)
                                    {
                                        nar += dd.doanh_thu;
                                    }
                                    mar += dd.doanh_thu;
                                    dd.IncentiveType1 = 0;
                                    dd.IncentiveType3 = 0;
                                    dd.IncentiveType4 = 0;
                                    dd.IncentiveType2 = 0;

                                    tam.Add(dd);
                                }
                            }
                        }
                    }
                    t.AR = 0;
                    t.BonusType1 = 0;
                    if (tmpDate.Month % 3 == 0)
                    {
                        t.AR = mar;
                        t.TARGET = t.TARGET * 3;
                        t.KPI = mar / t.TARGET;
                        foreach (var dd in tam)
                        {
                            decimal tt = t.KPI.Value;
                            decimal rate = 0;
                            decimal mul = 0;
                            if (tt > 0.8m && tt <= 1.0m)
                            {
                                mul = tt;
                            }
                            else if (tt > 1.0m)
                            {
                                mul = 1.0m;
                            }

                            if (pos == 3)
                            {
                                rate = 0.7m * 0.01m;
                            }
                            else if (pos == 2)
                            {
                                rate = 0.65m * 0.01m;
                            }
                            else if (pos == 1)
                            {
                                rate = 0.6m * 0.01m;
                            }
                            dd.IN_MONTH = DateTime.Parse(value + "-01");
                            dd.BonusType1 = (dd.SERVICE_PERIOD <= 3 ? dd.doanh_thu : 0) * mul * rate;
                            t.BonusType1 += dd.BonusType1;
                            t.IncentiveTotal = t.BonusType1;
                            KPI.Tables["nc_acc_kpi_data"].Rows.Add(dd.toDataRow().ItemArray);
                        }
                    }
                    else
                    {
                        var dat = tam.Where(x => x.IN_MONTH.Value.Month == tmpDate.Month);
                        t.AR = dat.Sum(x => x.doanh_thu) ?? 0;
                        //t.TARGET = t.TARGET * 3;
                        t.KPI = t.AR / t.TARGET;
                        foreach (var dd in dat)
                        {
                            KPI.Tables["nc_acc_kpi_data"].Rows.Add(dd.toDataRow().ItemArray);
                        }
                    }
                    KPI.Tables["nc_acc_kpi_kpi"].Rows.Add(t.toDataRow().ItemArray);
                }
            }



            var par_1 = KPI.Tables["nc_acc_kpi_kpi"].Columns["SALE_MAN"];
            var par_2 = KPI.Tables["nc_acc_kpi_kpi"].Columns["IN_MONTH"];
            var chi_1 = KPI.Tables["nc_acc_kpi_data"].Columns["SALE_MAN"];
            var chi_2 = KPI.Tables["nc_acc_kpi_data"].Columns["IN_MONTH"];
            var rel1 = new DataRelation("nc_acc_kpi_kpinc_acc_kpi_data", new DataColumn[] { par_1, par_2 }, new DataColumn[] { chi_1, chi_2 }, false);
            KPI.Relations.Add("nc_acc_kpi_kpi_newnc_acc_kpi_kpi", main_2, par_2);
            KPI.Relations.Add(rel1);

            string path = System.Web.HttpContext.Current.Request.MapPath(String.Format("~/App_Data/ExcelTemplate/MonthKPI.xlsx"));

            Workbook workbook = new DevExpress.Spreadsheet.Workbook();

            workbook.LoadDocument(path);



            var acsheet = workbook.Worksheets.ActiveWorksheet;



            MemoryStream ostream = new MemoryStream();
            workbook.MailMergeDataSource = KPI;
            workbook.MailMergeDataMember = "nc_acc_kpi_kpi_new";
            var result = workbook.GenerateMailMergeDocuments();
            result[0].Worksheets[0].Range["A:S"].AutoFitColumns();
            if (type == "xlsx")
            {
                //workbook.SaveToStream(ostream, FileFormat.Version2007);
                result[0].SaveDocument(ostream, DocumentFormat.Xlsx);

            }
            else if (type == "pdf")
            {
                //workbook.ConverterSetting.SheetFitToPage = true;
                //workbook.SaveToStream(ostream, FileFormat.PDF);
                //var pdfExportOption = new DevExpress.XtraPrinting.PdfExportOptions ();
                //pdfExportOption.
                result[0].ExportToPdf(ostream);
            }
            else if (type == "htm" || type == "html")
            {
                var option = new HtmlDocumentExporterOptions();
                option.EmbedImages = true;
                //option.ExportImages = true;
                option.SheetIndex = 0;

                //option.FontUnit = DevExpress.XtraSpreadsheet.Export.Html.HtmlFontUnit.Pixel;
                //option.OverrideImageResolution = 72;

                result[0].ExportToHtml(ostream, option);
            }
            else if (type == "xml")
            {
                KPI.WriteXmlSchema(ostream);
            }

            ostream.Seek(0, SeekOrigin.Begin);
            ostream.Position = 0;

            return ostream;
        }

        private MemoryStream createKPIMonth_Old(string saler, string value = "", string type = "")
        {

            var userId = _context._token.getUserID();
            if (string.IsNullOrEmpty(type))
            {
                type = "pdf";
            }
            if (string.IsNullOrEmpty(value) || value == "undefined")
            {
                value = DateTime.Now.ToString("yyyy-MM");
            }
            var tmpDate = DateTime.Parse(value + "-01");
            DataSet KPI = new DataSet();

            var monthTable = KPI.Tables.Add("nc_acc_kpi_kpi_new");
            var main_2 = monthTable.Columns.Add("IN_MONTH", typeof(DateTime));
            monthTable.Rows.Add(value);

            var mainTable = new nc_acc_kpi_kpi().getDatatable();
            KPI.Tables.Add(mainTable);
            var detailTable = new nc_acc_kpi_data().getDatatable();
            KPI.Tables.Add(detailTable);

            //maintable.Columns.Add("SALE_MAN", typeof(string));
            //foreach(var sale in saler.Split(','))
            //{

            //}

            var commis = _context._db._conn.Query(@"select com.client_code as MA_KH, com.in_month as IN_MONTH, sum(isnull(com.actual_commission_paid,0)) as COM 
                from [dbo].[nc_accounting_upload_commistion] com
                group by com.client_code, com.in_month");
            var discount = _context._db._conn.Query(@"select dis.ma_kh as MA_KH, dis.in_month as IN_MONTH, sum(isnull(dis.dc,0)) as DC 
                from nc_accounting_temp_discount dis
                group by MA_KH, IN_MONTH");

            var par_data = _context._db._conn.Query<nc_acc_kpi_kpi>(@"
            select nc_core_user.username SALE_MAN,
                    convert(datetime,'" + value + @"-01',21) IN_MONTH,
                    0.0 as AR,
                    0.0  as IncentiveType1 ,
                    0.0  as BonusType1 ,
                    0.0  as IncentiveType2 ,
                    0.0  as IncentiveType3 ,
                    0.0  as IncentiveType4 ,  
                    nc_acc_kpi_setting.[value] as [TARGET] ,
                    0.0  as KPI ,  
                    0.0  as IncentiveTotal ,
                    nc_acc_kpi_setting.id as  SettingType,  
                    nc_acc_kpi_setting.name ,                    
                    nc_acc_kpi_setting.type,
                    zon.name as ZONE1,
                    nc_core_user.lastname+' '+nc_core_user.firstname as name,
                    pos.name description
                    from nc_acc_kpi_saler_role left join  nc_acc_kpi_setting on nc_acc_kpi_saler_role.kpi_id = nc_acc_kpi_setting.id
                    left join nc_core_user on nc_core_user.id = nc_acc_kpi_saler_role.[user]
                    left join nc_acc_kpi_zone zon on zon.id = nc_acc_kpi_setting.zone
                    left join nc_acc_kpi_postion pos on pos.id = nc_acc_kpi_setting.postion
                    where nc_core_user.username in('" + String.Join("','", saler.Split(',')) + @"')
                    and isnull(nc_acc_kpi_saler_role.from_date,convert(datetime,'2018-01-01',21))<=convert(datetime,'" + value + @"-01',21)
                    and isnull(nc_acc_kpi_saler_role.to_date,convert(datetime,'2030-12-31',21))>=convert(datetime,'" + value + @"-01',21)
                    and nc_acc_kpi_saler_role._active = 1 and nc_acc_kpi_saler_role._deleted = 0
                    and isnull(nc_acc_kpi_setting.from_date,convert(datetime,'2018-01-01',21))<=convert(datetime,'" + value + @"-01',21)
                    and isnull(nc_acc_kpi_setting.to_date,convert(datetime,'2030-12-31',21))>=convert(datetime,'" + value + @"-01',21)
                    and nc_acc_kpi_setting._active = 1 and nc_acc_kpi_setting._deleted = 0
            ");

            foreach (var t in par_data)
            {
                if (t.type == 1)
                {
                    if (tmpDate < new DateTime(2018, 07, 01))
                    {
                        //var kpi = getKPISalerNew(t.SALE_MAN, value, t.SettingType).FirstOrDefault() ?? new nc_acc_kpi_kpi();
                        t.IncentiveTotal = 0;
                        t.AR = 0;
                        t.DC = 0;
                        t.COM = 0;
                        var datatmp = getDataSalerNew(t.SALE_MAN, value);
                        foreach (var dd in datatmp)
                        {
                            decimal? newAR = dd.doanh_thu ?? 0;
                            t.AR += newAR;
                            decimal? dc = 0;
                            decimal? com = 0;
                            try
                            {
                                com = commis.Where(x => x.MA_KH == dd.ma_kh && String.Format("{0:yyyy-MM}", tmpDate) == x.IN_MONTH).Sum(x => (decimal)x.COM);
                                dc = discount.Where(x => x.MA_KH == dd.ma_kh && String.Format("{0:yyyy-MM}", tmpDate) == x.IN_MONTH).Sum(x => (decimal)x.DC);
                            }
                            catch (Exception ex) { }
                            newAR -= com;
                            newAR -= dc;
                            t.COM += com;
                            t.DC += dc;
                            if (newAR > 0)
                            {
                                dd.IncentiveType1 = newAR * 0.01m;
                                t.IncentiveTotal += newAR * 0.01m;
                            }
                            KPI.Tables["nc_acc_kpi_data"].Rows.Add(dd.toDataRow().ItemArray);
                        }
                        t.IncentiveTotal = t.IncentiveTotal > 2000000 ? 2000000 : t.IncentiveTotal;
                        KPI.Tables["nc_acc_kpi_kpi"].Rows.Add(t.toDataRow().ItemArray);
                    }
                    else
                    {
                        var kpi = getKPISalerNew(t.SALE_MAN, value, t.SettingType).FirstOrDefault();
                        if (kpi != null)
                        {

                            KPI.Tables["nc_acc_kpi_kpi"].Rows.Add(kpi.toDataRow().ItemArray);

                        }
                        else
                        {
                            KPI.Tables["nc_acc_kpi_kpi"].Rows.Add(t.toDataRow().ItemArray);

                        }
                        var datatmp = getDataSalerNew(t.SALE_MAN, value);
                        foreach (var dd in datatmp)
                        {
                            KPI.Tables["nc_acc_kpi_data"].Rows.Add(dd.toDataRow().ItemArray);
                        }
                    }


                }
                else
                {
                    var pos = _context._db._conn.Query<int>(@"select isnull(postion,0) as pos
                        from nc_acc_kpi_setting 
                        where id = 2").FirstOrDefault();
                    decimal? mar = 0,
                        nar = 0,
                        mtr = t.TARGET;
                    List<nc_acc_kpi_data> tam = new List<nc_acc_kpi_data>();
                    var gvl = getValue(tmpDate);
                    foreach (var mo in gvl)
                    {

                        foreach (var sale in saler.Split(','))
                        {

                            foreach (var c in getChild(sale))
                            {
                                foreach (var dd in getDataSalerNew(c, mo))
                                {

                                    //dd.IN_MONTH = DateTime.Parse(value + "-01");
                                    dd.SALE_MAN_CHILD = c;
                                    dd.SALE_MAN = sale;
                                    if (dd.SERVICE_PERIOD <= 3)
                                    {
                                        nar += dd.doanh_thu;
                                    }
                                    mar += dd.doanh_thu;
                                    dd.IncentiveType1 = 0;
                                    dd.IncentiveType3 = 0;
                                    dd.IncentiveType4 = 0;
                                    dd.IncentiveType2 = 0;

                                    tam.Add(dd);
                                }
                            }
                        }
                    }
                    t.AR = 0;
                    t.BonusType1 = 0;
                    if (tmpDate.Month % 3 == 0)
                    {
                        t.AR = mar;
                        t.TARGET = t.TARGET * 3;
                        t.KPI = mar / t.TARGET;
                        foreach (var dd in tam)
                        {
                            decimal tt = t.KPI.Value;
                            decimal rate = 0;
                            decimal mul = 0;
                            if (tt > 0.8m && tt <= 1.0m)
                            {
                                mul = tt;
                            }
                            else if (tt > 1.0m)
                            {
                                mul = 1.0m;
                            }

                            if (pos == 3)
                            {
                                rate = 0.7m * 0.01m;
                            }
                            else if (pos == 2)
                            {
                                rate = 0.65m * 0.01m;
                            }
                            else if (pos == 1)
                            {
                                rate = 0.6m * 0.01m;
                            }
                            dd.IN_MONTH = DateTime.Parse(value + "-01");
                            dd.BonusType1 = (dd.SERVICE_PERIOD <= 3 ? dd.doanh_thu : 0) * mul * rate;
                            t.BonusType1 += dd.BonusType1;
                            t.IncentiveTotal = t.BonusType1;
                            KPI.Tables["nc_acc_kpi_data"].Rows.Add(dd.toDataRow().ItemArray);
                        }
                    }
                    else
                    {
                        var dat = tam.Where(x => x.IN_MONTH.Value.Month == tmpDate.Month);
                        t.AR = dat.Sum(x => x.doanh_thu) ?? 0;
                        //t.TARGET = t.TARGET * 3;
                        t.KPI = t.AR / t.TARGET;
                        foreach (var dd in dat)
                        {
                            KPI.Tables["nc_acc_kpi_data"].Rows.Add(dd.toDataRow().ItemArray);
                        }
                    }
                    KPI.Tables["nc_acc_kpi_kpi"].Rows.Add(t.toDataRow().ItemArray);
                }
            }



            var par_1 = KPI.Tables["nc_acc_kpi_kpi"].Columns["SALE_MAN"];
            var par_2 = KPI.Tables["nc_acc_kpi_kpi"].Columns["IN_MONTH"];
            var chi_1 = KPI.Tables["nc_acc_kpi_data"].Columns["SALE_MAN"];
            var chi_2 = KPI.Tables["nc_acc_kpi_data"].Columns["IN_MONTH"];
            var rel1 = new DataRelation("nc_acc_kpi_kpinc_acc_kpi_data", new DataColumn[] { par_1, par_2 }, new DataColumn[] { chi_1, chi_2 }, false);
            KPI.Relations.Add("nc_acc_kpi_kpi_newnc_acc_kpi_kpi", main_2, par_2);
            KPI.Relations.Add(rel1);

            string path = System.Web.HttpContext.Current.Request.MapPath(String.Format("~/App_Data/ExcelTemplate/MonthKPI.xlsx"));

            Workbook workbook = new DevExpress.Spreadsheet.Workbook();

            workbook.LoadDocument(path);



            var acsheet = workbook.Worksheets.ActiveWorksheet;



            MemoryStream ostream = new MemoryStream();
            workbook.MailMergeDataSource = KPI;
            workbook.MailMergeDataMember = "nc_acc_kpi_kpi_new";
            var result = workbook.GenerateMailMergeDocuments();
            result[0].Worksheets[0].Range["A:S"].AutoFitColumns();
            if (type == "xlsx")
            {
                //workbook.SaveToStream(ostream, FileFormat.Version2007);
                result[0].SaveDocument(ostream, DocumentFormat.Xlsx);

            }
            else if (type == "pdf")
            {
                //workbook.ConverterSetting.SheetFitToPage = true;
                //workbook.SaveToStream(ostream, FileFormat.PDF);
                //var pdfExportOption = new DevExpress.XtraPrinting.PdfExportOptions ();
                //pdfExportOption.
                result[0].ExportToPdf(ostream);
            }
            else if (type == "htm" || type == "html")
            {
                var option = new HtmlDocumentExporterOptions();
                option.EmbedImages = true;
                //option.ExportImages = true;
                option.SheetIndex = 0;

                //option.FontUnit = DevExpress.XtraSpreadsheet.Export.Html.HtmlFontUnit.Pixel;
                //option.OverrideImageResolution = 72;

                result[0].ExportToHtml(ostream, option);
            }
            else if (type == "xml")
            {
                KPI.WriteXmlSchema(ostream);
            }

            ostream.Seek(0, SeekOrigin.Begin);
            ostream.Position = 0;

            return ostream;
        }

        [HttpGet]
        [Route("getExcelCusomsize")]
        public HttpResponseMessage getExcelCusomsize()
        {

            var customerId = "";
            var type = "";
            var id = "";
            try
            {
                customerId = this._context.getURLParam("c");
            }
            catch
            {
            }
            try
            {
                type = this._context.getURLParam("t");
            }
            catch
            {
            }
            try
            {
                id = this._context.getURLParam("id");
            }
            catch
            {

            }






            MemoryStream ostream = createExcelCusomsize(id, type, customerId);




            //ostream.Close();
            ostream.Seek(0, SeekOrigin.Begin);
            ostream.Position = 0;

            HttpResponseMessage result = new HttpResponseMessage(HttpStatusCode.OK);
            result.Content = new StreamContent(ostream);
            // Generic Content Header
            result.Content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
            result.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("inline");

            //Set Filename sent to client
            result.Content.Headers.ContentDisposition.FileName = String.Format("{2}.{1}", 0, "xlsx", customerId);

            return result;

        }



        private MemoryStream createExcelCusomsize(string id, string type = "", string customerId = "")
        {
            var userId = _context._token.getUserID();

            var filter = String.Format(" name=N'{0}' and user_id = {1} and type=N'{2}' ", customerId, userId, type);
            var select = "";
            List<dynamic> dat = new List<dynamic>();
            var detailTable = new DataTable("detail");
            try
            {
                var cf = _context._db.Select("nc_core_user_config", filter: filter).FirstOrDefault();
                if (cf != null)
                {
                    dat = JsonConvert.DeserializeObject<List<dynamic>>(cf.config);
                    dat = dat.Where(x => x._active).OrderBy(a => a.order).ToList();

                    foreach (var li in dat)
                    {
                        if (!string.IsNullOrEmpty(select))
                        {
                            select += ", ";
                        }
                        select += String.Format("{0} as \"{1}\"", li.name, li.description);

                    }
                    select = String.Format("SELECT {0} FROM fpt_vd_cong_no WHERE FPT_CONG_NO_KH_ID in ({1})", select, id);


                }
            }
            catch
            {

            }

            var p = new OracleDynamicParameters();
            if (id.Contains(","))
            {
                id = id.Split(',')[0];
            }
            p.Add("bk_id", id, direction: ParameterDirection.Input);
            p.Add("header_data", dbType: OracleDbType.RefCursor, direction: ParameterDirection.Output);
            p.Add("detail_data", dbType: OracleDbType.RefCursor, direction: ParameterDirection.Output);

            var data = _context._db_orc._conn.QueryMultiple("d_bangkecongno", param: p, commandType: CommandType.StoredProcedure, commandTimeout: 300);

            var header = data.Read().FirstOrDefault() as IDictionary<string, object>;

            var detail = data.Read();

            if (!String.IsNullOrEmpty(select))
            {
                detail = _context._db_orc._conn.Query(select);
                if (detail.Count() > 0)
                {
                    var first = detail.First() as IDictionary<string, dynamic>;
                    foreach (var pro in first)
                    {
                        Type t = typeof(String);
                        try
                        {
                            t = pro.Value.GetType();
                        }
                        catch
                        {
                            if (pro.Key == "Phí KS")
                            {
                                t = typeof(decimal);
                            }
                        }

                        try
                        {
                            var c = new DataColumn(pro.Key, t);
                            var laskey = detailTable.Columns[pro.Key];
                            if (laskey == null)
                            {
                                detailTable.Columns.Add(c);
                            }
                            //detailTable.Columns.Add(c);
                        }
                        catch
                        {

                        }
                    }
                    foreach (var row in detail)
                    {
                        var dataRow = detailTable.NewRow();

                        var o = (IDictionary<string, object>)row;

                        foreach (var pro in first)
                        {
                            try
                            {
                                dataRow[pro.Key] = o[pro.Key] == null ? DBNull.Value : o[pro.Key];
                            }
                            catch
                            {

                            }
                        }

                        try
                        {
                            detailTable.Rows.Add(dataRow);
                        }
                        catch
                        {

                        }

                    }

                }
            }


            //var dataSet = new DataSet();
            //dataSet.Tables.Add(Tools.ToDataTable(header,"header"));
            //dataSet.Tables.Add(Tools.ToDataTable(detail, "detail"));




            //DataColumn par, chi;
            //par = dataSet.Tables["header"].Columns["FPT_CONG_NO_KH_ID"];
            //chi = dataSet.Tables["detail"].Columns["FPT_CONG_NO_KH_ID"];
            //var rel = new DataRelation("link", par, chi);
            //dataSet.Relations.Add(rel);
            string path = System.Web.HttpContext.Current.Request.MapPath(String.Format("~/App_Data/ExcelTemplate/CustomsizeDocument.xlsx"));

            Workbook workbook = new DevExpress.Spreadsheet.Workbook();

            workbook.LoadDocument(path);
            if (header != null)
            {

                var fullname = "";
                try
                {

                    fullname = _context._db.Select("nc_core_user", Int32.Parse(userId), select: "[lastname] +' '+firstname as fullname").First().fullname;
                }
                catch { }
                header.Add("NGUOI_LAP", fullname);
                var headt = workbook.Worksheets.ActiveWorksheet.DefinedNames.GetDefinedName("HEADERRANGE");
                foreach (Cell c in headt.Range.Search("FIELD("))
                {
                    var or = c.Value.ToString();
                    //[Ff][Ii][Ee][Ll][Dd]\("([a-zA-Z0-9_]+)"\)
                    //string pattern = @"[Ff][Ii][Ee][Ll][Dd]\(\"([a - zA - Z0 - 9_] +)\\"";
                    var nr = new Regex("\\[([A-Za-z0-9_]+)\\]");
                    c.Value = nr.Replace(or, m =>
                    {
                        var gr = m.Groups[1].Value;
                        var ge = header[gr];
                        if (ge == null)
                            return "";
                        var t = ge.GetType();
                        if (t == typeof(DateTime))
                            return String.Format("{0:dd/MM/yyyy}", ge);
                        if (t == typeof(decimal))
                            return String.Format("{0:#,#}", ge);
                        return ge.ToString();
                    });
                }
                var foott = workbook.Worksheets.ActiveWorksheet.DefinedNames.GetDefinedName("FOOTERRANGE");
                foreach (Cell c in foott.Range.Search("FIELD("))
                {
                    var or = c.Value.ToString();
                    //[Ff][Ii][Ee][Ll][Dd]\("([a-zA-Z0-9_]+)"\)
                    //string pattern = @"[Ff][Ii][Ee][Ll][Dd]\(\"([a - zA - Z0 - 9_] +)\\"";
                    var nr = new Regex("\\[([A-Za-z0-9_]+)\\]");
                    c.Value = nr.Replace(or, m =>
                    {
                        var gr = m.Groups[1].Value;
                        var ge = header[gr];
                        var t = ge.GetType();
                        if (t == typeof(DateTime))
                            return String.Format("{0:dd/MM/yyyy}", ge);
                        if (t == typeof(decimal))
                            return String.Format("{0:#,#}", ge);
                        return ge.ToString();
                    });
                }
            }
            var acsheet = workbook.Worksheets.ActiveWorksheet;
            //workbook.MailMergeDataSource = dataSet;
            //workbook.MailMergeDataMember = "detail";
            //var result = workbook.GenerateMailMergeDocuments();
            var det = acsheet.DefinedNames.GetDefinedName("DETAILRANGE");
            Style style = workbook.Styles[BuiltInStyleId.Output];
            //Style style1 = workbook.Styles[BuiltInStyleId.Output];
            Cell sourceCell = acsheet.Cells[det.Range.TopRowIndex, 0];
            sourceCell.Style = style;
            sourceCell.Font.Color = Color.Black;
            sourceCell.Font.Bold = true;
            sourceCell.Borders.SetOutsideBorders(Color.Black, BorderLineStyle.Thin);
            Cell sourceCell1 = acsheet.Cells[det.Range.TopRowIndex + 1, 0];
            sourceCell1.Borders.SetOutsideBorders(Color.Black, BorderLineStyle.Dashed);
            for (var i = 0; i < dat.Count(); i++)
            {
                acsheet.Cells[det.Range.TopRowIndex, i].CopyFrom(sourceCell);
                acsheet.Cells[det.Range.TopRowIndex + 1, i].CopyFrom(sourceCell1);
                try
                {
                    acsheet.Columns[i].WidthInPixels = dat[i].width;
                    if (dat[i].format != null)
                    {
                        acsheet.Cells[det.Range.TopRowIndex + 1, i].Alignment.Horizontal = SpreadsheetHorizontalAlignment.Right;
                        String fm = dat[i].format;
                        fm = fm.Replace("{0:", "").Replace("}", "");
                        acsheet.Cells[det.Range.TopRowIndex + 1, i].NumberFormat = fm;

                    }


                }
                catch (Exception ex)
                {

                }

            }


            var cou = detail.Count();
            if (cou > 1)
            {
                workbook.Worksheets.ActiveWorksheet.Rows.Insert(det.Range.TopRowIndex + 2, cou - 1);
                for (var i = 0; i < cou - 1; i++)
                {
                    workbook.Worksheets.ActiveWorksheet.Rows[i + det.Range.TopRowIndex + 2].CopyFrom(workbook.Worksheets.ActiveWorksheet.Rows[det.Range.TopRowIndex + 1]);
                }
            }
            //workbook.Unit = DevExpress.Office.DocumentUnit.Point;



            workbook.Worksheets.ActiveWorksheet.Import(detailTable, true, det.Range.TopRowIndex, det.Range.LeftColumnIndex);

            MemoryStream ostream = new MemoryStream();
            workbook.SaveDocument(ostream, DocumentFormat.Xlsx);
            //result[0].SaveDocument(ostream, DocumentFormat.Xlsx);


            ostream.Seek(0, SeekOrigin.Begin);
            ostream.Position = 0;

            return ostream;
        }




        public class tmpROLE
        {
            public int? user { get; set; }

            public string name { get; set; }

            public int? type { get; set; }

            public int? zone { get; set; }

            public int? postion { get; set; }

            public decimal? _default { get; set; }

            public decimal? TARGET { get; set; }

            public string formula { get; set; }

            public int? PARENT { get; set; }

            public string username { get; set; }

            public string lastname { get; set; }

            public string firstname { get; set; }

            public string PIC { get; set; }

            public string postion_name { get; set; }

            public string postion_description { get; set; }

            public string zone_name { get; set; }

            public string zone_description { get; set; }

            public string IN_MONTH { get; set; }

            public DateTime? MONTH { get; set; }

            public DataTable getDatatable(bool hasData = false)
            {
                var rs = new DataTable("ROLE");
                rs.Columns.Add("user", typeof(int));

                rs.Columns.Add("name", typeof(string));

                rs.Columns.Add("type", typeof(int));

                rs.Columns.Add("zone", typeof(int));

                rs.Columns.Add("postion", typeof(int));

                rs.Columns.Add("default", typeof(decimal));

                rs.Columns.Add("TARGET", typeof(decimal));

                rs.Columns.Add("formula", typeof(string));

                rs.Columns.Add("PARENT", typeof(int));

                rs.Columns.Add("username", typeof(string));

                rs.Columns.Add("lastname", typeof(string));

                rs.Columns.Add("firstname", typeof(string));

                rs.Columns.Add("PIC", typeof(string));

                rs.Columns.Add("postion_name", typeof(string));

                rs.Columns.Add("postion_description", typeof(string));

                rs.Columns.Add("zone_name", typeof(string));

                rs.Columns.Add("zone_description", typeof(string));

                rs.Columns.Add("IN_MONTH", typeof(string));

                rs.Columns.Add("MONTH", typeof(DateTime));
                if (hasData)
                {
                    rs.Rows.Add(
                        this.user,
                        this.name,
                        this.type,
                        this.zone,
                        this.postion,
                        this._default,
                        this.TARGET,
                        this.formula,
                        this.PARENT,
                        this.username,
                        this.lastname,
                        this.firstname,
                        this.PIC,
                        this.postion_name,
                        this.postion_description,
                        this.zone_name,
                        this.zone_description,
                        this.IN_MONTH,
                        this.MONTH
                        );
                }
                return rs;
            }

            public DataRow toDataRow()
            {
                DataTable tmp = getDatatable(true);
                var r = tmp.Rows[0];
                //tmp.Rows.Remove(r);
                return r;
            }
            public Dictionary<string, dynamic> toDictionary()
            {
                return JsonConvert.DeserializeObject<Dictionary<string, dynamic>>(JsonConvert.SerializeObject(this));
            }

        }

        public class tmpDATA
        {
            public string ma_kh { get; set; }

            public string ten_kh { get; set; }

            public DateTime? join_date { get; set; }

            public int? customer_type { get; set; }

            public int? SERVICE_PERIOD { get; set; }

            public string in_month { get; set; }

            public decimal? doanh_thu { get; set; }

            public int? num_package { get; set; }

            public decimal DC { get; set; }

            public decimal? person_com_rate { get; set; }

            public string person_com_target { get; set; }

            public decimal? customer_com_rate { get; set; }

            public string customer_com_target { get; set; }

            public decimal? sale_com_rate { get; set; }

            public string sale_com_target { get; set; }

            public string SALE_MAN { get; set; }

            public decimal? PriceType1 { get; set; }

            public decimal? PriceType1A { get; set; }

            public decimal? PriceType1B { get; set; }

            public decimal? PriceType2 { get; set; }

            public decimal? PriceType2A { get; set; }

            public decimal? PriceType2B { get; set; }

            public decimal? PriceType3 { get; set; }

            public decimal? PriceType4 { get; set; }

            public decimal? IncentiveType1 { get; set; }

            public decimal? IncentiveType3 { get; set; }

            public decimal? IncentiveType4 { get; set; }

            public decimal COM { get; set; }

            public decimal? CUOC_PUBLIC { get; set; }

            public decimal First3Month { get; set; }

            public decimal After3Month { get; set; }

            public DateTime? invoice_date { get; set; }

            public DateTime? payment_date { get; set; }

            public DataTable getDatatable(bool hasData = false)
            {
                var rs = new DataTable("DATA");
                rs.Columns.Add("ma_kh", typeof(string));

                rs.Columns.Add("ten_kh", typeof(string));

                rs.Columns.Add("join_date", typeof(DateTime));

                rs.Columns.Add("customer_type", typeof(int));

                rs.Columns.Add("SERVICE_PERIOD", typeof(int));

                rs.Columns.Add("in_month", typeof(string));

                rs.Columns.Add("doanh_thu", typeof(decimal));

                rs.Columns.Add("num_package", typeof(int));

                rs.Columns.Add("DC", typeof(decimal));

                rs.Columns.Add("person_com_rate", typeof(decimal));

                rs.Columns.Add("person_com_target", typeof(string));

                rs.Columns.Add("customer_com_rate", typeof(decimal));

                rs.Columns.Add("customer_com_target", typeof(string));

                rs.Columns.Add("sale_com_rate", typeof(decimal));

                rs.Columns.Add("sale_com_target", typeof(string));

                rs.Columns.Add("SALE_MAN", typeof(string));

                rs.Columns.Add("PriceType1", typeof(decimal));

                rs.Columns.Add("PriceType1A", typeof(decimal));

                rs.Columns.Add("PriceType1B", typeof(decimal));

                rs.Columns.Add("PriceType2", typeof(decimal));

                rs.Columns.Add("PriceType2A", typeof(decimal));

                rs.Columns.Add("PriceType2B", typeof(decimal));

                rs.Columns.Add("PriceType3", typeof(decimal));

                rs.Columns.Add("PriceType4", typeof(decimal));

                rs.Columns.Add("IncentiveType1", typeof(decimal));

                rs.Columns.Add("IncentiveType3", typeof(decimal));

                rs.Columns.Add("IncentiveType4", typeof(decimal));

                rs.Columns.Add("COM", typeof(decimal));

                rs.Columns.Add("CUOC_PUBLIC", typeof(decimal));

                rs.Columns.Add("First3Month", typeof(decimal));

                rs.Columns.Add("After3Month", typeof(decimal));

                rs.Columns.Add("invoice_date", typeof(DateTime));

                rs.Columns.Add("payment_date", typeof(DateTime));
                if (hasData)
                {
                    rs.Rows.Add(
                        this.ma_kh,
                        this.ten_kh,
                        this.join_date,
                        this.customer_type,
                        this.SERVICE_PERIOD,
                        this.in_month,
                        this.doanh_thu,
                        this.num_package,
                        this.DC,
                        this.person_com_rate,
                        this.person_com_target,
                        this.customer_com_rate,
                        this.customer_com_target,
                        this.sale_com_rate,
                        this.sale_com_target,
                        this.SALE_MAN,
                        this.PriceType1,
                        this.PriceType1A,
                        this.PriceType1B,
                        this.PriceType2,
                        this.PriceType2A,
                        this.PriceType2B,
                        this.PriceType3,
                        this.PriceType4,
                        this.IncentiveType1,
                        this.IncentiveType3,
                        this.IncentiveType4,
                        this.COM,
                        this.CUOC_PUBLIC,
                        this.First3Month,
                        this.After3Month,
                        this.invoice_date,
                        this.payment_date
                        );
                }
                return rs;
            }

            public DataRow toDataRow()
            {
                DataTable tmp = getDatatable(true);
                var r = tmp.Rows[0];
                //tmp.Rows.Remove(r);
                return r;
            }
            public Dictionary<string, dynamic> toDictionary()
            {
                return JsonConvert.DeserializeObject<Dictionary<string, dynamic>>(JsonConvert.SerializeObject(this));
            }

        }


    }
}