using System.Web.Http;
using NC.CORE.NCController;
using System.Net.Http.Formatting;
using Dapper;
using System.Data;
using System;
using NC.CORE.App.NCAccount;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using Newtonsoft.Json;
using System.Linq;
using NC.API.App.Accounting.Models;

namespace NC.API.App.Accounting.Controllers
{
    [RoutePrefix("api/Accounting/UploadCommistion")]
    public class UploadCommistionController : NCAPIController
    {
        public UploadCommistionController()
        {
            this.setApp("Accounting");
        }
        [Route("")]
        public IHttpActionResult Get()
        {
            return Ok(base.Get("nc_accounting_upload_commistion"));
        }
        //GET api/core/<controller>/<id>?token=
        [Route("{id:int}")]
        public IHttpActionResult Get(int id)
        {
            return Ok(base.Get("nc_accounting_upload_commistion", id));
        }
        //POST api/core/<controller>?token=
        [Route("")]
        public IHttpActionResult Post([FromBody]FormDataCollection formDataCollection)
        {
            //NCLogger.Debug("POST:" + formDataCollection.Get("org_name"));
            //return Ok();
            return Ok(base.Post("nc_accounting_upload_commistion", formDataCollection));
        }
        //PUT api/core/<controller>/<id>?token=
        [Route("{id:int}")]
        public IHttpActionResult Put(long id, FormDataCollection formDataCollection)
        {
            return Ok(base.Put("nc_accounting_upload_commistion", id, formDataCollection));
        }
        //DELETE api/core/<controller>/<id>?token=
        [Route("{id:int}")]
        public IHttpActionResult Delete(long id)
        {
            return Ok(base.Delete("nc_accounting_upload_commistion", id));
        }

