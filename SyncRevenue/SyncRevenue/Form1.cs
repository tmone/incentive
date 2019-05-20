using Dapper;
using Oracle.DataAccess.Client;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Data.SqlClient;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using Z.Dapper.Plus;

namespace SyncRevenue
{
    public partial class Form1 : DevExpress.XtraBars.Ribbon.RibbonForm
    {
        DateTime dfrom_date;
        DateTime dto_date;
        IDbConnection _connKEC;
        IDbConnection _connORC;
        int TOTAL = 0;
        int curr = 0;
        int TOTAL1 = 0;
        int TOTAL2 = 0;
        int TOTAL3 = 0;
        int TOTAL4 = 0;
        int TOTAL5 = 0;
        int curr1 = 0;
        int curr2 = 0;
        int curr3 = 0;
        int curr4 = 0;
        int curr5 = 0;
        int INPROGRESS = 5;

        public Form1()
        {
            InitializeComponent();
            _connORC = new OracleConnection(Properties.Settings.Default.ORAC);
            _connKEC = new SqlConnection(Properties.Settings.Default.KEVN);
            DateTime today = DateTime.Now;
            //DateTime from_date;
            //DateTime to_date;
            dfrom_date = today.AddMonths(-1);
            dfrom_date = new DateTime(dfrom_date.Year, dfrom_date.Month, 1);
            dto_date = new DateTime(today.Year, today.Month, 1);
            dto_date = dto_date.AddDays(-1);
            barEditItem2.EditValue = dfrom_date;
            barEditItem3.EditValue = dto_date;
        }

        private void run()
        {
            var customer_code = "";
            try {
                customer_code = (string)barEditItem1.EditValue;
            } catch(Exception ex) { }
            DateTime from_date;
            try
            {
                from_date = (DateTime)barEditItem2.EditValue;
            }
            catch(Exception ex)
            {
                from_date = dfrom_date;
            }
            DateTime to_date;
            try
            {
                to_date = (DateTime)barEditItem3.EditValue;
                to_date = new DateTime(to_date.Year, to_date.Month + 1, 1);
            }
            catch (Exception ex)
            {
                to_date = dto_date; 
            }

            //syncCustomer();


        }

        public void syncCustomer()
        {
            
            string sql = @"SELECT CASE
                                        WHEN GROUP_NAME IS NULL THEN TO_CHAR (KH.VALUE)
                                        ELSE GROUP_NAME
                                    END
                                        GROUP_NAME,
                                    KH.VALUE AS MA_KH,
                                    NAME as TEN_KH,
                                    KH.CREATED AS JOIN_DATE
                                FROM    D_GROUP_KH GR
                                    RIGHT JOIN
                                        C_BPARTNER KH
                                    ON GR.C_BPARTNER_ID = KH.C_BPARTNER_ID
                                WHERE isactive = 'Y' AND iscustomer = 'Y'";
            //var _conn = new OracleConnection(Properties.Settings.Default.ORAC);
            TOTAL1 = 1;
            IEnumerable<nc_accounting_temp_customer> list;// = 
            backgroundWorker1.ReportProgress(curr1 * 100 / TOTAL1, "Get list...");
            using (var _conn = new OracleConnection(Properties.Settings.Default.ORAC)){
                _conn.Open();
                list = _conn.Query<nc_accounting_temp_customer>(sql, commandTimeout: 3000);
                _conn.Close();
            }
            //try
            //{
            //    _conn.Close();
            //    _conn.Dispose();
            //}
            //catch { }
            TOTAL1 = list.Count();
            backgroundWorker1.ReportProgress(curr1 * 100 / TOTAL1, "Total list "+TOTAL1);
            //foreach(var it in list)
            //{
            //    try
            //    {
            //        //it.assign(_connKEC);
            //        it.updateId();
            //    it.save(barCheckItem6.Checked);
            //    backgroundWorker1.ReportProgress(curr1*100/TOTAL1,it.MA_KH);
            //    curr1++;
            //    }
            //    catch (Exception ex)
            //    {
            //        backgroundWorker1.ReportProgress(curr1 * 100 / TOTAL1, ex.Message);

            //    }
            //}
            //DapperPlusManager.Entity<nc_accounting_temp_customer>().Table("nc_accounting_temp_customer").Identity(x=>x.id);
            DapperPlusManager.Entity<nc_accounting_temp_customer>("Insert_key")
                .Table("nc_accounting_temp_customer")
                .Key(x => x.MA_KH)
                .InsertIfNotExists();

            DapperPlusManager.Entity<nc_accounting_temp_customer>("Update_key")
                .Table("nc_accounting_temp_customer")
                .Key(x => x.MA_KH);
            backgroundWorker1.ReportProgress(curr1 * 100 / TOTAL1, "Processing list... ");
            using (var conn = new SqlConnection(Properties.Settings.Default.KEVN))
            {
                conn.Open();
                backgroundWorker1.ReportProgress(curr1 * 100 / TOTAL1, "Updating list...");
                conn.BulkUpdate("Update_key", list);
                backgroundWorker1.ReportProgress(curr1 * 100 / TOTAL1, "Inserting list...");
                conn.BulkInsert("Insert_key", list);

                conn.Close();
            }
            //_connKEC.BulkMerge<nc_accounting_temp_customer>(list);

            backgroundWorker1.ReportProgress(100, "Finished");
        }

