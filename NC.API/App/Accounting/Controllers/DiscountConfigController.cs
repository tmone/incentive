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

namespace NC.API.App.Accounting.Controllers
{
    [RoutePrefix("api/Accounting/DiscountConfig")]
    public class DiscountConfigController : NCAPIController
    {
        public DiscountConfigController()
        {
            this.setApp("Accounting");
        }
        [Route("")]
        public IHttpActionResult Get()
        {
            return Ok(base.Get("nc_accounting_customer_discount"));
        }
        //GET api/core/<controller>/<id>?token=
        [Route("{id:int}")]
        public IHttpActionResult Get(int id)
        {
            return Ok(base.Get("nc_accounting_customer_discount", id));
        }
        //POST api/core/<controller>?token=
        [Route("")]
        public IHttpActionResult Post([FromBody]FormDataCollection formDataCollection)
        {
            //NCLogger.Debug("POST:" + formDataCollection.Get("org_name"));
            //return Ok();
            return Ok(base.Post("nc_accounting_customer_discount", formDataCollection));
        }
        //PUT api/core/<controller>/<id>?token=
        [Route("{id:int}")]
        public IHttpActionResult Put(long id, FormDataCollection formDataCollection)
        {
            return Ok(base.Put("nc_accounting_customer_discount", id, formDataCollection));
        }
        //DELETE api/core/<controller>/<id>?token=
        [Route("{id:int}")]
        public IHttpActionResult Delete(long id)
        {
            return Ok(base.Delete("nc_accounting_customer_discount", id));
        }

        [HttpPost]
        [Route("Approve/{id:int}")]
        public IHttpActionResult Approve(long id)
        {
            var data = new Dictionary<string, string>();
            data.Add("user_approve", _context._token.getUserID());
            data.Add("approved_date", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"));
            return Ok(_context._db.Update("nc_accounting_customer_discount", data,id));
        }
        [HttpGet]
        [Route("CustomerAndUser")]
        public IHttpActionResult CustomerAndUser()
        {
            String varname1 = "select code, code_name from (";
            varname1 = varname1 + "select convert(nvarchar(10),_orc_partner_code) as code " + "\n";
            varname1 = varname1 + ",'['+convert(nvarchar(10),_orc_partner_code)+'] '+ customer_name as code_name " + "\n";
            varname1 = varname1 + "from nc_master_customer " + "\n";
            varname1 = varname1 + "where _active = 1 and _deleted = 0 " + "\n";
            varname1 = varname1 + "union " + "\n";
            varname1 = varname1 + "select convert(nvarchar(10),username) as code " + "\n";
            varname1 = varname1 + ",'['+convert(nvarchar(10),username)+'] '+ lastname+' '+firstname as code_name " + "\n";
            varname1 = varname1 + "from nc_core_user " + "\n";
            varname1 = varname1 + "where _active = 1 and _deleted = 0";
            varname1 = varname1 + ") a ";
            return Ok(_context._db._conn.Query(varname1,commandTimeout:300));
        }

        [HttpGet]
        [Route("CustomerAndUserDx")]
        public IHttpActionResult CustomerAndUserDx()
        {
            string skip = "0";
            string take = "1000";
            string filterx = "";
            string select = " * ";
            string order = " code  ";
            string sort = " ORDER BY " + order + " OFFSET " + skip + " ROWS FETCH NEXT " + take + " ROWS ONLY";
            try
            {
                skip = _context.getURLParam("skip");
                if (string.IsNullOrEmpty(skip))
                    skip = "0";
                if (int.Parse(skip) >= 0) { }
                else
                {
                    skip = "0";
                }
                take = _context.getURLParam("take");
                if (string.IsNullOrEmpty(take))
                    take = "1000";
                else if (int.Parse(take) > 0) { }
                else
                {
                    take = "1000";
                }
                filterx = _context.getURLParam("filterx");
                select = _context.getURLParam("select");
                order = _context.getURLParam("order");
                if (string.IsNullOrEmpty(order))
                {
                    order = " code  ";
                }
                sort = " ORDER BY " + order + " OFFSET " + skip + " ROWS FETCH NEXT " + take + " ROWS ONLY";
            }
            catch (Exception ex)
            {

            }
            String varname1 = "select code, code_name from (";
            varname1 = varname1 + "select convert(nvarchar(10),_orc_partner_code) as code " + "\n";
            varname1 = varname1 + ",'['+convert(nvarchar(10),_orc_partner_code)+'] '+ customer_name as code_name " + "\n";
            varname1 = varname1 + "from nc_master_customer " + "\n";
            varname1 = varname1 + "where _active = 1 and _deleted = 0 " + "\n";
            varname1 = varname1 + "union " + "\n";
            varname1 = varname1 + "select convert(nvarchar(10),username) as code " + "\n";
            varname1 = varname1 + ",'['+convert(nvarchar(10),username)+'] '+ lastname+' '+firstname as code_name " + "\n";
            varname1 = varname1 + "from nc_core_user " + "\n";
            varname1 = varname1 + "where _active = 1 and _deleted = 0";
            varname1 = varname1 + ") a ";

            

            if (!string.IsNullOrEmpty(filterx))
            {
                if (filterx.Contains("''"))
                    filterx = filterx.Replace("''", "'");


            }
            else
            {
                filterx = "1=0";
            }
            varname1 = varname1 + " where " + filterx;

            varname1 = varname1 + sort;

            var data = _context._db._conn.Query(varname1, commandTimeout: 300);

            if (_context.getURLParam("requireTotalCount") == "true")
            {
                var c = 0;
                try
                {
                    c = data.Count();
                }
                catch { }

                return Ok(new { data = data.Skip(Int32.Parse(skip)).Take(Int32.Parse(take)), totalCount = c });
            }

            return Ok(data.Skip(Int32.Parse(skip)).Take(Int32.Parse(take)));
            
        }
    }
}