using NC.CORE.Context;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Dapper;
using OfficeOpenXml;
using System.Data;
using System.Drawing;

namespace NC.CORE.App.Asset
{
    public class NCDxtreme {
        private NCContext _context = new NCContext();
        public NCDxtreme(NCContext context)
        {
            this._context = context;
           
        }

        public String BuildForm(int Id,bool haveGroup = true)
        {
            var rs = "";

            List<object> items = new List<object>
            {

            };            
            var assetLib = new Asset.NCAsset(this._context);
            var prop = assetLib.getColumnGroup(Id.ToString());
            var cur = "";
            var tmp = new GroupItem();
            foreach(dynamic ta in prop)
            {
                if (ta.group_name != cur && haveGroup)
                {
                    tmp = new GroupItem();
                    tmp.caption = ta.group_name;
                    tmp.itemType = "group";
                    items.Add(tmp);
                    cur = ta.group_name;
                }
                if(haveGroup)
                    tmp.items.Add(BuildIt(ta));
                else
                    items.Add(BuildIt(ta));
            }

            rs = JsonConvert.SerializeObject(items);
            return rs;
        }

        public ColumnItem BuildVisibleColumn(dynamic dgp)
        {
            var tmp = new ColumnItem();

            tmp.dataField = "_" + dgp.id;
            tmp.caption = dgp.property_name;

            if (dgp.require == true || isSystemProperty(dgp.id) || dgp.favorite == true)
            {
                tmp.visible = true;
            }
            else
            {
                tmp.visible = false;
            }
            switch (dgp.type_id)
            {
                case 4:
                case 5:
                case 7:
                    if (dgp.defaults.Contains("@"))
                    {
                        var rg = Regex.Matches(dgp.defaults, @"@([A-Za-z_]+)\[([A-Za-z_]+)\]");
                        if (rg.Count > 0 && rg[0].Groups.Count == 3)
                        {
                            var tem = getValueFromModel(rg[0].Groups[1].ToString(), rg[0].Groups[2].ToString());
                            if (tem != null)
                            {
                                tmp.lookup = new { dataSource = tem, displayExpr = "name", valueExpr = "id" };
                            }
                        }
                    }
                    break;
                case 8:
                case 11:
                    tmp.dataType = "string";
                    break;
                case 6:
                    tmp.dataType = "number";
                    break;

                case 9:
                    tmp.dataType = "date";
                    break;
                case 10:
                    tmp.dataType = "boolean";
                    break;
                case 12:
                    tmp.dataType = "datetime";
                    break;
                case 14:
                    tmp.dataType = "string";
                    break;
            }

            return tmp;
        }

        public ValidationRule BuildASetting(int cateId, int groupId)
        {
            ValidationRule a = new ValidationRule();

            var inp = _context._db.Select("nc_asset_category_setting", filter: "cate_id=" + cateId + " and property_id=" + groupId).FirstOrDefault();
            if (inp != null)
            {
                var table = new Dictionary<string, string>();
                table.Add("0", "[0-9]");
                table.Add("9", @"[0-9\s]");
                table.Add("#", @"[-+0-9\s]");
                table.Add("L", "[A-Za-z\u007F-\uFFFF]");
                table.Add("l", @"[A-Za-z\u007F-\uFFFF\s]");
                table.Add("C", @"\S");
                table.Add("c", ".");
                table.Add("A", "[0-9A-Za-z\u007F-\uFFFF]");
                table.Add("a", @"[0-9A-Za-z\u007F-\uFFFF\s]");
                try
                {
                    var exp = JsonConvert.DeserializeObject(inp.rules);
                    foreach (var r in exp)
                    {
                        var str = "";
                        foreach (var m in r.Value)
                        {
                            str += m;
                        }
                        if (str.Length > 0)
                        {
                            table.Add(r.Name, "["+str+"]");
                        }

                    }
                }
                catch
                {

                }
                var reg = "";
                for(var i= 0; i< inp.mask.Length; i++)
                {
                    string tm = ""+inp.mask[i];
                    reg += table[tm];
                }
                a.pattern = "/" + reg + "/";

            }
              
            return a;
        }

