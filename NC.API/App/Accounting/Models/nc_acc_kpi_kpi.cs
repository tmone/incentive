using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using Newtonsoft.Json;

namespace NC.API.App.Accounting.Models
{
    public class nc_acc_kpi_kpi {
        public string SALE_MAN { get; set; }
        public DateTime? IN_MONTH { get; set; }
        public decimal? AR { get; set; }
        public int SettingType { get; set; }
        public string SalerParent { get; set; }
        public decimal? PriceType1 { get; set; }
        public decimal? PriceType2 { get; set; }
        public decimal? PriceType3 { get; set; }
        public decimal? PriceType4 { get; set; }
        public decimal? IncentiveType1 { get; set; }
        public decimal? BonusType1 { get; set; }
        public decimal? IncentiveType2 { get; set; }
        public decimal? IncentiveType3 { get; set; }
        public decimal? IncentiveType4 { get; set; }
        public decimal? ThreeMonthAR { get; set; }
        public decimal? AfterAR { get; set; }
        public decimal TARGET { get; set; }
        public decimal? KPI { get; set; }
        public string ZONE1 { get; set; }
        public string ZONE2 { get; set; }
        public string ZONE3 { get; set; }
        public string ZONE4 { get; set; }
        public string ZONE5 { get; set; }
        public decimal? IncentiveTotal { get; set; }
        public string name { get; set; }
        public string description { get; set; }
        public int type { get; set; }
        public decimal? DC { get; set; }
        public decimal? COM { get; set; }

        public DataTable getDatatable(bool hasData = false)
        {
            var rs = new DataTable("nc_acc_kpi_kpi");
            rs.Columns.Add("SALE_MAN", typeof(string));
            rs.Columns.Add("IN_MONTH", typeof(DateTime));
            rs.Columns.Add("AR", typeof(decimal));
            rs.Columns.Add("SettingType", typeof(int));
            rs.Columns.Add("SalerParent", typeof(string));
            rs.Columns.Add("PriceType1", typeof(decimal));
            rs.Columns.Add("PriceType2", typeof(decimal));
            rs.Columns.Add("PriceType3", typeof(decimal));
            rs.Columns.Add("PriceType4", typeof(decimal));
            rs.Columns.Add("IncentiveType1", typeof(decimal));
            rs.Columns.Add("BonusType1", typeof(decimal));
            rs.Columns.Add("IncentiveType2", typeof(decimal));
            rs.Columns.Add("IncentiveType3", typeof(decimal));
            rs.Columns.Add("IncentiveType4", typeof(decimal));
            rs.Columns.Add("ThreeMonthAR", typeof(decimal));
            rs.Columns.Add("AfterAR", typeof(decimal));
            rs.Columns.Add("TARGET", typeof(decimal));
            rs.Columns.Add("KPI", typeof(decimal));
            rs.Columns.Add("ZONE1", typeof(string));
            rs.Columns.Add("ZONE2", typeof(string));
            rs.Columns.Add("ZONE3", typeof(string));
            rs.Columns.Add("ZONE4", typeof(string));
            rs.Columns.Add("ZONE5", typeof(string));
            rs.Columns.Add("IncentiveTotal", typeof(decimal));
            rs.Columns.Add("name", typeof(string));
            rs.Columns.Add("description", typeof(string));
            rs.Columns.Add("type", typeof(int));
            rs.Columns.Add("DC", typeof(decimal));
            rs.Columns.Add("COM", typeof(decimal));
            if (hasData)
            {
                rs.Rows.Add(
                    this.SALE_MAN,
                    this.IN_MONTH,
                    this.AR,
                    this.SettingType,
                    this.SalerParent,
                    this.PriceType1,
                    this.PriceType2,
                    this.PriceType3,
                    this.PriceType4,
                    this.IncentiveType1,
                    this.BonusType1,
                    this.IncentiveType2,
                    this.IncentiveType3,
                    this.IncentiveType4,
                    this.ThreeMonthAR,
                    this.AfterAR,
                    this.TARGET,
                    this.KPI,
                    this.ZONE1,
                    this.ZONE2,
                    this.ZONE3,
                    this.ZONE4,
                    this.ZONE5,
                    this.IncentiveTotal,
                    this.name,
                    this.description,
                    this.type,
                    this.DC,
                    this.COM
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
        public Dictionary<string,dynamic> toDictionary()
        {
            return JsonConvert.DeserializeObject<Dictionary<string,dynamic>>(JsonConvert.SerializeObject(this));
        }
    }
}