        public void syncPrice(DateTime from_date, DateTime to_date, string customer_code = null)
        {
            
            string sql = @"select  
                SO_VAN_DON                
                ,case when fmis_tinh_gia (so_van_don,(SELECT c_bpartner_id
                    FROM c_bpartner
                   WHERE VALUE =
                            DECODE (hinh_thuc_tt, 'NG', tu_tinh, den_tinh)
                            || '00000'),
                 m_product_id,
                 quy_doi(greatest(nvl(kl_van_don_qd_ks,0),nvl(kl_van_don_qd,0),nvl(kl_van_don_ks,0),nvl(kl_van_don,0)),c_uom_id),
                 tu_tinh,
                 den_tinh,
                 ngay_vd,
                 kiem_ke_hai_quan) > 0 then fmis_tinh_gia (so_van_don,(SELECT c_bpartner_id
                    FROM c_bpartner
                   WHERE VALUE =
                            DECODE (hinh_thuc_tt, 'NG', tu_tinh, den_tinh)
                            || '00000'),
                 m_product_id,
                 quy_doi(greatest(nvl(kl_van_don_qd_ks,0),nvl(kl_van_don_qd,0),nvl(kl_van_don_ks,0),nvl(kl_van_don,0)),c_uom_id),
                 tu_tinh,
                 den_tinh,
                 ngay_vd,
                 kiem_ke_hai_quan) else fmis_tinh_gia (
                 so_van_don,
                 (SELECT c_bpartner_id
                    FROM c_bpartner
                   WHERE VALUE =
                            DECODE (hinh_thuc_tt, 'NG', tu_tinh, den_tinh)
                            || '00000'),
                 (select m_product_id from m_product where value='0201'),
                 quy_doi(greatest(nvl(kl_van_don_qd_ks,0),nvl(kl_van_don_qd,0),nvl(kl_van_don_ks,0),nvl(kl_van_don,0)),c_uom_id),
                 tu_tinh,
                 den_tinh,
                 ngay_vd,
                 kiem_ke_hai_quan) end +nvl(phi_ks,nvl(phi,0)) as CUOC_PUBLIC  ,
                 d_vd1.ma_kh,
                 TO_CHAR(d_VD1.NGAY_VD,'YYYY-MM') as IN_MONTH             
                from d_vd1
                where NGAY_VD between :from_date AND :to_date AND MA_KH NOT LIKE '%00000'
                    AND MA_KH NOT LIKE '%99999' " + (!string.IsNullOrEmpty(customer_code) ? (" AND MA_KH = '" + customer_code + "'") : "") + @"
                ";
            //var _conn = new OracleConnection(Properties.Settings.Default.ORAC);
            TOTAL1 = 1;
            IEnumerable<nc_accounting_temp_price> list;// = 
            backgroundWorker1.ReportProgress(curr1 * 100 / TOTAL1, "Get list...");
            backgroundWorker1.ReportProgress(curr1 * 100 / TOTAL1, from_date.ToString());
            using (var _conn = new OracleConnection(Properties.Settings.Default.ORAC))
            {
                _conn.Open();
                list = _conn.Query<nc_accounting_temp_price>(sql,new { from_date, to_date }, commandTimeout: 3000);
                _conn.Close();
            }
            //try
            //{
            //    _conn.Close();
            //    _conn.Dispose();
            //}
            //catch { }
            TOTAL1 = list.Count();
            backgroundWorker1.ReportProgress(curr1 * 100 / TOTAL1, "Total list " + TOTAL1);
            //foreach(var it in list)
            //{
            //    try
            //    {
            //        //it.assign(_connKEC);
            //        it.updateId();
            //    it.save(barCheckItem6.Checked);
            //    backgroundWorker1.ReportProgress(curr1*100/TOTAL1,it.MA_KH);
            //    curr1++;
            //    }
            //    catch (Exception ex)
            //    {
            //        backgroundWorker1.ReportProgress(curr1 * 100 / TOTAL1, ex.Message);

            //    }
            //}
            //DapperPlusManager.Entity<nc_accounting_temp_customer>().Table("nc_accounting_temp_customer").Identity(x=>x.id);
            DapperPlusManager.Entity<nc_accounting_temp_price>("Insert_nc_accounting_temp_price")
                .Table("nc_accounting_temp_price")
                .Key(x => x.SO_VAN_DON)
                .InsertIfNotExists();

            DapperPlusManager.Entity<nc_accounting_temp_price>("Update_nc_accounting_temp_price")
                .Table("nc_accounting_temp_price")
                .Key(x => x.SO_VAN_DON);
            backgroundWorker1.ReportProgress(curr1 * 100 / TOTAL1, "Processing list... ");
            using (var conn = new SqlConnection(Properties.Settings.Default.KEVN))
            {
                conn.Open();
                backgroundWorker1.ReportProgress(curr1 * 100 / TOTAL1, "Updating list...");
                conn.BulkUpdate("Update_nc_accounting_temp_price", list);
                backgroundWorker1.ReportProgress(curr1 * 100 / TOTAL1, "Inserting list...");
                conn.BulkInsert("Insert_nc_accounting_temp_price", list);

                conn.Close();
            }
            //_connKEC.BulkMerge<nc_accounting_temp_customer>(list);

            backgroundWorker1.ReportProgress(100, "Finished");
        }