        public ColumnItem BuildAColumn(dynamic dgp)
        {
            var tmp = new ColumnItem();

            tmp.dataField = "_" + dgp.id;
            tmp.caption = dgp.property_name;

            if (dgp.require == true || isSystemProperty(dgp.id))
            {
                ValidationRule a = new ValidationRule("required", dgp.Name + " can not empty. Please input data");
                tmp.validationRules.Add(a);
            }

            switch (dgp.type_id)
            {
                case 1:
                    tmp.dataType = "string";
                    break;
                case 2:
                    tmp.dataType = "number";                    
                    break;
                case 3:
                    break;
                case 4:
                case 5:
                case 7:
                    if (dgp.defaults.Contains("@"))
                    {
                        var rg = Regex.Matches(dgp.defaults, @"@([A-Za-z_]+)\[([A-Za-z_]+)\]");
                        if (rg.Count > 0 && rg[0].Groups.Count == 3)
                        {
                            var tem = getValueFromModel(rg[0].Groups[1].ToString(), rg[0].Groups[2].ToString());
                            if (tem != null)
                            {
                                tmp.lookup = new { dataSource = tem, displayExpr = "name", valueExpr = "id" };                                
                            }
                        }
                    }
                    break;
                case 8:
                case 11:
                    tmp.dataType = "string";
                    break;
                case 6:
                    tmp.dataType = "number";                   
                    break;

                case 9:
                    tmp.dataType = "date";                    
                    break;
                case 10:
                    tmp.dataType = "boolean";
                    break;
                case 12:
                    tmp.dataType = "datetime";                    
                    break;
                case 14:
                    tmp.dataType = "string";
                    break;
            }

            return tmp;
        }

        public SimpleItem BuildIt(dynamic dgp)
        {
            var tmp = new SimpleItem();
            tmp.dataField = "_" + dgp.id;
            tmp.label = new Label();
            var lb = dgp.property_name;
            var un = getUnitName(dgp.unit_id);
            if (un.Length > 0)
                lb = lb + " (" + un + ")";
            tmp.label.text = lb;
            tmp.helpText = dgp.note;
            tmp.itemType = "simple";
            if (dgp.require == true || isSystemProperty(dgp.id))
            {
                ValidationRule a =  new ValidationRule("required", dgp.property_name + " can not empty. Please input data");

                tmp.validationRules.Add(a);
            }
            var ts = "";
            dynamic option = new ExpandoObject();
            switch (dgp.type_id)
            {
                case 1:// "String":
                    ts = "dxTextBox";
                    option.showClearButton = true;
                    option.placeholder = dgp.note;
                    option.mask = dgp.format;
                    option.useMaskedValue = true;
                    break;
                case 2:// "Number":
                    ts = "dxNumberBox";
                    option.format = dgp.format;
                    option.showSpinButtons = true;
                    option.showClearButton = true;
                    var num = new ValidationRule();
                    num.type = "numeric";
                    tmp.validationRules.Add(num);
                    try
                    {
                        var tfm = dgp.defaults.Split(';');
                        var mmin = float.Parse(tfm[0]);
                        var mmax = float.Parse(tfm[1]);
                        if (tfm.Length == 2 && mmin < mmax)
                        {
                            option.min = mmin;
                            option.max = mmax;
                        }
                    }
                    catch { };
                    break;
                case 3:
                    //ts = "dxFileUploader";
                    tmp.template = "ImageUploadTemplate";
                    //option.uploadMode = "useForm";
                    //option.accept = "*";
                    //option.name = "file";
                    //option.multiple = false;
                    //option.uploadUrl = "/Asset/Upload";
                    break;
                case 4:// "Choice":
                    ts = "dxSelectBox";
                    if (dgp.defaults.Contains("@"))
                    {
                        var rg = Regex.Matches(dgp.defaults, @"@([A-Za-z_]+)\[([A-Za-z_]+)\]");
                        if (rg.Count > 0 && rg[0].Groups.Count == 3)
                        {
                            var tem = getValueFromModel(rg[0].Groups[1].ToString(), rg[0].Groups[2].ToString());
                            if (tem != null)
                            {
                                option.dataSource = tem;
                                option.displayExpr = rg[0].Groups[2].ToString();
                                option.valueExpr = "id";
                            }
                        }
                    }
                    else
                    {
                        var tmpg = dgp.defaults.Split(';');
                        if (tmpg.Length > 0)
                            option.items = tmpg;
                    }
                    option.searchEnabled = true;
                    option.showClearButton = true;
                    break;
                case 5:// "MultiChoice":                    
                case 7:// "Tag":
                    ts = "dxTagBox";
                    if (dgp.defaults.Contains("@"))
                    {
                        var rg = Regex.Matches(dgp.defaults, @"@([A-Za-z_]+)\[([A-Za-z_]+)\]");
                        if (rg.Count > 0 && rg[0].Groups.Count == 3)
                        {
                            var tem = getValueFromModel(rg[0].Groups[1].ToString(), rg[0].Groups[2].ToString());
                            if (tem != null)
                            {
                                option.dataSource = tem;
                                option.displayExpr = rg[0].Groups[2].ToString();
                                option.valueExpr = "id";
                            }
                        }
                    }
                    else
                    {
                        var tmpg = dgp.defaults.Split(';');
                        if (tmpg.Length > 0)
                            option.items = tmpg;
                    }
                    option.multiline = true;
                    option.searchEnabled = true;
                    option.showClearButton = true;
                    option.showSelectionControls = true;
                    break;
                case 6://Percent:
                    ts = "dxSlider";
                    option.max = 100;
                    option.min = 0;
                    option.keystep = 10;
                    option.step = 10;
                    //option.label = new ExpandoObject();
                    //option.label.visible = true;
                    option.tooltip = new ExpandoObject();
                    option.tooltip.enabled = true;
                    //option.tooltip.showMode = "always";
                    //option.tooltip.position = "bottom";
                    break;
                case 8:// "Color":
                    ts = "dxColorBox";
                    //ts = "dxSelectBox";
                    option.searchEnabled = true;
                    option.showClearButton = true;
                    //option.items = db.Colors.ToList();
                    //option.valueExpr = "Name";
                    //option.displayExpr= "Name";
                    //option.Name = "ColorBox";
                    //option.itemTemplate = "ColorBoxTemplate";

                    break;
                case 9:// "Date":
                    ts = "dxDateBox";
                    option.displayFormat = dgp.format;
                    break;
                case 10:// "YesNo":
                    ts = "dxCheckBox";
                    option.text = dgp.defaults;
                    break;
                case 11://TextNote:
                    ts = "dxTextArea";
                    try
                    {
                        var gt = int.Parse(dgp.defaults);
                        if (gt > 20)
                        {
                            option.height = gt;
                        }
                    }
                    catch
                    {

                    }
                    break;
                case 12:// "Time":
                    ts = "dxDateBox";
                    option.displayFormat = dgp.format;
                    option.type = "time";
                    break;
                //case 1_3: //unique
                //    ts = "dxTextBox";
                //    var a1 = new ValidationRule();
                //    a1.type = "custom";
                //    a1.validationCallback = "ValidUnique_" + dgp.Id;
                //    ValidationRule[] a = { new ValidationRule(),a1 };                

                //    tmp.validationRules = a;
                //    break;
                case 14: //system
                    tmp.visible = false;
                    ts = "dxTextBox";
                    option.readOnly = true;
                    break;
            }
            tmp.editorOptions = option;
            tmp.editorType = ts;
            return tmp;
        }

