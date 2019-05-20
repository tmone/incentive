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
    [RoutePrefix("api/Accounting/KPICustomer")]
    public class KPICustomerController : NCAPIController
    {
        public KPICustomerController()
        {
            this.setApp("Accounting");
        }
        [Route("")]
        public IHttpActionResult Get()
        {
            return Ok(base.Get("nc_acc_kpi_customer"));
        }
        //GET api/core/<controller>/<id>?token=
        [Route("{id:int}")]
        public IHttpActionResult Get(int id)
        {
            return Ok(base.Get("nc_acc_kpi_customer", id));
        }
        //POST api/core/<controller>?token=
        [Route("")]
        public IHttpActionResult Post([FromBody]FormDataCollection formDataCollection)
        {
            //NCLogger.Debug("POST:" + formDataCollection.Get("org_name"));
            //return Ok();
            return Ok(base.Post("nc_acc_kpi_customer", formDataCollection));
        }
        //PUT api/core/<controller>/<id>?token=
        [Route("{id:int}")]
        public IHttpActionResult Put(long id, FormDataCollection formDataCollection)
        {
            return Ok(base.Put("nc_acc_kpi_customer", id, formDataCollection));
        }
        //DELETE api/core/<controller>/<id>?token=
        [Route("{id:int}")]
        public IHttpActionResult Delete(long id)
        {
            return Ok(base.Delete("nc_acc_kpi_customer", id));
        }
        [HttpPost]
        [Route("AddCustomer")]
        public string AddCustomer([FromBody]FormDataCollection form)
        {
            var client_code = "";
            dynamic cus = null;
            dynamic usr = null;
            dynamic sal = null;
            try
            {
                client_code = form.Get("client_code");
                cus = _context._db._conn.Query(@"select top 1 * from nc_master_customer where _orc_partner_code = @customer_code", new { customer_code = client_code }).FirstOrDefault(); //_context._db.Select("nc_master_customer", filter: "_orc_partner_code='" + client_code + "'");
            }
            catch (Exception ex)
            {
                return "{\"client_code\":\"" + client_code + "\",\"TypeS\":\"Error\",\"NoteS\":\"Mã khách hàng không đúng\"}";
            }
            if (cus == null)
            {
                return "{\"client_code\":\"" + client_code + "\",\"TypeS\":\"Error\",\"NoteS\":\"Không có mã khách hàng trên hệ thống\"}";
            }
            var sale_code = "";
            //dynamic tar = null;
            try
            {
                sale_code = form.Get("saler");
                usr = _context._db._conn.Query(@"select top 1 * from nc_core_user where username = @user", new { user = sale_code }).FirstOrDefault(); //_context._db.Select("nc_core_user", filter: "username='" + sale_code + "'");
            }
            catch (Exception ex)
            {
                return "{\"client_code\":\"" + client_code + "\",\"TypeS\":\"Warning\",\"NoteS\":\"Mã NV không hợp lệ\"}";
            }
            if (usr == null)
            {
                return "{\"client_code\":\"" + client_code + "\",\"TypeS\":\"Warning\",\"NoteS\":\"Không có mã nhân viên trên hệ thống\"}";
            }
            try
            {

                sal = _context._db._conn.Query(@"select top 1 * from nc_acc_kpi_saler where [user] = @userid", new { userid = usr.id }).FirstOrDefault();// from "Select("nc_acc_kpi_saler", filter: "user=" + usr.FirstOrDefault().id + "");
            }
            catch (Exception ex)
            {
                return "{\"client_code\":\"" + client_code + "\",\"TypeS\":\"Warning\",\"NoteS\":\"Mã NV chưa được cài đặt KPI\"}";
            }
            if (sal == null)
            {
                return "{\"client_code\":\"" + client_code + "\",\"TypeS\":\"Warning\",\"NoteS\":\"Mã NV chưa có thông tin KPI\"}";
            }
            try
            {
                //var kpi_cus = _context._db._conn.Query(@"select top 1 * from nc_acc_kpi_customer where [name] = @customer_code", new { customer_code = client_code }).FirstOrDefault();
                //if(kpi_cus == null)
                //{
                //    var nform = new FormDataCollection(string.Format(
                //        @"name={0}&description={1}&user={2}&_active={3}",
                //        client_code,
                //        cus.customer_name,
                //        sale_code,
                //        1
                //        ));
                //    Post(nform);
                //}
                //else
                //{
                //    var nform = new FormDataCollection(string.Format(
                //        @"user={0}",                        
                //        sale_code                        
                //        ));
                //    Put(kpi_cus.id, nform);
                //}               

                var tmp = new nc_acc_kpi_customer();
                tmp.assign(_context);
                tmp.name = client_code;
                tmp.user = sale_code;
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