        public void syncRevenue(DateTime from_date, DateTime to_date, string customer_code = null)
        {
            string sql = @"SELECT MA_KH, to_char(NGAY_VD,'YYYY-MM') as IN_MONTH , count(*) AS NUM_PACKAGE, sum(doanhthu) as DOANH_THU                            
                                FROM D_VD1 
                                WHERE  ngay_vd between :from_date AND :to_date AND MA_KH NOT LIKE '%00000'
                                          AND MA_KH NOT LIKE '%99999' " + (!string.IsNullOrEmpty(customer_code)  ? (" AND MA_KH = '" + customer_code + "'") : "") + @"
                                GROUP BY MA_KH, to_char(NGAY_VD, 'YYYY-MM')";
            //var _conn = new OracleConnection(Properties.Settings.Default.ORAC);
            //var list = _conn.Query<nc_accounting_temp_revenue>(sql, new { from_date, to_date }, commandTimeout: 3000);
            //try
            //{
            //    _conn.Close();
            //    _conn.Dispose();
            //}
            //catch { }
            //TOTAL2 += list.Count();
            //foreach (var it in list)
            //{
            //    try
            //    {
            //        //it.assign(_connKEC);
            //        it.updateId();
            //        it.save(barCheckItem6.Checked);
            //        backgroundWorker2.ReportProgress(curr2 * 100 / TOTAL2, it.MA_KH+" "+it.IN_MONTH);
            //    curr2++;
            //        }
            //        catch (Exception ex)
            //        {
            //            backgroundWorker2.ReportProgress(curr2 * 100 / TOTAL2, ex.Message);

            //        }
            //    }

            //
            TOTAL2 = 1;
            backgroundWorker2.ReportProgress(curr2 * 100 / TOTAL2, "Get list...");
            IEnumerable<nc_accounting_temp_revenue> list;
            using (var _conn = new OracleConnection(Properties.Settings.Default.ORAC))
            {
                _conn.Open();
                list = _conn.Query<nc_accounting_temp_revenue>(sql, new { from_date, to_date }, commandTimeout: 3000);
                _conn.Close();
            }
            
            TOTAL2 = list.Count();
            backgroundWorker2.ReportProgress(curr2 * 100 / TOTAL2, "Total in list " + TOTAL2);
            DapperPlusManager.Entity<nc_accounting_temp_revenue>("Insert_nc_accounting_temp_revenue")
                .Table("nc_accounting_temp_revenue")
                .Key(x => new { x.MA_KH, x.IN_MONTH })
                .InsertIfNotExists();

            DapperPlusManager.Entity<nc_accounting_temp_revenue>("Update_nc_accounting_temp_revenue")
                .Table("nc_accounting_temp_revenue")
                .Key(x => new { x.MA_KH, x.IN_MONTH });
            backgroundWorker2.ReportProgress(curr2 * 100 / TOTAL2, "Processing list...");
            using (var conn = new SqlConnection(Properties.Settings.Default.KEVN))
            {
                conn.Open();
                foreach(var it in list)
                {
                    it.updateId();
                    curr2++;
                    backgroundWorker2.ReportProgress(curr2 * 100 / TOTAL2, it.MA_KH+" "+it.IN_MONTH);
                }
                backgroundWorker2.ReportProgress(curr2 * 100 / TOTAL2, "Updating list...");
                conn.BulkUpdate("Update_nc_accounting_temp_revenue", list);
                backgroundWorker2.ReportProgress(curr2 * 100 / TOTAL2, "Inserting list...");
                conn.BulkInsert("Insert_nc_accounting_temp_revenue", list);

                conn.Close();
            }
            backgroundWorker2.ReportProgress(100, "Finished");

        }
        public void syncBill(DateTime from_date, DateTime to_date, string customer_code = null)
        {
            string sql = @"SELECT MA_KH,
                                    A.SO_VAN_DON,
                                    D_VD1.DOANHTHU TIEN_HD,
                                    SO_HD || '-' || INVOCIE_SERIAL AS SO_HD,
                                    NGAY_HD,
                                    TO_CHAR(A.NGAY_VD,'YYYY-MM') AS IN_MONTH,
                                    C.CREATED,
                                    quy_doi(greatest(nvl(A.kl_van_don_qd_ks,0),nvl(A.kl_van_don_qd,0),nvl(A.kl_van_don_ks,0),nvl(A.kl_van_don,0)),A.c_uom_id) as WEIGHT,
                                    D_VD1.MA_DV as DV,
                                    case when d_vd1.TU_VUNG = 468 and ( d_vd1.DEN_VUNG = 469 or d_vd1.DEN_VUNG = 471 or d_vd1.DEN_VUNG = 472) then 1
                                         when d_vd1.DEN_VUNG = 486 and ( d_vd1.TU_VUNG = 469 or d_vd1.TU_VUNG = 471 or d_vd1.TU_VUNG = 472) then 2
                                         else 0 end as WAY,
                                    CH.TRUONG_CHOT as POST
                                FROM FPT_VAN_DON A, KTTC_VD_HOA_DON B, KTTC_HOA_DON C, D_VD1, FMIS_CHOT CH
                                WHERE     A.NGAY_VD between :from_date AND :to_date 
                                    AND A.FPT_VAN_DON_ID = B.FPT_VAN_DON_ID(+)
                                    AND B.KTTC_HOA_DON_ID = C.KTTC_HOA_DON_ID(+)
                                    AND A.MA_POST_NHAN = CH.MA_CHOT(+)
                                    AND C.STA_XL = '02' AND D_VD1.SO_VAN_DON = A.SO_VAN_DON AND MA_KH NOT LIKE '%00000' 
                                    AND MA_KH NOT LIKE '%99999'  " + (!string.IsNullOrEmpty(customer_code) ? (" AND MA_KH = '" + customer_code + "'") : "") + @"
                                ";
            //var _conn = new OracleConnection(Properties.Settings.Default.ORAC);
            //var list = _conn.Query<nc_accounting_temp_bill>(sql, new { from_date, to_date }, commandTimeout: 3000);
            //try
            //{
            //    _conn.Close();
            //    _conn.Dispose();
            //}
            //catch { }
            //TOTAL3 += list.Count();
            //foreach (var it in list)
            //{
            //    //try
            //    //{
            //        //it.assign(_connKEC);
            //        it.updateId();
            //    it.save(barCheckItem6.Checked);
            //    backgroundWorker3.ReportProgress(curr3 * 100 / TOTAL3, it.MA_KH + " " + it.IN_MONTH+ " "+it.SO_VAN_DON);
            //    curr3++;
            //      //      }
            //      //      catch (Exception ex)
            //      //      {
            //      //          backgroundWorker3.ReportProgress(curr3 * 100 / TOTAL3, ex.Message);

            //      //      }
            //        }
            TOTAL3 = 1;
            backgroundWorker3.ReportProgress(curr3 * 100 / TOTAL3, "Get list...");
            IEnumerable<nc_accounting_temp_bill> list;
            using (var _conn = new OracleConnection(Properties.Settings.Default.ORAC))
            {
                _conn.Open();
                list = _conn.Query<nc_accounting_temp_bill>(sql, new { from_date, to_date }, commandTimeout: 3000);
                _conn.Close();
            }

            TOTAL3 = list.Count();
            backgroundWorker3.ReportProgress(curr3 * 100 / TOTAL3, "Total in list " + TOTAL3);
            DapperPlusManager.Entity<nc_accounting_temp_bill>("Insert_nc_accounting_temp_bill")
                .Table("nc_accounting_temp_bill")
                .Key(x => new { x.SO_VAN_DON, x.IN_MONTH, x.SO_HD })
                .InsertIfNotExists();

            DapperPlusManager.Entity<nc_accounting_temp_bill>("Update_nc_accounting_temp_bill")
                .Table("nc_accounting_temp_bill")
                .Key(x => new { x.SO_VAN_DON, x.IN_MONTH, x.SO_HD });
            backgroundWorker3.ReportProgress(curr3 * 100 / TOTAL3, "Processing list...");

            IEnumerable<string> uw;
            using (var conn = new SqlConnection(Properties.Settings.Default.KEVN))
            {
                conn.Open();
                //foreach (var it in list)
                //{
                //    it.updateId();
                //    backgroundWorker3.ReportProgress(curr2 * 100 / TOTAL2, it.MA_KH + " " + it.IN_MONTH);
                //}
                //backgroundWorker2.ReportProgress(curr2 * 100 / TOTAL2, "Updating list...");
                conn.BulkUpdate("Update_nc_accounting_temp_bill", list);
                backgroundWorker3.ReportProgress(curr3 * 100 / TOTAL3, "Inserting list...");
                conn.BulkInsert("Insert_nc_accounting_temp_bill", list);

                uw = conn.Query<string>(@"
                    select distinct SO_VAN_DON from
                    nc_accounting_temp_bill where WEIGHT is null or dv is null
                ", commandTimeout:3000);

                conn.Close();
            }
            if (uw.Count() > 0)
            {
                var svd = String.Join("','",uw.ToArray());
                IEnumerable<dynamic> svdlist;
                
                var c = 0;
                foreach(var l in uw)
                {
                    using (var _conn = new OracleConnection(Properties.Settings.Default.ORAC))
                    {
                        _conn.Open();
                        svdlist = _conn.Query(@"SELECT A.SO_VAN_DON,                                    
                        quy_doi(greatest(A.kl_van_don_qd_ks,A.kl_van_don_qd,A.kl_van_don_ks,A.kl_van_don),A.c_uom_id) as WEIGHT,
                        VD1.MA_DV as DV
                        FROM FPT_VAN_DON A,VD1
                        WHERE     VD1.SO_VAN_DON = A.SO_VAN_DON AND A.So_Van_don = :SO_VAN_DON",new { SO_VAN_DON = l}, commandTimeout: 3000);
                        _conn.Close();
                    }
                    foreach(var r in svdlist)
                    {
                        using (var conn = new SqlConnection(Properties.Settings.Default.KEVN))
                        {
                            conn.Open();
                            conn.Execute("UPDATE nc_accounting_temp_bill set WEIGHT = @WEIGHT, DV=@DV WHERE SO_VAN_DON = @SO_VAN_DON", new
                            {
                                SO_VAN_DON = r.SO_VAN_DON,
                                WEIGHT = r.WEIGHT,
                                DV = r.DV
                            }, commandTimeout: 3000);
                            conn.Close();
                        }
                    }
                    
                        c++;
                    backgroundWorker3.ReportProgress(100*c/svdlist.Count(), l);
                }
            }
            backgroundWorker3.ReportProgress(100, "Finished");
        }

        public void syncDiscount(DateTime from_date, DateTime to_date, string customer_code = null)
        {
            string sql = @"SELECT MA_KH, to_char(VD1.NGAY_VD,'YYYY-MM') as IN_MONTH, C.SO_VAN_DON, SUM (NVL (DIEU_CHINH, 0)) AS DC
                                FROM KTTC_DC_DOANH_THU A, KTTC_VD_DC_DOANH_THU C, FPT_VAN_DON D, VD1
                                WHERE     A.KTTC_DC_DOANH_THU_ID = C.KTTC_DC_DOANH_THU_ID
                                        AND C.SO_VAN_DON = D.SO_VAN_DON AND C.SO_VAN_DON = VD1.SO_VAN_DON
                                        AND D.NGAY_VD between :from_date AND :to_date 
                                     AND MA_KH NOT LIKE '%00000' 
                                                  AND MA_KH NOT LIKE '%99999'  " + (!string.IsNullOrEmpty(customer_code) ? (" AND MA_KH = '" + customer_code + "'") : "") + @"
                                GROUP BY MA_KH, to_char(VD1.NGAY_VD,'YYYY-MM'), C.SO_VAN_DON                                
                                ";
            //var _conn = new OracleConnection(Properties.Settings.Default.ORAC);
            //var list = _conn.Query<nc_accounting_temp_discount>(sql,new { from_date, to_date}, commandTimeout: 3000);
            //try
            //{
            //    _conn.Close();
            //    _conn.Dispose();
            //}
            //catch { }
            //TOTAL4 += list.Count();
            //foreach (var it in list)
            //{
            //    try
            //    {
            //        //it.assign(_connKEC);
            //        it.updateId();
            //        it.save(barCheckItem6.Checked);
            //        backgroundWorker4.ReportProgress(curr4 * 100 / TOTAL4, it.MA_KH + " " + it.IN_MONTH);
            //    curr4++;
            //                }
            //                catch (Exception ex)
            //                {
            //                    backgroundWorker4.ReportProgress(curr4 * 100 / TOTAL4, ex.Message);

            //                }
            //            }
            TOTAL4 = 1;
            backgroundWorker4.ReportProgress(curr4 * 100 / TOTAL4, "Get list...");
            IEnumerable<nc_accounting_temp_discount> list;
            using (var _conn = new OracleConnection(Properties.Settings.Default.ORAC))
            {
                _conn.Open();
                list = _conn.Query<nc_accounting_temp_discount>(sql, new { from_date, to_date }, commandTimeout: 3000);
                _conn.Close();
            }

            TOTAL4 = list.Count();
            backgroundWorker4.ReportProgress(curr4 * 100 / TOTAL4, "Total in list " + TOTAL4);
            DapperPlusManager.Entity<nc_accounting_temp_discount>("Insert_nc_accounting_temp_discount")
                .Table("nc_accounting_temp_discount")
                .Key(x => new { x.SO_VAN_DON, x.IN_MONTH})
                .InsertIfNotExists();

            DapperPlusManager.Entity<nc_accounting_temp_discount>("Update_nc_accounting_temp_discount")
                .Table("nc_accounting_temp_discount")
                .Key(x => new { x.SO_VAN_DON, x.IN_MONTH});
            backgroundWorker4.ReportProgress(curr4 * 100 / TOTAL4, "Processing list...");
            using (var conn = new SqlConnection(Properties.Settings.Default.KEVN))
            {
                conn.Open();
                //foreach (var it in list)
                //{
                //    it.updateId();
                //    backgroundWorker3.ReportProgress(curr2 * 100 / TOTAL2, it.MA_KH + " " + it.IN_MONTH);
                //}
                //backgroundWorker2.ReportProgress(curr2 * 100 / TOTAL2, "Updating list...");
                conn.BulkUpdate("Update_nc_accounting_temp_discount", list);
                backgroundWorker4.ReportProgress(curr4 * 100 / TOTAL4, "Inserting list...");
                conn.BulkInsert("Insert_nc_accounting_temp_discount", list);

                conn.Close();
            }
            backgroundWorker4.ReportProgress(100, "Finished");
        }

        public void syncInvoice(DateTime from_date, DateTime to_date, string customer_code = null)
        {
            //to_date = DateTime.Now;
            string sql = @"SELECT (SELECT VALUE
                                        FROM AD_ORG
                                    WHERE AD_ORG_ID = A.AD_ORG_ID)
                                        AS cn,
                                    A.DOCUMENTNO AS SO_HD,
                                    DATEINVOICED as INVOICE_DATE,
                                    TO_CHAR (DATEINVOICED, 'YYYY-MM') IN_MONTH,
                                    A.DATEACCT ngay_ghi_so,
                                    NOTE1 || ' ' || NOTE2 AS Note_Orc,
                                    STA_XL,
                                    A.DESCRIPTION,
                                    VALUE as MA_KH,
                                    NAME as TEN_KH,
                                    GRANDTOTAL AS Invoice_Amount,
                                    AMOUNT AS receipt_amount,
                                    CP.DATETRX AS payment_date
                                FROM C_INVOICE A
                                    LEFT JOIN C_BPARTNER B
                                        ON A.C_BPARTNER_ID = B.C_BPARTNER_ID
                                    LEFT JOIN KTTC_HOA_DON C
                                        ON SO_HD || '-' || INVOCIE_SERIAL = A.DOCUMENTNO
                                    LEFT JOIN C_ALLOCATIONLINE AL
                                        ON A.C_INVOICE_ID = AL.C_INVOICE_ID
                                    INNER JOIN C_PAYMENT CP
                                        ON AL.C_PAYMENT_ID = CP.C_PAYMENT_ID
                                WHERE     A.C_DOCTYPE_ID = 1000153
                                    AND A.DATEACCT between  :from_date AND :to_date 
                                     AND A.REVERSAL_ID IS NULL
                                    AND NVL (STA_XL, '09') != '00'";
            //var _conn = new OracleConnection(Properties.Settings.Default.ORAC);
            //var list = _conn.Query<nc_accounting_temp_invoice>(sql, new { from_date, to_date = DateTime.Now }, commandTimeout: 3000);
            //try
            //{
            //    _conn.Close();
            //    _conn.Dispose();
            //}
            //catch { }
            //TOTAL5 += list.Count();
            //foreach (var it in list)
            //{
            //    //it.assign(_connKEC);
            //    try
            //    {
            //        it.updateId();
            //        it.save(barCheckItem6.Checked);
            //        backgroundWorker5.ReportProgress(curr5 * 100 / TOTAL5, it.MA_KH + " " + it.SO_HD);
            //        curr5++;
            //    }
            //    catch(Exception ex)
            //    {
            //        backgroundWorker5.ReportProgress(curr5 * 100 / TOTAL5, ex.Message);

            //    }

            //}
            TOTAL5 = 1;
            backgroundWorker5.ReportProgress(curr5 * 100 / TOTAL5, "Get list...");
            IEnumerable<nc_accounting_temp_invoice> list;
            using (var _conn = new OracleConnection(Properties.Settings.Default.ORAC))
            {
                _conn.Open();
                list = _conn.Query<nc_accounting_temp_invoice>(sql, new { from_date, to_date }, commandTimeout: 3000);
                _conn.Close();
            }

            TOTAL5 = list.Count();
            backgroundWorker5.ReportProgress(curr5 * 100 / TOTAL5, "Total in list " + TOTAL5);
            DapperPlusManager.Entity<nc_accounting_temp_invoice>("Insert_nc_accounting_temp_invoice")
                .Table("nc_accounting_temp_invoice")
                .Key(x => x.SO_HD)
                .InsertIfNotExists();

            DapperPlusManager.Entity<nc_accounting_temp_invoice>("Update_nc_accounting_temp_invoice")
                .Table("nc_accounting_temp_invoice")
                .Key(x => x.SO_HD);
            backgroundWorker5.ReportProgress(curr5 * 100 / TOTAL5, "Processing list...");
            using (var conn = new SqlConnection(Properties.Settings.Default.KEVN))
            {
                conn.Open();
                //foreach (var it in list)
                //{
                //    it.updateId();
                //    backgroundWorker3.ReportProgress(curr2 * 100 / TOTAL2, it.MA_KH + " " + it.IN_MONTH);
                //}
                //backgroundWorker2.ReportProgress(curr2 * 100 / TOTAL2, "Updating list...");
                conn.BulkUpdate("Update_nc_accounting_temp_invoice", list);
                backgroundWorker5.ReportProgress(curr5 * 100 / TOTAL5, "Inserting list...");
                conn.BulkInsert("Insert_nc_accounting_temp_invoice", list);

                conn.Close();
            }
            backgroundWorker5.ReportProgress(100, "Finished");
        }

        private void barButtonItem1_ItemClick(object sender, DevExpress.XtraBars.ItemClickEventArgs e)
        {
            barButtonItem1.Enabled = false;
            INPROGRESS = 0;
            if (barCheckItem1.Checked)
            {
                TOTAL1 = 1;
                curr1 = 0;
                INPROGRESS++;
                backgroundWorker1.RunWorkerAsync();
            }
            if (barCheckItem2.Checked)
            {
                INPROGRESS++;
                TOTAL2 = 1;
                curr2 = 0;
                backgroundWorker2.RunWorkerAsync();
            }
            if (barCheckItem3.Checked)
            {
                TOTAL3 = 1;
                curr3 = 0;
                INPROGRESS++;
                backgroundWorker3.RunWorkerAsync();
            }
            if (barCheckItem4.Checked)
            {
                TOTAL4 = 1;
                curr4 = 0;
                INPROGRESS++;
                backgroundWorker4.RunWorkerAsync();
            }
            if (barCheckItem5.Checked)
            {
                TOTAL5 = 1;
                curr5 = 0;
                INPROGRESS++;
                backgroundWorker5.RunWorkerAsync();
            }
            
        }

        private void backgroundWorker1_DoWork(object sender, DoWorkEventArgs e)
        {
            syncCustomer();
            curr1 = 0;
            TOTAL1 = 1;
            var customer_code = "";
            try
            {
                customer_code = (string)barEditItem1.EditValue;
            }
            catch (Exception ex) { }
            DateTime from_date;
            try
            {
                from_date = (DateTime)barEditItem2.EditValue;
            }
            catch (Exception ex)
            {
                from_date = dfrom_date;
            }
            DateTime to_date;
            try
            {
                to_date = (DateTime)barEditItem3.EditValue;
                to_date = new DateTime(to_date.Year, to_date.Month + 1, 1);
            }
            catch (Exception ex)
            {
                to_date = dto_date;
            }
            var b = from_date;
            var c = new DateTime(from_date.Year,from_date.Month, from_date.Day,23,59,59);
            while (c <= to_date)
            {
                syncPrice(b, c, customer_code);
                b = c;
                c = c.AddDays(1);
            }
            
        }

        private void caculationLastData()
        {
            using (var conn = new SqlConnection(Properties.Settings.Default.KEVN))
            {
                conn.Open();
                conn.Execute(@"[dbo].[portal_kpi_data]", commandTimeout: 30000);
                conn.Execute(@"[dbo].[portal_kpi_data_new]", commandTimeout: 30000);
                conn.Execute(@"[dbo].[portal_kpi]", commandTimeout: 30000);
                conn.Execute(@"[dbo].[portal_kpi_new]", commandTimeout: 30000);
                conn.Close();
            }
        }

        private void backgroundWorker1_ProgressChanged(object sender, ProgressChangedEventArgs e)
        {
            progressBarControl1.EditValue = e.ProgressPercentage;
            textBox1.Text = e.UserState.ToString() + "\r\n" + textBox1.Text;
            if (textBox1.Text.Length > 1000)
            {
                textBox1.Text = "";
            }
            label1.Text = curr1 + " / " + TOTAL1;
        }

        private void backgroundWorker1_RunWorkerCompleted(object sender, RunWorkerCompletedEventArgs e)
        {
            
            INPROGRESS--;
            if (INPROGRESS <= 0)
            {
                caculationLastData();
                barButtonItem1.Enabled = true;
            }
        }
        private void backgroundWorker2_RunWorkerCompleted(object sender, RunWorkerCompletedEventArgs e)
        {

            INPROGRESS--;
            if (INPROGRESS <= 0)
            {
                caculationLastData();
                barButtonItem1.Enabled = true;
            }
        }
        private void backgroundWorker3_RunWorkerCompleted(object sender, RunWorkerCompletedEventArgs e)
        {

            INPROGRESS--;
            if (INPROGRESS <= 0)
            {
                caculationLastData();
                barButtonItem1.Enabled = true;
            }
        }
        private void backgroundWorker4_RunWorkerCompleted(object sender, RunWorkerCompletedEventArgs e)
        {

            INPROGRESS--;
            if (INPROGRESS <= 0)
            {
                caculationLastData();
                barButtonItem1.Enabled = true;
            }
        }
        private void backgroundWorker5_RunWorkerCompleted(object sender, RunWorkerCompletedEventArgs e)
        {

            INPROGRESS--;
            if (INPROGRESS <= 0)
            {
                caculationLastData();
                barButtonItem1.Enabled = true;
            }
        }

        private void backgroundWorker2_DoWork(object sender, DoWorkEventArgs e)
        {
            var customer_code = "";
            try
            {
                customer_code = (string)barEditItem1.EditValue;
            }
            catch (Exception ex) { }
            DateTime from_date;
            try
            {
                from_date = (DateTime)barEditItem2.EditValue;
            }
            catch (Exception ex)
            {
                from_date = dfrom_date;
            }
            DateTime to_date;
            try
            {
                to_date = (DateTime)barEditItem3.EditValue;
                to_date = new DateTime(to_date.Year, to_date.Month + 1, 1);
            }
            catch (Exception ex)
            {
                to_date = dto_date;
            }
            syncRevenue(from_date, to_date, customer_code);
        }

        private void backgroundWorker3_DoWork(object sender, DoWorkEventArgs e)
        {
            var customer_code = "";
            try
            {
                customer_code = (string)barEditItem1.EditValue;
            }
            catch (Exception ex) { }
            DateTime from_date;
            try
            {
                from_date = (DateTime)barEditItem2.EditValue;
            }
            catch (Exception ex)
            {
                from_date = dfrom_date;
            }
            DateTime to_date;
            try
            {
                to_date = (DateTime)barEditItem3.EditValue;
                to_date = new DateTime(to_date.Year, to_date.Month + 1, 1);
                
            }
            catch (Exception ex)
            {
                to_date = dto_date;
            }
            syncBill(from_date,to_date,customer_code);
        }

        private void backgroundWorker4_DoWork(object sender, DoWorkEventArgs e)
        {
            var customer_code = "";
            try
            {
                customer_code = (string)barEditItem1.EditValue;
            }
            catch (Exception ex) { }
            DateTime from_date;
            try
            {
                from_date = (DateTime)barEditItem2.EditValue;
            }
            catch (Exception ex)
            {
                from_date = dfrom_date;
            }
            DateTime to_date;
            try
            {
                to_date = (DateTime)barEditItem3.EditValue;
                to_date = new DateTime(to_date.Year, to_date.Month + 1, 1);
            }
            catch (Exception ex)
            {
                to_date = dto_date;
            }
            syncDiscount(from_date, to_date, customer_code);
        }

        private void backgroundWorker5_DoWork(object sender, DoWorkEventArgs e)
        {
            var customer_code = "";
            try
            {
                customer_code = (string)barEditItem1.EditValue;
            }
            catch (Exception ex) { }
            DateTime from_date;
            try
            {
                from_date = (DateTime)barEditItem2.EditValue;
            }
            catch (Exception ex)
            {
                from_date = dfrom_date;
            }
            DateTime to_date;
            try
            {
                to_date = (DateTime)barEditItem3.EditValue;
                to_date = new DateTime(to_date.Year, to_date.Month + 1, 1);
            }
            catch (Exception ex)
            {
                to_date = dto_date;
            }
            syncInvoice(from_date, to_date, customer_code);
        }

        private void backgroundWorker2_ProgressChanged(object sender, ProgressChangedEventArgs e)
        {
            progressBarControl2.EditValue = e.ProgressPercentage;
            textBox2.Text = e.UserState.ToString() + "\r\n" + textBox2.Text;
            if (textBox2.Text.Length > 1000)
            {
                textBox2.Text = "";
            }
            label2.Text = curr2 + " / " + TOTAL2;
        }

        private void backgroundWorker3_ProgressChanged(object sender, ProgressChangedEventArgs e)
        {
            progressBarControl3.EditValue = e.ProgressPercentage;
            textBox3.Text = e.UserState.ToString() + "\r\n" + textBox3.Text;
            if (textBox3.Text.Length > 1000)
            {
                textBox3.Text = "";
            }
            label3.Text = curr3 + " / " + TOTAL3;
        }

        private void backgroundWorker4_ProgressChanged(object sender, ProgressChangedEventArgs e)
        {
            progressBarControl4.EditValue = e.ProgressPercentage;
            textBox4.Text = e.UserState.ToString() + "\r\n" + textBox4.Text;
            if (textBox4.Text.Length > 1000)
            {
                textBox4.Text = "";
            }
            label4.Text = curr4 + " / " + TOTAL4;
        }

        private void backgroundWorker5_ProgressChanged(object sender, ProgressChangedEventArgs e)
        {
            progressBarControl5.EditValue = e.ProgressPercentage;
            textBox5.Text = e.UserState.ToString() + "\r\n" + textBox5.Text;
            if (textBox5.Text.Length > 1000)
            {
                textBox5.Text = "";
            }
            label5.Text = curr5 + " / " + TOTAL5;
        }
    }
}