        public String BuildValue(int itemId)
        {
            var rsi = "";

            var at = new ExpandoObject() as IDictionary<string, Object>;
            at.Add("id", itemId);

            var assetLib = new Asset.NCAsset(this._context);
            var prop = assetLib.getColumnGroup(itemId.ToString());

            foreach (dynamic a in prop)
            {
                at.Add("_" + a.id, null);
            }


            var tmp = _context._db.Select("nc_asset_property_data", filter: "item_id=" + itemId);


            foreach (dynamic rn in tmp)
            {
                at["_" + rn.property_id] = rn.value;
                var pop = getObject("nc_asset_property_detail", rn.property_id);
                if (pop != null)
                {
                    if (pop.type_id == 14)
                    {
                        var ass = getObject("nc_asset_item", rn.item_id);
                        at["_" + rn.PropertyId] = getSystemValue(ass, pop);
                    }
                }
            }

            rsi = JsonConvert.SerializeObject(at);
            return rsi;
        }
        public dynamic getObject(String tableName, int id)
        {
            return _context._db.Select(tableName,id).FirstOrDefault();
        }

        public String getSystemValue(dynamic a, dynamic dgp)
        {
            var rs = "";

            if (dgp.type_id == 13)
            {
                switch (dgp.defaults)
                {
                    case "@Id":
                        rs = a.id;
                        break;
                    case "@State":
                        rs = _context._db.Select("nc_asset_state",a.state_id,select:"state_name");                       
                        
                        break;
                    case "@Category":
                        rs = _context._db.Select("nc_asset_category", a.cate_id, select: "cate_name");
                        break;
                    
                    case "@OnHold":
                        rs = _context._db.Select("nc_asset_store", select:"sum(Quantity) as Quantity]",filter:"AssetId = "+a.id);
                        break;
                }

            }

            return rs;
        }

