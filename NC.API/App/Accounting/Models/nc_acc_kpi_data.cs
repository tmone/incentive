using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using Newtonsoft.Json;

namespace NC.API.App.Accounting.Models
{
    public class nc_acc_kpi_data
    {
        public string ma_kh { get; set; }
        public string ten_kh { get; set; }
        public DateTime? join_date { get; set; }
        public int? customer_type { get; set; }
        public int? SERVICE_PERIOD { get; set; }
        public DateTime? IN_MONTH { get; set; }
        public decimal? doanh_thu { get; set; }
        public int? num_package { get; set; }
        public decimal? dc { get; set; }
        public decimal? cost { get; set; }
        public decimal? BILL_INVOICE { get; set; }
        public decimal? cost_per_kg { get; set; }
        public decimal? BILL_OTHER { get; set; }
        public decimal? COST_PER_SHIPMENT { get; set; }
        public decimal? person_com_rate { get; set; }
        public string person_com_target { get; set; }
        public decimal? customer_com_rate { get; set; }
        public string customer_com_target { get; set; }
        public decimal? sale_com_rate { get; set; }
        public string sale_com_target { get; set; }
        public decimal? invoice_amount { get; set; }
        public decimal? receipt_amount { get; set; }
        public DateTime? invoice_date { get; set; }
        public DateTime? payment_date { get; set; }
        public int? AR_DELAY { get; set; }
        public decimal? ACT_CUSTOMER_COM_RATE { get; set; }
        public decimal? ACT_CUSTOMER_COM_AMOUNT { get; set; }
        public string ACT_CUSTOMER_COM_TARGET { get; set; }
        public string ACT_SALE_COM_TARGET { get; set; }
        public decimal? ACT_SALE_COM_RATE { get; set; }
        public decimal? ACT_SALE_COM_AMOUNT { get; set; }
        public decimal? TARGET { get; set; }
        public decimal? KPI { get; set; }
        public string SALE_MAN { get; set; }
        public string SALE_MAN_CHILD { get; set; }
        public decimal? REVENUE_PUBLIC { get; set; }
        public int? C_0201 { get; set; }
        public decimal? S_0201 { get; set; }
        public int? C_0202 { get; set; }
        public decimal? S_0202 { get; set; }
        public int? C_0203 { get; set; }
        public decimal? S_0203 { get; set; }
        public int? C_0205 { get; set; }
        public decimal? S_0205 { get; set; }
        public int? C_0207 { get; set; }
        public decimal? S_0207 { get; set; }
        public int? C_OTHER { get; set; }
        public decimal? S_OTHER { get; set; }
        public decimal? A_0201 { get; set; }
        public decimal? A_0202 { get; set; }
        public decimal? A_0203 { get; set; }
        public decimal? A_0205 { get; set; }
        public decimal? A_0207 { get; set; }
        public decimal? A_OTHER { get; set; }
        public decimal? PriceType1 { get; set; }
        public decimal? PriceType1A { get; set; }
        public decimal? PriceType1B { get; set; }
        public decimal? PriceType2 { get; set; }
        public decimal? PriceType2A { get; set; }
        public decimal? PriceType2B { get; set; }
        public decimal? PriceType3 { get; set; }
        public decimal? PriceType4 { get; set; }
        public decimal? IncentiveType1 { get; set; }
        public decimal? IncentiveType2 { get; set; }
        public decimal? IncentiveType3 { get; set; }
        public decimal? IncentiveType4 { get; set; }
        public decimal? BonusType1 { get; set; }

