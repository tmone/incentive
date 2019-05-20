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
using NC.CORE.App.System;
using System.IO;
using DevExpress.Spreadsheet;

namespace NC.API.Core.System.Controllers
{
    public class ConvertPDFController : NCAPIController
    {
        public ConvertPDFController()
        {
            this.setApp("ConvertPDF");
        }

        [HttpGet]
        [Route("api/core/getPDF")]
        public HttpResponseMessage getPDF()
        {
            var source = HttpContext.Current.Server.MapPath("~/App_Data/ExcelTemplate/CongNo.xlsx");
            var target = HttpContext.Current.Server.MapPath("~/App_Data/Tmp/CongNo.pdf");

            Workbook workbook = new Workbook();

            // Load a workbook from the file.
            workbook.LoadDocument(source, DocumentFormat.Xlsx);

            //workbook.Worksheets.ActiveWorksheet.PrintOptions.p


            MemoryStream stream = new MemoryStream();

            workbook.ExportToPdf(stream);

            stream.Position = 0;
            HttpResponseMessage result = new HttpResponseMessage(HttpStatusCode.OK);

            result.Content = new StreamContent(stream);
            // Generic Content Header
            result.Content.Headers.ContentType = new MediaTypeHeaderValue("application/pdf");
            result.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment");

            //Set Filename sent to client
            result.Content.Headers.ContentDisposition.FileName = String.Format("CongNo.pdf");

            return result;
        }

    }
}