        public String getUnitName(int? Id)
        {
            var rs = "";
            int id = 0;
            try {
                id = Int32.Parse(Id.ToString());
                rs = _context._db.Select("nc_master_unit",id,"unit_name").FirstOrDefault();
            }
            catch { }
            return rs;
        }
        public bool isSystemProperty(int Id)
        {
            var tmp = _context._db.ExecuteQuery("select id from [dbo].[nc_asset_property_detail] where id = " + Id + " and (system =1 or group_id in (select id from [dbo].[nc_asset_property_group] where system = 1))");
            if (tmp.Count() > 0)
                return true;
            return false;
        }
        public IEnumerable<dynamic> getValueFromModel(String md, String n)
        {
            var _md = "";
            var _nd = "name";
            switch (md)
            {
                case "Employee":
                    _md = "nc_master_employee";
                    _nd = "full_name";
                    break;
                case "Unit":
                    _md = "nc_master_unit";
                    _nd = "unit_name";
                    break;
                case "Orgchart":
                    _md = "nc_core_orgchart";
                    _nd = "org_name";
                    break;
                case "Province":
                    _md = "nc_master_province";
                    break;
                case "Category":
                    _md = "nc_asset_category";
                    _nd = "cate_name";
                    break;
                case "Vendor":
                    _md = "nc_asset_vendor";
                    _nd = "vendor_name";
                    break;
                case "District":
                    _md = "nc_master_district";
                    _nd = "district_name";
                    break;

                default:
                    break;

            }

            //return "";
            try
            {
                var gt = _context._db.ExecuteQuery("select *," + _nd+ " as name from " + _md + " order by " + n);
                return gt;
            }
            catch (Exception e)
            {
                NC.CORE.Log.NCLogger.Debug("NCDxtreme getValueFromModel: " + e.Message);
            };
            return null;
        }

        public ExcelPackage BuildTemplateExcel(int? Id)
        {
            var rs = new ExcelPackage();
            var sheet = rs.Workbook.Worksheets.Add("Asset");

            List<object> items = new List<object>
            {

            };
            var mainitem = new GroupItem();
            var assetLib = new NCAsset(this._context);
            var lgp = assetLib.getColumnGroup(Id.ToString());

            var currCol = 1;
            var beginGr = 1;

            foreach (var t in lgp)
            {
                if (beginGr < currCol - 1)
                {
                    sheet.Cells[1, beginGr, 1, currCol - 1].Merge = true;
                }
                beginGr = currCol;
                var tmp = new GroupItem();
                tmp.caption = t.group_name;
                tmp.itemType = "group";
                items.Add(tmp);
                sheet.Cells[1, beginGr].Value = t.group_name;
                switch (t.type_id)
                {
                    case 14:
                        continue;
                    case 4:
                    case 5:
                    case 7:
                        var ns = rs.Workbook.Worksheets[t.property_name];
                        if (ns == null)
                            ns = rs.Workbook.Worksheets.Add(t.property_name);
                        if (t.defaults.Contains("@"))
                        {

                            var rg = Regex.Matches(t.defaults, @"@([A-Za-z_]+)\[([A-Za-z_]+)\]");
                            if (rg.Count > 0 && rg[0].Groups.Count == 3)
                            {
                                var tem = getValueFromModel(rg[0].Groups[1].ToString(), rg[0].Groups[2].ToString());
                                ns.Cells["A1"].LoadFromDataTable(Tools.ToDataTable(tem, t.property_name), true, OfficeOpenXml.Table.TableStyles.Light10);
                            }
                        }
                        else
                        {
                            var tmpg = t.defaults.Split(';');
                            var testData = new List<object[]>();
                            foreach (var l in tmpg)
                            {
                                testData.Add(new object[] { "Name", l });
                            }
                            ns.Cells["A1"].LoadFromArrays(testData);
                        }
                        break;

                }

                var cell = sheet.Cells[2, currCol];
                cell.Value = t.property_name;
                var gr = getObject("nc_asset_property_group",t.group_id);
                if (t.require == true || t.system == true || gr.system == true)
                {
                    var fill = cell.Style.Fill;
                    fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                    fill.BackgroundColor.SetColor(Color.Red);
                }
                var type = getObject("nc_asset_property_type", t.type_id);
                cell = sheet.Cells[3, currCol];
                cell.Value = type != null ? type.Name : "";
                if (t.type_id == 9 || t.type_id == 12)
                {
                    cell.Value += "(" + t.format + ")";
                }
                if (t.require == true || t.system == true || gr.system == true)
                {
                    var fill = cell.Style.Fill;
                    fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                    fill.BackgroundColor.SetColor(Color.Red);
                }
                cell = sheet.Cells[4, currCol];
                cell.Value = t.id;
                if (t.require == true || t.system == true || gr.system == true)
                {
                    var fill = cell.Style.Fill;
                    fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                    fill.BackgroundColor.SetColor(Color.Red);
                }

                var border = cell.Style.Border;
                border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;

                currCol++;
                    
            }

            return rs;
        }