        public DataTable getDatatable(bool hasData = false)
        {
            var rs = new DataTable("nc_acc_kpi_data");
            rs.Columns.Add("ma_kh", typeof(string));
            rs.Columns.Add("ten_kh", typeof(string));
            rs.Columns.Add("join_date", typeof(DateTime));
            rs.Columns.Add("customer_type", typeof(int));
            rs.Columns.Add("SERVICE_PERIOD", typeof(int));
            rs.Columns.Add("IN_MONTH", typeof(DateTime));
            rs.Columns.Add("doanh_thu", typeof(decimal));
            rs.Columns.Add("num_package", typeof(int));
            rs.Columns.Add("dc", typeof(decimal));
            rs.Columns.Add("cost", typeof(decimal));
            rs.Columns.Add("BILL_INVOICE", typeof(decimal));
            rs.Columns.Add("cost_per_kg", typeof(decimal));
            rs.Columns.Add("BILL_OTHER", typeof(decimal));
            rs.Columns.Add("COST_PER_SHIPMENT", typeof(decimal));
            rs.Columns.Add("person_com_rate", typeof(decimal));
            rs.Columns.Add("person_com_target", typeof(string));
            rs.Columns.Add("customer_com_rate", typeof(decimal));
            rs.Columns.Add("customer_com_target", typeof(string));
            rs.Columns.Add("sale_com_rate", typeof(decimal));
            rs.Columns.Add("sale_com_target", typeof(string));
            rs.Columns.Add("invoice_amount", typeof(decimal));
            rs.Columns.Add("receipt_amount", typeof(decimal));
            rs.Columns.Add("invoice_date", typeof(DateTime));
            rs.Columns.Add("payment_date", typeof(DateTime));
            rs.Columns.Add("AR_DELAY", typeof(int));
            rs.Columns.Add("ACT_CUSTOMER_COM_RATE", typeof(decimal));
            rs.Columns.Add("ACT_CUSTOMER_COM_AMOUNT", typeof(decimal));
            rs.Columns.Add("ACT_CUSTOMER_COM_TARGET", typeof(string));
            rs.Columns.Add("ACT_SALE_COM_TARGET", typeof(string));
            rs.Columns.Add("ACT_SALE_COM_RATE", typeof(decimal));
            rs.Columns.Add("ACT_SALE_COM_AMOUNT", typeof(decimal));
            rs.Columns.Add("TARGET", typeof(decimal));
            rs.Columns.Add("KPI", typeof(decimal));
            rs.Columns.Add("SALE_MAN", typeof(string));
            rs.Columns.Add("SALE_MAN_CHILD", typeof(string));
            rs.Columns.Add("REVENUE_PUBLIC", typeof(decimal));
            rs.Columns.Add("C_0201", typeof(int));
            rs.Columns.Add("S_0201", typeof(decimal));
            rs.Columns.Add("C_0202", typeof(int));
            rs.Columns.Add("S_0202", typeof(decimal));
            rs.Columns.Add("C_0203", typeof(int));
            rs.Columns.Add("S_0203", typeof(decimal));
            rs.Columns.Add("C_0205", typeof(int));
            rs.Columns.Add("S_0205", typeof(decimal));
            rs.Columns.Add("C_0207", typeof(int));
            rs.Columns.Add("S_0207", typeof(decimal));
            rs.Columns.Add("C_OTHER", typeof(int));
            rs.Columns.Add("S_OTHER", typeof(decimal));
            rs.Columns.Add("A_0201", typeof(decimal));
            rs.Columns.Add("A_0202", typeof(decimal));
            rs.Columns.Add("A_0203", typeof(decimal));
            rs.Columns.Add("A_0205", typeof(decimal));
            rs.Columns.Add("A_0207", typeof(decimal));
            rs.Columns.Add("A_OTHER", typeof(decimal));
            rs.Columns.Add("PriceType1", typeof(decimal));
            rs.Columns.Add("PriceType1A", typeof(decimal));
            rs.Columns.Add("PriceType1B", typeof(decimal));
            rs.Columns.Add("PriceType2", typeof(decimal));
            rs.Columns.Add("PriceType2A", typeof(decimal));
            rs.Columns.Add("PriceType2B", typeof(decimal));
            rs.Columns.Add("PriceType3", typeof(decimal));
            rs.Columns.Add("PriceType4", typeof(decimal));
            rs.Columns.Add("IncentiveType1", typeof(decimal));
            rs.Columns.Add("IncentiveType2", typeof(decimal));
            rs.Columns.Add("IncentiveType3", typeof(decimal));
            rs.Columns.Add("IncentiveType4", typeof(decimal));
            rs.Columns.Add("BonusType1", typeof(decimal));
            if (hasData)
            {
                rs.Rows.Add(
                    this.ma_kh,
                    this.ten_kh,
                    this.join_date,
                    this.customer_type,
                    this.SERVICE_PERIOD,
                    this.IN_MONTH,
                    this.doanh_thu,
                    this.num_package,
                    this.dc,
                    this.cost,
                    this.BILL_INVOICE,
                    this.cost_per_kg,
                    this.BILL_OTHER,
                    this.COST_PER_SHIPMENT,
                    this.person_com_rate,
                    this.person_com_target,
                    this.customer_com_rate,
                    this.customer_com_target,
                    this.sale_com_rate,
                    this.sale_com_target,
                    this.invoice_amount,
                    this.receipt_amount,
                    this.invoice_date,
                    this.payment_date,
                    this.AR_DELAY,
                    this.ACT_CUSTOMER_COM_RATE,
                    this.ACT_CUSTOMER_COM_AMOUNT,
                    this.ACT_CUSTOMER_COM_TARGET,
                    this.ACT_SALE_COM_TARGET,
                    this.ACT_SALE_COM_RATE,
                    this.ACT_SALE_COM_AMOUNT,
                    this.TARGET,
                    this.KPI,
                    this.SALE_MAN,
                    this.SALE_MAN_CHILD,
                    this.REVENUE_PUBLIC,
                    this.C_0201,
                    this.S_0201,
                    this.C_0202,
                    this.S_0202,
                    this.C_0203,
                    this.S_0203,
                    this.C_0205,
                    this.S_0205,
                    this.C_0207,
                    this.S_0207,
                    this.C_OTHER,
                    this.S_OTHER,
                    this.A_0201,
                    this.A_0202,
                    this.A_0203,
                    this.A_0205,
                    this.A_0207,
                    this.A_OTHER,
                    this.PriceType1,
                    this.PriceType1A,
                    this.PriceType1B,
                    this.PriceType2,
                    this.PriceType2A,
                    this.PriceType2B,
                    this.PriceType3,
                    this.PriceType4,
                    this.IncentiveType1,
                    this.IncentiveType2,
                    this.IncentiveType3,
                    this.IncentiveType4,
                    this.BonusType1
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