        [HttpPost]
        [Route("AddCommistion")]
        public string AddCommistion([FromBody]FormDataCollection form)
        {
            var client_code = "";
            dynamic tar = null;
            try
            {
                client_code = form.Get("client_code");
                tar = _context._db.Select("nc_master_customer", filter: "_orc_partner_code='" + client_code + "'");
            }
            catch (Exception ex)
            {
                return "{\"client_code\":\"" + client_code + "\",\"TypeS\":\"Error\",\"NoteS\":\"Mã khách hàng không đúng\"}";
            }
            if (tar == null)
            {
                return "{\"client_code\":\"" + client_code + "\",\"TypeS\":\"Error\",\"NoteS\":\"Không có mã khách hàng trên hệ thống\"}";
            }
            var in_month = "";
            //int lissta = 0;
            try
            {
                in_month = form.Get("in_month");
                //lissta = _context._db._conn.QueryFirstOrDefault<int>("select count(*) from nc_accounting_temp_revenue where MA_KH like '"+client_code+"%' and IN_MONTH='"+in_month+"'");
            }
            catch (Exception ex)
            {
                return "{\"client_code\":\"" + client_code + "\",\"TypeS\":\"Error\",\"NoteS\":\"Tháng chưa có công nợ\"}";
            }
            //if (lissta == 0)
            //{
            //    return "{\"client_code\":\"" + client_code + "\",\"TypeS\":\"Error\",\"NoteS\":\"Chưa có công nợ tháng này\"}";
            //}
            decimal commission_rate = 0;
            try
            {
                commission_rate = decimal.Parse(form.Get("commission_rate"));
            }
            catch (Exception ex)
            {
                return "{\"client_code\":\"" + client_code + "\",\"TypeS\":\"Error\",\"NoteS\":\"Tỉ lệ hoa hồng cho khách không đúng định dạng\"}";

            }
            if (commission_rate <= 0)
            {
                return "{\"client_code\":\"" + client_code + "\",\"TypeS\":\"Error\",\"NoteS\":\"Tỉ lệ hoa hồng cho khách quá nhỏ\"}";
            }

            string invoice_no = "";
            try
            {
                invoice_no = form.Get("invoice_no");
            }
            catch (Exception ex)
            {
                return "{\"client_code\":\"" + client_code + "\",\"TypeS\":\"Error\",\"NoteS\":\"Không nhập hóa đơn xuất cho khách\"}";
            }
            if (string.IsNullOrEmpty(invoice_no))
            {
                return "{\"client_code\":\"" + client_code + "\",\"TypeS\":\"Error\",\"NoteS\":\"Không nhập hóa đơn xuất cho khách\"}";

            }

            string type = form.Get("type");


            decimal actual_payment_received = 0;
            try
            {
                actual_payment_received = decimal.Parse(form.Get("actual_payment_received"));
            }
            catch (Exception ex)
            {
                return "{\"client_code\":\"" + client_code + "\",\"TypeS\":\"Error\",\"NoteS\":\"Chưa nhập số tiền khách đã thanh toán\"}";

            }
            if (actual_payment_received <= 0)
            {
                return "{\"client_code\":\"" + client_code + "\",\"TypeS\":\"Error\",\"NoteS\":\"số tiền khách đã thanh toán quá nhỏ\"}";
            }

            decimal actual_commission_paid = 0;
            try
            {
                actual_commission_paid = decimal.Parse(form.Get("actual_commission_paid"));
            }
            catch (Exception ex)
            {
                return "{\"client_code\":\"" + client_code + "\",\"TypeS\":\"Error\",\"NoteS\":\"Chưa nhập số tiền chi cho khách\"}";

            }
            if (actual_commission_paid <= 0)
            {
                return "{\"client_code\":\"" + client_code + "\",\"TypeS\":\"Error\",\"NoteS\":\"Số tiền chi cho khách quá nhỏ\"}";
            }
            decimal incentive_rate = 0;
            try
            {
                incentive_rate = decimal.Parse(form.Get("incentive_rate"));
            }
            catch (Exception ex)
            {
                //return "{\"client_code\":\"" + client_code + "\",\"TypeS\":\"Error\",\"NoteS\":\"Tỉ lệ hoa hồng cho nhân viên sai định dạng\"}";

            }
            decimal sales_incentive = 0;
            try
            {
                sales_incentive = decimal.Parse(form.Get("sales_incentive"));
            }
            catch (Exception ex)
            {
                //return "{\"client_code\":\"" + client_code + "\",\"TypeS\":\"Error\",\"NoteS\":\"Số tiền hoa hồng cho nhân viên sai định dạng\"}";

            }

            decimal after_discount = 0;
            try
            {
                after_discount = decimal.Parse(form.Get("after_discount"));
            }
            catch (Exception ex)
            {

            }
            string staff_code = "";
            try
            {
                staff_code = form.Get("staff_code");
            }
            catch (Exception ex)
            {
                staff_code = _context._db._conn.QueryFirstOrDefault<string>("select username from nc_core_user where id= "+_context._token.getUserID());
            }

            string note = form.Get("note");
            string receipt_ref = form.Get("receipt_ref");
            string commission_receipt_ref = form.Get("commission_receipt_ref");
            DateTime receipt_date = DateTime.MinValue;
            try
            {
                receipt_date = DateTime.Parse(form.Get("receipt_date"));
            }
            catch(Exception ex)
            {

            }
            string receipient = form.Get("receipient");
            string template_ref = form.Get("template_ref");
            try
            {
                var tmp = new nc_accounting_upload_commistion();
                tmp.assign(_context);
                tmp.client_code = client_code;
                tmp.in_month = in_month;
                tmp.commission_rate = commission_rate;
                tmp.type = type;
                tmp.invoice_no = invoice_no;
                tmp.after_discount = after_discount;
                tmp.on_time = true;
                tmp.receipt_ref = receipt_ref;
                tmp.actual_payment_received = actual_payment_received;
                tmp.actual_commission_paid = actual_commission_paid;
                tmp.commission_receipt_ref = commission_receipt_ref;
                if (receipt_date > DateTime.MinValue)
                {
                    tmp.receipt_date = receipt_date;
                }
                
                tmp.receipient = receipient;
                tmp.staff_code = staff_code;
                tmp.incentive_rate = incentive_rate;
                tmp.sales_incentive = sales_incentive;
                tmp.note = note;
                tmp.template_ref = template_ref;
                tmp._active = true;
                tmp._deleted = false;
                tmp._createdate = DateTime.Now;
                tmp.updateId();
                tmp.save();
            }
            catch (Exception ex)
            {
                return "{\"client_code\":\"" + client_code + "\",\"TypeS\":\"Error\",\"NoteS\":\"Thêm thất bại, lỗi hệ thống\n" + ex.Message + "\"}";
            }

            return "{\"client_code\":\"" + client_code + "\",\"TypeS\":\"Ok\",\"NoteS\":\"Đã thêm thành công\"}";

        }
    }
}