        public dynamic BuildVisibleColumItem()
        {
            //var rs = "";

            List<object> items = new List<object>
            {

            };
            var assetLib = new NCAsset(this._context);
            var lgp = assetLib.getAvaliableColumn();
            foreach (var t in lgp)
            {
                items.Add(BuildVisibleColumn(t));
            }
            //rs = JsonConvert.SerializeObject(items);
            return items;

        }

        public String BuildColumGrid(int Id)
        {
            var rs = "";

            List<object> items = new List<object>
            {

            };
            var mainitem = new GroupItem();
            var assetLib = new NCAsset(this._context);
            var lgp = assetLib.getColumnGroup(Id.ToString());

            var cur = "";
            var tmp = new ColumnItem();

            foreach (var t in lgp)
            {

                if(cur != t.group_name)
                {
                    tmp = new ColumnItem();
                    tmp.caption = t.group_name;
                    items.Add(tmp);
                    cur = t.group_name;
                }


                tmp.columns.Add(BuildAColumn(t));
                    
            }
            rs = JsonConvert.SerializeObject(items);
            return rs;
        }

        public String BuildFilterRequired(int Id)
        {
            var rs = "";

            var assetLib = new NCAsset(this._context);
            var lgp = assetLib.getColumnGroup(Id.ToString());

            object[] arr = { };

            foreach (var t in lgp)
            {
                var gr = getObject("nc_asset_property_group", t.group_id);

                if (t.require == true || t.system == true || gr.system == true)
                {
                    object[] rule = new object[] { "!", new object[] { "_" + t.id, "=", null } };
                    if (arr.Length > 0)
                    {
                        var tep = new object[] { arr, "and", rule };
                        arr = tep;
                    }
                    else
                    {
                        arr = rule;
                    }
                }
               

            }
            rs = JsonConvert.SerializeObject(arr);

            return rs;

        }

        public dynamic isRequired(int pid)
        {
            
            var dt = getObject("nc_asset_property_detail", pid);

            if (dt != null && (dt.require == true || dt.system == true))
                return dt;
            var fter = "id = " + dt.group_id + " and system=1";
            var gr = getObject("nc_asset_property_group", dt.group_id);

            if (gr != null && gr.system == true)
                return dt;
            return null;
        }
        public dynamic isUniqued(int pid, String value)
        {
            return _context._db.Select("nc_asset_property_data", filter: "property_id=" + pid + " and value='" + value + "'").FirstOrDefault();
        }

