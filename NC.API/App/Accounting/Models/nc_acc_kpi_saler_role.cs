using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace NC.API.App.Accounting.Models
{
    
    public class nc_acc_kpi_saler_role { public int id { get; set; } public string name { get; set; } public string description { get; set; } public int? user { get; set; } public int? postion { get; set; } public int? zone { get; set; } public bool? type { get; set; } public string setting { get; set; }
    public decimal? _default { get; set; }
    public DateTime? from_date { get; set; }
    public DateTime? to_date { get; set; }
    public int? kpi_id { get; set; }
    public int? parent { get; set; }
    public bool? _active { get; set; }
    public bool? _deleted { get; set; }
    public DateTime? _createdate { get; set; }
    public DateTime? _updatedate { get; set; }
}
}