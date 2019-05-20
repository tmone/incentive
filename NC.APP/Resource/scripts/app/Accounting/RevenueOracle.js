"use strict";


var Revenue = (function () {

    var Revenue = function (options) {
        var options = options || {};
        this.Name = "Revenue";
        this.Type = "dxDataGrid";
        this.id = options.id || (this.Name + (new Date()).getTime());
        this.Component = null;
        this.permit = getACL(this.Name) || { add: false, edit: false, delete: false };
        this.Data = null;//new NCStore({url:'api/Accounting/Report/Depting?org=50',key:"FPT_CONG_NO_KH_ID",permit:this.permit});
        this.Key = [];
        this.filterId;
        var that = this;
        var getTypeField = function (value, column = "") {
            if (column.length > 0) {
                var Columns = $("#" + that.id).dxDataGrid("instance").option("columns");
                if (Columns)
                    for (var i = 0; i < Columns.length; i++) {
                        var tmp = Columns[i] || {};
                        if (tmp.dataField == column) {
                            if (tmp.dataType)
                                return tmp.dataType;
                        }
                    }
            }
            if (typeof value === 'string' || value instanceof String)
                return "String";
            if (typeof value === 'number')
                return "Number";
            if (value instanceof Date)
                return "Date";
            if (typeof value === 'boolean')
                return "boolean";

            return "Object";
        }

        var SqlBuilder = function (a, type = "Object") {
            if (a == null)
                return null;
            // if(Array.isArray(a) && a.length == 3){
            //     return a[0];
            // } 
            if (Array.isArray(a) && a.length == 3) {


                if (a[1] == "anyof") {
                    return "(" + SqlBuilder(a[0]) + " in ('" + a[2].join("','") + "'))";
                }
                if (a[1] == "between") {
                    return "(" + SqlBuilder(a[0]) + " BETWEEN " + a[2].map(
                        x => ((x.getTime) || (/[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z/.test(x))) ? "convert(datetime,''" + x.toJSON() + "'',127')" : x
                    ).join(' AND ') + ")";
                }
                if (a[1] == 'contains') {
                    return "(" + SqlBuilder(a[0]) + " like N'%" + SqlBuilder(a[2]) + "%')";
                }
                if (a[1] == 'notcontains') {
                    return " not (" + SqlBuilder(a[0]) + " like N'%" + SqlBuilder(a[2]) + "%')";
                }
                if (a[1] == 'startswith') {
                    return " (" + SqlBuilder(a[0]) + " like N'" + SqlBuilder(a[2]) + "%')";
                }
                if (a[1] == 'endswith') {
                    return " not (" + SqlBuilder(a[0]) + " like N'%" + SqlBuilder(a[2]) + "')";
                }
                if (a[1] == 'startswith') {
                    return " (" + SqlBuilder(a[0]) + " like N'" + SqlBuilder(a[2]) + "%')";
                }
                var stype = getTypeField(a[0]);
                var type = "Object";
                if (stype == "String")
                    type = getTypeField(a[2], a[0]);

                return "(" + SqlBuilder(a[0]) + " " + a[1] + " " + SqlBuilder(a[2], type) + ")";
            }

            if (Array.isArray(a) && a.length > 3) {
                var rs = "";
                for (var i = 0; i < a.length; i++) {
                    rs = rs + " " + SqlBuilder(a[i]);
                }
                return "(" + rs + ")";
            }

            if (type == "String" || type == "string") {
                return "N'" + a + "'";
            }
            if (type == "Date" || type == "DateTime" || type == "date") {
                var b = new Date(a.getTime());
                b.setHours(b.getHours() - b.getTimezoneOffset() / 60);
                return "convert(datetime,'" + b.toJSON() + "',127)";
            }


            if (a.getTime) {
                var b = new Date(a.getTime());
                b.setHours(b.getHours() - b.getTimezoneOffset() / 60);
                return "convert(datetime,'" + b.toJSON() + "',127)";
            }

            if (/[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z/.test(a)) {
                return "convert(datetime,'" + a + "',127)";
            }

            return "" + a;

        }


        var fromDate = new Date();
        fromDate.setMonth(0, 1);
        fromDate.setHours(0, 0, 0);
        var toDate = new Date();
        toDate.setDate(0);
        toDate.setHours(23, 59, 59);
        this.lastFilter = [['C_MONTH', '>=', fromDate], 'and', ['C_MONTH', '<=', toDate]];



        this.Init = function () {
            var that = this;
            var $find = $(that.id);

            var $find = $(that.id);

            if (!$find.length) {
                var scriptTag = document.scripts[document.scripts.length - 1];
                var parentTag = scriptTag.parentNode;
                $("<div id='form'>").appendTo(parentTag);
                $find = $("<div id='" + that.id + "'>").appendTo(parentTag);
                $("<div id='popup'>").appendTo(parentTag);
                $("<div id='loadPanel'>").appendTo(parentTag);
            }
            var averageTime = localStorage.averageTime || 300000;
            if (averageTime <= 0) {
                averageTime = 300000;
            }
            var beginTime;
            var runShow;

            var getMinus = function (i) {
                var s = i / 1000;
                var m = (s / 60) >> 0;
                s = (s - m * 60) >> 0;
                return m + ":" + (s < 10 ? "0" : "") + s;
            }

            var loadPanel = $("#loadPanel").dxLoadPanel({
                shadingColor: "rgba(0,0,0,0.4)",
                position: { of: "#form" },
                visible: false,
                showIndicator: true,
                showPane: true,
                shading: true,
                closeOnOutsideClick: false,
                message: "Loading...",
                onShown: function () {
                    beginTime = new Date().getTime();

                    runShow = setInterval(function () {
                        var newt = new Date().getTime();
                        loadPanel.option("message", "Loading " + getMinus(newt - beginTime) + " / " + getMinus(averageTime) + " ...");
                    }, 1000);
                }, onHidden: function () {
                    clearInterval(runShow);
                    var newt = new Date().getTime();
                    averageTime = (averageTime + newt - beginTime) / 2;
                    localStorage.setItem("averageTime", averageTime);
                }
            }).dxLoadPanel("instance");

            var localSource = [];
            var popup = null,
                popupOptions = {
                    width: 600,
                    height: 500,
                    contentTemplate: function () {

                    },
                    showTitle: true,
                    title: "Tùy chỉnh dữ liệu",
                    visible: false,
                    dragEnabled: true,
                    closeOnOutsideClick: true,
                    toolbarItems: [],
                };

            var showInfo = function () {
                if (popup) {
                    $(".popup").remove();
                }
                var $popupContainer = $("<div />")
                    .addClass("popup")
                    .appendTo($("#popup"));
                popup = $popupContainer.dxPopup(popupOptions).dxPopup("instance");
                popup.show();
            };

            var isLoad = true;
            var DAT = [];


            var khStore = new NCData({
                url: 'api/master/customer?$select=id,customer_name,_orc_partner_code,address',
                callback: function (a) {
                    if (that.filterId) {
                        that.filterId.getEditor("CUSTOMER_CODE").option("dataSource", a);
                    }
                }
            });
            var onAFile = false;
            //var queueFinish = 0;
            var LOADED = {
                queque: 0,
            };
            var monthDiff = function (d1, d2) {
                var months;
                if (typeof (d1) == "string" || typeof (d1) == "String") {
                    d1 = new Date(d1);
                }
                if (typeof (d2) == "string" || typeof (d2) == "String") {
                    d2 = new Date(d2);
                }
                if (d1.getFullYear && d2.getFullYear) {
                    months = (d2.getFullYear() - d1.getFullYear()) * 12;
                    months -= d1.getMonth();
                    months += d2.getMonth();
                }

                return months <= 0 ? 0 : months;
            }
            var processOracle = function () {
                var data = LOADED.DTY.map((x) => {
                    var kh = LOADED.CTM.find(c => c.MA_KH == x.MA_KH) || { JOIN_DATE: new Date() };
                    var dc = 0;
                    var bill_invoice = 0;
                    var list_hd = [];
                    var invoice_amount = 0;
                    var receipt_amount = 0;
                    var tmp = LOADED.DC.filter(d => d.MA_KH == x.MA_KH && d.IN_MONTH == x.IN_MONTH);
                    if (tmp.length > 0) {
                        tmp.map((t) => {
                            dc += t.DC;
                        });
                    }


                    var thd = LOADED.HD.filter(h => h.MA_KH == x.MA_KH && h.IN_MONTH == x.IN_MONTH);
                    if (thd.length > 0) {
                        thd.map((hd) => {
                            bill_invoice += hd.TIEN_HD;
                            if (list_hd.filter(l => l == hd.SO_HD).length > 0 || false) {

                            } else {
                                list_hd.push(hd.SO_HD);
                            }
                        });
                    }
                    var iv = LOADED.INV.filter(i => list_hd.indexOf(i.SO_HD) >= 0);
                    x.INVOICE_LIST = iv || [];
                    if (iv.length > 0) {
                        iv.map((i) => {
                            invoice_amount += i.INVOICE_AMOUNT;
                            receipt_amount += i.RECEIPT_AMOUNT;

                        });
                    }

                    //x.SERVICE_PERIOD = month_number;
                    x.DC = dc;
                    x.AFTER_DISCOUNT = x.DOANH_THU - x.DC;
                    x.BILL_INVOICE = bill_invoice;
                    x.INVOICE_AMOUNT = invoice_amount;
                    x.RECEIPT_AMOUNT = receipt_amount;
                    x.BALANCE = x.RECEIPT_AMOUNT - x.AFTER_DISCOUNT;

                    var month_number = 0;
                    var cmd = new Date(x.IN_MONTH);
                    var dm = kh.JOIN_DATE || new Date();
                    if (typeof (dm) == "string" || typeof (dm) == "String") {
                        dm = new Date(dm);
                    }
                    month_number = monthDiff(dm, cmd);
                    var khs = Object.assign(kh, { SERVICE_PERIOD: month_number });
                    return Object.assign(x, khs);
                });

                //process data each customer
                var cus_co = LOADED.DTY.map(x=>x.MA_KH);
                cus_co.filter((e,i)=>cus_co.indexOf(e)==i).map(c=>{
                    var BEGIN = 0;
                    LOADED.DTY.filter(x=>x.MA_KH==c).sort((a,b) => a.IN_MONTH > b.IN_MONTH ? 1 : 0).map(x=>{
                        
                        if(x.BALANCE>0){
                            x.BALANCE = 0;
                        }
                        BEGIN+= x.BALANCE;
                        x.ALL_BALANCE = BEGIN;
                    });
                })

                //end process customer
                that.Component.option("dataSource", data);
                that.Component.option("columns", [
                    {
                        dataField: "MA_KH",
                        caption: "Customer Code",
                        sortOrder: 'asc'
                    },
                    {
                        dataField: "TEN_KH",
                        caption: "Customer Name"
                    },
                    {
                        dataField: "JOIN_DATE",
                        dataType: 'date',
                        format: 'dd/MM/yyyy'
                    },
                    {
                        dataField: "SERVICE_PERIOD",
                        dataType: "number",
                        format: "#"
                    },
                    {
                        dataField: "IN_MONTH",
                        caption: "CREATED",
                        sortOrder: 'asc'
                    },
                    {
                        dataField: "NUM_PACKAGE",
                        //caption:"CREATED"  ,
                        dataType: "number",
                        format: "#"
                    },
                    {
                        dataField: "DOANH_THU",
                        caption: "REVENUE",
                        dataType: "number",
                        format: "###,###"
                    },
                    {
                        dataField: "DC",
                        caption: "DISCOUNT",
                        dataType: "number",
                        format: "###,###"
                    },
                    {
                        dataField: "AFTER_DISCOUNT",
                        //caption:"DISCOUNT"  ,
                        dataType: "number",
                        format: "###,###"
                    },
                    {
                        dataField: "BILL_INVOICE",
                        //caption:"DISCOUNT"  ,
                        dataType: "number",
                        format: "###,###"
                    },
                    {
                        dataField: "INVOICE_AMOUNT",
                        //caption:"DISCOUNT"  ,
                        dataType: "number",
                        format: "###,###"
                    },
                    {
                        dataField: "RECEIPT_AMOUNT",
                        //caption:"DISCOUNT"  ,
                        dataType: "number",
                        format: "###,###"
                    },
                    {
                        dataField: "BALANCE",
                        //caption:"DISCOUNT"  ,
                        dataType: "number",
                        format: "###,###"
                    },
                    {
                        dataField: "ALL_BALANCE",
                        //caption:"DISCOUNT"  ,
                        dataType: "number",
                        format: "###,###"
                    },
                ]);
                loadPanel.hide();
            }

            var loadOracleData = function (dat) {
                LOADED.queque = 5;
                loadPanel.show();
                //CTM
                $.ajax({
                    url: getURL(`api/Accounting/Report/QO?q=
                                SELECT CASE
                                        WHEN GROUP_NAME IS NULL THEN TO_CHAR (KH.VALUE)
                                        ELSE GROUP_NAME
                                    END
                                        GROUP_NAME,
                                    KH.VALUE AS MA_KH,
                                    NAME as TEN_KH,
                                    KH.CREATED AS JOIN_DATE,
                                    ROUND(MONTHS_BETWEEN (CAST(
                                        FROM_TZ(TO_TIMESTAMP('`+ dat['TO_DATE'] + `', 'FXYYYY-MM-DD"T"HH24:MI:SS.FXFF3"Z"'),
                                          'UTC') AT LOCAL AS DATE), KH.CREATED)) AS SERVICE_PERIOD
                                FROM    D_GROUP_KH GR
                                    RIGHT JOIN
                                        C_BPARTNER KH
                                    ON GR.C_BPARTNER_ID = KH.C_BPARTNER_ID
                                WHERE isactive = 'Y' AND iscustomer = 'Y'
                                `),
                    method: "GET",
                }).done(function (a) {
                    LOADED.queque--;
                    LOADED.CTM = a;
                    if (LOADED.queque <= 0) {
                        processOracle();
                    }
                    console.log("loaded CTM");
                });
                // var CTMStore = new NCData({
                //     url: `api/Accounting/Report/QO?q=
                //     SELECT CASE
                //             WHEN GROUP_NAME IS NULL THEN TO_CHAR (KH.VALUE)
                //             ELSE GROUP_NAME
                //         END
                //             GROUP_NAME,
                //         KH.VALUE AS MA_KH,
                //         NAME as TEN_KH,
                //         KH.CREATED AS JOIN_DATE,
                //         ROUND(MONTHS_BETWEEN (CAST(
                //             FROM_TZ(TO_TIMESTAMP('`+ dat['TO_DATE'] + `', 'FXYYYY-MM-DD"T"HH24:MI:SS.FXFF3"Z"'),
                //               'UTC') AT LOCAL AS DATE), KH.CREATED)) AS SERVICE_PERIOD
                //     FROM    D_GROUP_KH GR
                //         INNER JOIN
                //             C_BPARTNER KH
                //         ON GR.C_BPARTNER_ID = KH.C_BPARTNER_ID
                //     WHERE isactive = 'Y' AND iscustomer = 'Y'
                //     `,
                //     callback: function (a) {
                //         LOADED.queque--;
                //         LOADED.CTM = a;
                //         if (LOADED.queque <= 0) {
                //             processOracle();
                //         }
                //         console.log("loaded CTM");
                //     }
                // });

                //DTY
                $.ajax({
                    url: getURL(`api/Accounting/Report/QO?q=
                                SELECT MA_KH, to_char(NGAY_VD,'YYYY-MM') as IN_MONTH , count(*) AS NUM_PACKAGE, sum(doanhthu) as DOANH_THU                            
                                FROM D_VD1 
                                WHERE  ngay_vd between CAST(
                                    FROM_TZ(TO_TIMESTAMP('`+ dat['FROM_DATE'] + `', 'FXYYYY-MM-DD"T"HH24:MI:SS.FXFF3"Z"'),
                                      'UTC') AT LOCAL AS DATE) and CAST(
                                        FROM_TZ(TO_TIMESTAMP('`+ dat['TO_DATE'] + `', 'FXYYYY-MM-DD"T"HH24:MI:SS.FXFF3"Z"'),
                                          'UTC') AT LOCAL AS DATE) AND MA_KH NOT LIKE '%00000' 
                                          AND MA_KH NOT LIKE '%99999' `+ (dat.CUSTOMER_CODE && dat.CUSTOMER_CODE.length > 0 ? (` AND MA_KH='` + dat.CUSTOMER_CODE + `'`) : '') + `
                                GROUP BY MA_KH, to_char(NGAY_VD,'YYYY-MM')
                                `),
                    method: "GET",
                }).done(function (a) {
                    LOADED.queque--;
                    LOADED.DTY = a;
                    if (LOADED.queque <= 0) {
                        processOracle();
                    }
                    console.log("loaded DTY");
                });
                // var DTYStore = new NCData({
                //     url: `api/Accounting/Report/QO?q=
                //     SELECT MA_KH, to_char(NGAY_VD,'YYYY-MM') as IN_MONTH , count(*) AS NUM_PACKAGE, sum(doanhthu) as DOANH_THU                            
                //     FROM D_VD1 
                //     WHERE  ngay_vd between CAST(
                //         FROM_TZ(TO_TIMESTAMP('`+ dat['FROM_DATE'] + `', 'FXYYYY-MM-DD"T"HH24:MI:SS.FXFF3"Z"'),
                //           'UTC') AT LOCAL AS DATE) and CAST(
                //             FROM_TZ(TO_TIMESTAMP('`+ dat['TO_DATE'] + `', 'FXYYYY-MM-DD"T"HH24:MI:SS.FXFF3"Z"'),
                //               'UTC') AT LOCAL AS DATE)`+ (dat.CUSTOMER_CODE && dat.CUSTOMER_CODE.length > 0 ? (` AND MA_KH='` + dat.CUSTOMER_CODE + `'`) : '') + `
                //     GROUP BY MA_KH, to_char(NGAY_VD,'YYYY-MM')
                //     `,
                //     callback: function (a) {
                //         LOADED.queque--;
                //         LOADED.DTY = a;
                //         if (LOADED.queque <= 0) {
                //             processOracle();
                //         }
                //         console.log("loaded DTY");
                //     }
                // });

                //HD
                $.ajax({
                    url: getURL(`api/Accounting/Report/QO?q=
                                SELECT MA_KH,
                                    A.SO_VAN_DON,
                                    TIEN_HD,
                                    SO_HD || '-' || INVOCIE_SERIAL AS SO_HD,
                                    NGAY_HD,
                                    TO_CHAR(A.NGAY_VD,'YYYY-MM') AS IN_MONTH,
                                    C.CREATED
                                FROM FPT_VAN_DON A, KTTC_VD_HOA_DON B, KTTC_HOA_DON C, VD1
                                WHERE     A.NGAY_VD between CAST(
                                    FROM_TZ(TO_TIMESTAMP('`+ dat['FROM_DATE'] + `', 'FXYYYY-MM-DD"T"HH24:MI:SS.FXFF3"Z"'),
                                      'UTC') AT LOCAL AS DATE) and CAST(
                                        FROM_TZ(TO_TIMESTAMP('`+ dat['TO_DATE'] + `', 'FXYYYY-MM-DD"T"HH24:MI:SS.FXFF3"Z"'),
                                          'UTC') AT LOCAL AS DATE)
                                    AND A.FPT_VAN_DON_ID = B.FPT_VAN_DON_ID
                                    AND B.KTTC_HOA_DON_ID = C.KTTC_HOA_DON_ID
                                    AND C.STA_XL = '02' AND VD1.SO_VAN_DON = A.SO_VAN_DON AND MA_KH NOT LIKE '%00000' 
                                    AND MA_KH NOT LIKE '%99999' `+ (dat.CUSTOMER_CODE && dat.CUSTOMER_CODE.length > 0 ? (` AND MA_KH='` + dat.CUSTOMER_CODE + `'`) : '') + `
                                `),
                    method: "GET",
                }).done(function (a) {
                    LOADED.queque--;
                    LOADED.HD = a;
                    if (LOADED.queque <= 0) {
                        processOracle();
                    }
                    console.log("loaded HD");
                });
                // var HDStore = new NCData({
                //     url: `api/Accounting/Report/QO?q=
                //     SELECT MA_KH,
                //         A.SO_VAN_DON,
                //         TIEN_HD,
                //         SO_HD || '-' || INVOCIE_SERIAL AS SO_HD,
                //         NGAY_HD,
                //         TO_CHAR(A.NGAY_VD,'YYYY-MM') AS IN_MONTH,
                //         C.CREATED
                //     FROM FPT_VAN_DON A, KTTC_VD_HOA_DON B, KTTC_HOA_DON C, VD1
                //     WHERE     A.NGAY_VD between CAST(
                //         FROM_TZ(TO_TIMESTAMP('`+ dat['FROM_DATE'] + `', 'FXYYYY-MM-DD"T"HH24:MI:SS.FXFF3"Z"'),
                //           'UTC') AT LOCAL AS DATE) and CAST(
                //             FROM_TZ(TO_TIMESTAMP('`+ dat['TO_DATE'] + `', 'FXYYYY-MM-DD"T"HH24:MI:SS.FXFF3"Z"'),
                //               'UTC') AT LOCAL AS DATE)
                //         AND A.FPT_VAN_DON_ID = B.FPT_VAN_DON_ID
                //         AND B.KTTC_HOA_DON_ID = C.KTTC_HOA_DON_ID
                //         AND C.STA_XL = '02' AND VD1.SO_VAN_DON = A.SO_VAN_DON`+ (dat.CUSTOMER_CODE && dat.CUSTOMER_CODE.length > 0 ? (` AND MA_KH='` + dat.CUSTOMER_CODE + `'`) : '') + `
                //     `,
                //     callback: function (a) {
                //         LOADED.queque--;
                //         LOADED.HD = a;
                //         if (LOADED.queque <= 0) {
                //             processOracle();
                //         }
                //         console.log("loaded HD");
                //     }
                // });

                //DC
                $.ajax({
                    url: getURL(`api/Accounting/Report/QO?q=
                                SELECT MA_KH, to_char(VD1.NGAY_VD,'YYYY-MM') as IN_MONTH, C.SO_VAN_DON, SUM (NVL (DIEU_CHINH, 0)) AS DC
                                FROM KTTC_DC_DOANH_THU A, KTTC_VD_DC_DOANH_THU C, FPT_VAN_DON D, VD1
                                WHERE     A.KTTC_DC_DOANH_THU_ID = C.KTTC_DC_DOANH_THU_ID
                                        AND C.SO_VAN_DON = D.SO_VAN_DON AND C.SO_VAN_DON = VD1.SO_VAN_DON
                                        AND D.NGAY_VD between CAST(
                                            FROM_TZ(TO_TIMESTAMP('`+ dat['FROM_DATE'] + `', 'FXYYYY-MM-DD"T"HH24:MI:SS.FXFF3"Z"'),
                                              'UTC') AT LOCAL AS DATE) and CAST(
                                                FROM_TZ(TO_TIMESTAMP('`+ dat['TO_DATE'] + `', 'FXYYYY-MM-DD"T"HH24:MI:SS.FXFF3"Z"'),
                                                  'UTC') AT LOCAL AS DATE) AND MA_KH NOT LIKE '%00000' 
                                                  AND MA_KH NOT LIKE '%99999' `+ (dat.CUSTOMER_CODE && dat.CUSTOMER_CODE.length > 0 ? (` AND MA_KH='` + dat.CUSTOMER_CODE + `'`) : '') + `
                                GROUP BY MA_KH, to_char(VD1.NGAY_VD,'YYYY-MM'), C.SO_VAN_DON
                                `),
                    method: "GET",
                }).done(function (a) {
                    LOADED.queque--;
                    LOADED.DC = a;
                    if (LOADED.queque <= 0) {
                        processOracle();
                    }
                    console.log("loaded DC");
                });
                // var DCStore = new NCData({
                //     url: `api/Accounting/Report/QO?q=
                //     SELECT MA_KH, to_char(VD1.NGAY_VD,'YYYY-MM') as IN_MONTH, C.SO_VAN_DON, SUM (NVL (DIEU_CHINH, 0)) AS DC
                //     FROM KTTC_DC_DOANH_THU A, KTTC_VD_DC_DOANH_THU C, FPT_VAN_DON D, VD1
                //     WHERE     A.KTTC_DC_DOANH_THU_ID = C.KTTC_DC_DOANH_THU_ID
                //             AND C.SO_VAN_DON = D.SO_VAN_DON AND C.SO_VAN_DON = VD1.SO_VAN_DON
                //             AND D.NGAY_VD between CAST(
                //                 FROM_TZ(TO_TIMESTAMP('`+ dat['FROM_DATE'] + `', 'FXYYYY-MM-DD"T"HH24:MI:SS.FXFF3"Z"'),
                //                   'UTC') AT LOCAL AS DATE) and CAST(
                //                     FROM_TZ(TO_TIMESTAMP('`+ dat['TO_DATE'] + `', 'FXYYYY-MM-DD"T"HH24:MI:SS.FXFF3"Z"'),
                //                       'UTC') AT LOCAL AS DATE)`+ (dat.CUSTOMER_CODE && dat.CUSTOMER_CODE.length > 0 ? (` AND MA_KH='` + dat.CUSTOMER_CODE + `'`) : '') + `
                //     GROUP BY MA_KH, to_char(VD1.NGAY_VD,'YYYY-MM'), C.SO_VAN_DON
                //     `,
                //     callback: function (a) {
                //         LOADED.queque--;
                //         LOADED.DC = a;
                //         if (LOADED.queque <= 0) {
                //             processOracle();
                //         }
                //         console.log("loaded DC");
                //     }
                // });

                //INV
                $.ajax({
                    url: getURL(`api/Accounting/Report/QO?q=
                                SELECT (SELECT VALUE
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
                                    AND A.DATEACCT between CAST(
                                        FROM_TZ(TO_TIMESTAMP('`+ dat['FROM_DATE'] + `', 'FXYYYY-MM-DD"T"HH24:MI:SS.FXFF3"Z"'),
                                          'UTC') AT LOCAL AS DATE) and CAST(
                                            FROM_TZ(TO_TIMESTAMP('`+ (new Date().toJSON()) + `', 'FXYYYY-MM-DD"T"HH24:MI:SS.FXFF3"Z"'),
                                              'UTC') AT LOCAL AS DATE)
                                    AND A.REVERSAL_ID IS NULL
                                    AND NVL (STA_XL, '09') != '00'
                                `),
                    method: "GET",
                }).done(function (a) {
                    LOADED.queque--;
                    LOADED.INV = a;
                    if (LOADED.queque <= 0) {
                        processOracle();
                    }
                    console.log("loaded INV");
                });
                // var INVStore = new NCData({
                //     url: `api/Accounting/Report/QO?q=
                //     SELECT (SELECT VALUE
                //             FROM AD_ORG
                //         WHERE AD_ORG_ID = A.AD_ORG_ID)
                //             AS cn,
                //         A.DOCUMENTNO AS SO_HD,
                //         DATEINVOICED as INVOICE_DATE,
                //         TO_CHAR (DATEINVOICED, 'YYYY-MM') ngay_hd,
                //         A.DATEACCT ngay_ghi_so,
                //         NOTE1 || ' ' || NOTE2 AS Note_Orc,
                //         STA_XL,
                //         A.DESCRIPTION,
                //         VALUE as MA_KH,
                //         NAME as TEN_KH,
                //         GRANDTOTAL AS Invoice_Amount,
                //         AMOUNT AS receipt_amount,
                //         CP.DATETRX AS payment_date
                //     FROM C_INVOICE A
                //         LEFT JOIN C_BPARTNER B
                //             ON A.C_BPARTNER_ID = B.C_BPARTNER_ID
                //         LEFT JOIN KTTC_HOA_DON C
                //             ON SO_HD || '-' || INVOCIE_SERIAL = A.DOCUMENTNO
                //         LEFT JOIN C_ALLOCATIONLINE AL
                //             ON A.C_INVOICE_ID = AL.C_INVOICE_ID
                //         INNER JOIN C_PAYMENT CP
                //             ON AL.C_PAYMENT_ID = CP.C_PAYMENT_ID
                //     WHERE     A.C_DOCTYPE_ID = 1000153
                //         AND A.DATEACCT between CAST(
                //             FROM_TZ(TO_TIMESTAMP('`+ dat['FROM_DATE'] + `', 'FXYYYY-MM-DD"T"HH24:MI:SS.FXFF3"Z"'),
                //               'UTC') AT LOCAL AS DATE) and CAST(
                //                 FROM_TZ(TO_TIMESTAMP('`+ (new Date().toJSON()) + `', 'FXYYYY-MM-DD"T"HH24:MI:SS.FXFF3"Z"'),
                //                   'UTC') AT LOCAL AS DATE)
                //         AND A.REVERSAL_ID IS NULL
                //         AND NVL (STA_XL, '09') != '00'
                //     `,
                //     callback: function (a) {
                //         LOADED.queque--;
                //         LOADED.INV = a;
                //         if (LOADED.queque <= 0) {
                //             processOracle();
                //         }
                //         console.log("loaded INV");
                //     }
                // });
            }

            var loadData = function (option) {                
                var dat = {};
                var fter = [];
                for (var i in option) {
                    if (option.hasOwnProperty(i) && i == "CUSTOMER_CODE") {
                        dat[i] = option[i];

                    }

                    if (option.hasOwnProperty(i) && i == "FROM_DATE") {
                        var b = new Date(option[i].getTime());
                        b.setHours(b.getHours() - b.getTimezoneOffset() / 60);
                        dat[i] = b.toJSON();
                    }
                    if (option.hasOwnProperty(i) && i == "TO_DATE") {
                        var b = new Date(option[i].getTime());
                        b.setHours(b.getHours() - b.getTimezoneOffset() / 60);
                        dat[i] = b.toJSON();
                    }

                }
                if (monthDiff(dat.FROM_DATE || new Date(), dat.TO_DATE || new Date()) > 1 && !dat.CUSTOMER_CODE) {
                    var result = DevExpress.ui.dialog.confirm("You choice big data. It will run very long time. Continue?", "Are you sure");
                    result.done(function (dialogResult) {
                        if (dialogResult) {
                            loadOracleData(dat);
                        }
                    });
                }else{
                    loadOracleData(dat);
                }
                // DevExpress.data.AspNet.createStore({
                //     loadUrl: getURL('api/Accounting/Report/RevenueDx'),
                //     onBeforeSend: function (method, ajaxOptions) {
                //         //ajaxOptions.xhrFields = { withCredentials: true };
                //         //if(ajaxOptions.data.filter){
                //         //var fil = that.lastFilter;//$("#fixGridId").dxDataGrid("instance").option("filterValue");
                //         //var sqlf = SqlBuilder(fil);
                //         // if (sqlf.indexOf("customer_code") === -1) {
                //         //     sqlf = "";
                //         // }
                //         //ajaxOptions.data.filterx = sqlf;//JSON.parse(ajaxOptions.data.filter)
                //         ajaxOptions.data = Object.assign(ajaxOptions.data, option);
                //     }
                // }).load().done(function (data) {
                //     loadPanel.hide();
                //     console.log(data);
                // });

            }

            that.filterId = $("#form").dxForm({
                colCount: 5,
                labelLocation: "top",
                elementAttr: {
                    class: "form-fix"
                },
                items: [
                    {
                        colSpan: 3,
                        dataField: "CUSTOMER_CODE",
                        label: {
                            text: "Customer"
                        },
                        editorType: "dxSelectBox",
                        name: "CUSTOMER_CODE",
                        editorOptions: {
                            dataSource: khStore.data || [],
                            displayExpr: function (o) {
                                if (o)
                                    return "[" + o._orc_partner_code + "] " + o.customer_name;
                                return "";
                            },
                            valueExpr: "_orc_partner_code",
                            searchEnabled: true,
                            minSearchLength: 7,
                            searchExpr: ["_orc_partner_code", "customer_name"]
                        }
                    },
                    {
                        dataField: "FROM_DATE",
                        label: {
                            text: "From Month"
                        },
                        editorType: "dxDateBox",
                        editorOptions: {
                            format: "yyyy-MM",
                            width: "100%",
                            displayFormat: 'yyyy-MM',
                            calendarOptions: {
                                maxZoomLevel: 'year',
                                minZoomLevel: 'century',
                            },
                            value: fromDate
                        }
                    },
                    {
                        dataField: "TO_DATE",
                        editorType: "dxDateBox",
                        label: {
                            text: "To Month"
                        },
                        editorOptions: {
                            format: "yyyy-MM",
                            width: "100%",
                            displayFormat: 'yyyy-MM',
                            calendarOptions: {
                                maxZoomLevel: 'year',
                                minZoomLevel: 'century',
                            },
                            value: toDate
                        }
                    },
                    // {
                    //     colSpan: 2,
                    //     dataField: "ADVANCE",
                    //     editorType: "dxSelectBox",
                    //     label: {
                    //         text: "Filter"
                    //     },
                    //     name: "ADVANCE",
                    //     editorOptions: {
                    //         dataSource: [
                    //             {
                    //                 id: 0,
                    //                 name: "Customers owed money",
                    //                 filter: ""
                    //             },
                    //         ],
                    //         valueExpr: "id",
                    //         displayExpr: "name"
                    //     }
                    // },
                    {
                        colSpan: 4,
                        itemType: "empty",
                    },
                    {
                        itemType: "button",
                        //cssClass: "height100",
                        buttonOptions: {
                            //height: "100%",
                            width: "100%",
                            icon: "find",
                            text: "Search",
                            type: "success",
                            onClick: function (e) {
                                //debugger;                             
                                var data = that.filterId.option("formData");
                                loadData(data);
                            }
                        }
                    }
                ],
            }).dxForm("instance");

            $find.dxDataGrid({
                // stateStoring: {
                //     enabled: true,
                //     type: "localStorage",
                //     storageKey: "lc_"+that.Name
                // },
                paging: {
                    pageSize: 10
                },
                pager: {
                    showPageSizeSelector: true,
                    allowedPageSizes: [10, 20, 50, 100, 200],
                    showInfo: true
                },
                // scrolling: {
                //     mode: "virtual",
                //     rowRenderingMode: "virtual"
                // },
                columnAutoWidth: true,
                allowColumnResizing: true,
                allowColumnReordering: true,
                dataSource: [],
                //keyExpr: "FPT_CONG_NO_KH_ID",
                export: {
                    allowExportSelectedData: true,
                    enabled: true,
                    excelFilterEnabled: true,
                    fileName: "Revesue"
                },
                selection: {
                    mode: "multiple",
                    selectAllMode: "allPages",
                    //showCheckBoxesMode:"always",
                },
                searchPanel: {
                    visible: true,
                    placeholder: "Search..."
                },
                sorting: {
                    mode: "multiple"
                },
                filterRow: {
                    visible: true,
                    applyFilter: "auto"
                },
                filterPanel: { visible: true },
                // headerFilter: {
                //     visible: true
                // },
                grouping: {
                    autoExpandAll: true,
                },
                groupPanel: {
                    visible: true
                },
                filterBuilderPopup: {
                    position: { of: window, at: "top", my: "top", offset: { y: 10 } },
                },
                showRowLines: true,
                showBorders: true,
                onSelectionChanged: function (e) {
                    that.Key = e.selectedRowKeys;

                },
                //beginCustomLoading(messageText)
                //endCustomLoading()
                onContentReady: function (e) {
                    // if(isLoad){
                    //     e.component.beginCustomLoading("Loading...");
                    // }
                },
                onToolbarPreparing: function (e) {
                    var toolbarItems = e.toolbarOptions.items;
                    toolbarItems.push(
                    );
                },
                allowColumnResizing: true,
                columnResizingMode: "nextColumn",
                masterDetail: {
                    enabled: true,
                    template: function (container, options) {
                        var currentEmployeeData = options.data;

                        $("<div>")
                            .addClass("master-detail-caption")
                            .text(currentEmployeeData.MA_KH + " " + currentEmployeeData.TEN_KH + "'s Invoice:")
                            .appendTo(container);

                        $("<div>")
                            .dxDataGrid({
                                columnAutoWidth: true,
                                showRowLines: true,
                                showBorders: true,
                                columns: [
                                    {
                                        dataField: "SO_HD",
                                        caption: "INVOICE NO."
                                    },
                                    {
                                        dataField: "INVOICE_DATE",
                                        dataType: "date",
                                        format: "dd/MM/yyyy"
                                    },
                                    {
                                        dataField: "INVOICE_AMOUNT",
                                        dataType: "number",
                                        format: "###,###"
                                    },
                                    {
                                        dataField: "RECEIPT_AMOUNT",
                                        dataType: "number",
                                        format: "###,###"
                                    },
                                    {
                                        dataField: "PAYMENT_DATE",
                                        dataType: "date",
                                        format: "dd/MM/yyyy"
                                    },
                                    {
                                        caption: "NOT PAYMENT",
                                        dataType: "number",
                                        format: "###,###",
                                        calculateCellValue: function (rowData) {
                                            return rowData.INVOICE_AMOUNT - rowData.RECEIPT_AMOUNT;
                                        }
                                    }],
                                dataSource: currentEmployeeData.INVOICE_LIST
                            }).appendTo(container);
                    }
                }
                // columnMinWidth: 50,
                //columnAutoWidth: true,
                // columns: [
                //     {
                //         dataField: "CUSTOMER_CODE",
                //     },
                //     {
                //         dataField: "CUSTOMER_NAME",
                //     },
                //     {
                //         dataField: "CUSTOMER_TYPE",
                //     },
                //     {
                //         dataField: "JOIN_DATE",
                //         dataField: "date",
                //         format: "dd/MM/yyyy"
                //     },
                //     {
                //         dataField: "SERVICE_PERIOD",
                //         dataType: "number",
                //     },
                //     {
                //         dataField: "C_MONTH",
                //         dataType: "date",
                //         format: "yyyy-MM"
                //     },
                //     {
                //         dataField: "REVENUE",
                //         dataType: "number",
                //         format: "###,###"
                //     },
                //     {
                //         dataField: "BILLS_IN_MONTH_AD_TO_INVOICE",
                //         dataType: "number",
                //         format: "###,###"
                //     },

                // ],

            });


            that.Component = $find.dxDataGrid("instance");


        }

        this.Init();
    }

    return Revenue;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Revenue;
else
    window.Revenue = Revenue;