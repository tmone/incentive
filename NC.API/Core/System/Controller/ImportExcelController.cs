using System;
using System.Collections.Generic;
using System.Linq;
using sysweb = System.Web;
using System.Web;
using System.Web.Http;
using NC.CORE.NCController;
using NC.CORE.Log;
using System.IO;
using Newtonsoft.Json;
using OfficeOpenXml;
using System.Dynamic;

namespace NC.API.Core.System.Controllers
{
    [RoutePrefix("api/core/ImportExcel")]
    public class ImportExcelController : NCAPIController
    {
        
        public ImportExcelController()
        {
            this.setApp("ImportExcel"); 
        }

        [HttpPost]
        [Route("Upload")]
        public IHttpActionResult Upload()
        {

            if (HttpContext.Current.Request.Files.AllKeys.Any())
            {
                // Get the uploaded image from the Files collection
                var myFile = HttpContext.Current.Request.Files[0];

                if (myFile != null)
                {
                    // Validate the uploaded image(optional)

                    // Get the complete file path
                    var targetLocation = HttpContext.Current.Server.MapPath("~/App_Data/Tmp/");
                    var name = HttpContext.Current.Request.Params["n"];

                    try
                    {
                        var path = Path.Combine(targetLocation, myFile.FileName);
                        var ext = Path.GetExtension(myFile.FileName);
                        if (name != null & name.Length > 0)
                            path = Path.Combine(targetLocation, name + ext);

                        //Uncomment to save the file
                        myFile.SaveAs(path);
                    }
                    catch (Exception e)
                    {
                        NCLogger.Debug("Upload file - " + e.Message);
                    }
                }
            }
            return Ok();
        }
        [HttpGet]
        [Route("getExcelData/{id:int}")]
        public String getExcelData(long id)
        {

            var Id = id;
            var local = sysweb.Hosting.HostingEnvironment.MapPath("~/App_Data/Tmp/");
            string[] files = Directory.GetFiles(local, Id + ".*");
            try
            {
                if (files.Length > 0)
                {
                    FileInfo file = new FileInfo(files[0]);
                    using (ExcelPackage package = new ExcelPackage(file))
                    {
                        var items = new List<ExpandoObject> { };
                        ExcelWorksheet workSheet = package.Workbook.Worksheets.First();
                        var c = 1;
                        for (var rowNumber = 1; rowNumber <= workSheet.Dimension.End.Row; rowNumber++)
                        {
                            var row = workSheet.Cells[rowNumber, 1, rowNumber, workSheet.Dimension.End.Column];
                            var at = new ExpandoObject() as IDictionary<string, Object>;
                            //at.Add("ID", c++);
                            foreach (var cell in row)
                            {
                                //cell.Start.Column
                                at.Add("_"+cell.Start.Column.ToString(), cell.Value);
                            }
                            items.Add((ExpandoObject)at);
                        }
                        //
                        file.Delete();

                        //
                        return JsonConvert.SerializeObject(items);
                    }
                }
            }
            catch(Exception ex) {
            }
            return "[]";
        }

    }
}