        public String BuildColumReport(string Id, List<int> sele)
        {
            var rs = "";

            List<object> items = new List<object>
            {

            };
            var assetLib = new NCAsset(this._context);
            var lgp = assetLib.getColumnGroup(Id);

            foreach (var t in lgp)
            {
                ColumnItem an = BuildAColumn(t);
                an.visible = false;
                if (t.system == true || isSystemProperty(t.id))
                {
                    an.visible = true;
                }
                var get = sele.FirstOrDefault(x => x == t.id);

                if (get > 0)
                {
                    an.visible = true;
                    an.visibleIndex = sele.IndexOf(get);
                }
                items.Add(an);
                   
            }
            rs = JsonConvert.SerializeObject(items);
            return rs;
        }


    }
    public class SimpleItem
    {
        public SimpleItem()
        {
            itemType = "simple";
            items = new List<object> { };
            validationRules = new List<ValidationRule>();
            visible = true;
        }
        public String dataField { get; set; }
        public String editorType { get; set; }
        public String helpText { get; set; }
        public String itemType { get; set; }
        public int visibleIndex { get; set; }
        public bool visible { get; set; }
        public object editorOptions { get; set; }
        public Label label { get; set; }
        public String name { get; set; }
        public List<ValidationRule> validationRules { get; set; }
        public bool isRequired { get; set; }
        public List<object> items { get; set; }
        public String template { get; set; }
    }
    public class GroupItem
    {
        public GroupItem()
        {
            itemType = "group";
            items = new List<object> { };
            visible = true;
            alignItemLabels = true;
            colCount = 1;
        }
        public String itemType { get; set; }
        public String caption { get; set; }
        public bool alignItemLabels { get; set; }
        public int colCount { get; set; }
        public List<object> items { get; set; }
        public String name { get; set; }
        public int visibleIndex { get; set; }
        public bool visible { get; set; }
    }
    public class Label
    {
        public Label()
        {
            alignment = "left";
            location = "left";
            visible = true;
        }
        public String alignment { get; set; }
        public String location { get; set; }
        public bool showColon { get; set; }
        public String text { get; set; }
        public bool visible { get; set; }
    }
    public class ValidationRule
    {
        public ValidationRule()
        {
            type = "required";
            //message = " Please input";
        }
        public ValidationRule(String t, String m, int mi = 0, int ma = 50)
        {
            type = t;
            message = m;
            min = mi;
            max = ma;
        }
        public String type;
        public String message;
        public String validationCallback;
        public int min;
        public int max;
        public String pattern;
    }

    public class ColumnItem
    {
        public ColumnItem()
        {
            visible = true;
            visibleIndex = 0;
            columns = new List<object> { };
            validationRules = new List<ValidationRule> { };
        }
        public String caption { get; set; }
        public List<object> columns { get; set; }
        public String dataField { get; set; }
        public String dataType { get; set; }
        public List<ValidationRule> validationRules { get; set; }
        public bool visible { get; set; }
        public int visibleIndex { get; set; }
        public object lookup { get; set; }
    }
    public static class Tools
    {

        /// <summary>
        /// Uppercase first letters of all words in the string.
        /// </summary>
        //public static string ConvertColumn(string s)
        //{
        //    var lib = new NC.CORE.App.Asset.NCDxtreme();
        //    return Regex.Replace(s, @"_[0-9]+", delegate (Match match)
        //    {
        //        int v = Convert.ToInt32(match.ToString().Replace("_", ""));
        //        var dt = db.DetailGroupProperties.FirstOrDefault(x => x.Id == v);
        //        if (dt != null)
        //        {
        //            return dt.Name;
        //        }
        //        return "";
        //    });
        //}
        public static DataTable ToDataTable(IEnumerable<dynamic> list, String tablename = null)
        {
            if (tablename == null)
            {
                tablename = "_" + DateTime.Now.Ticks.ToString();
            }

            var dataTable = new DataTable(tablename);
            try
            {
                var collection = list as IList<dynamic> ?? list.ToList();

                var properties = ((IDictionary<string, object>)collection.First())
                    .ToDictionary(x => x.Key, x => x.Value);

                foreach (var property in properties)
                {
                    //dataTable.Columns.Add(property.Key);
                    var c = new DataColumn(property.Key);
                    dataTable.Columns.Add(c);
                    // property.GetType();
                }

                foreach (var item in collection.ToList())
                {
                    var dataRow = dataTable.NewRow();

                    var o = (IDictionary<string, object>)item;

                    foreach (var p in properties)
                        dataRow[p.Key] = o[p.Key];

                    dataTable.Rows.Add(dataRow);
                }
            }
            catch
            {

            }

            return dataTable;
        }
        public static DataTable ToDataTable(ExpandoObject item, String tablename = null)
        {
            var props = (IDictionary<string, object>)item;

            if (tablename == null)
            {
                tablename = "_" + DateTime.Now.Ticks.ToString();
            }
            var t = new DataTable(tablename);
            foreach (var prop in props)
            {
                t.Columns.Add(new DataColumn(prop.Key, prop.Value.GetType()));
            }

            var data = t.NewRow();
            foreach (var prop in (IDictionary<string, object>)item)
            {
                data[prop.Key] = prop.Value;
            }
            t.Rows.Add(data);

            return t;

        }

    }
}