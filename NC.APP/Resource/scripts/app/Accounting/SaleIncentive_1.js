"use strict";


var SaleIncentive = (function () {

    var SaleIncentive = function (options) {
        var options = options || {};
        this.Name = "SaleIncentive";
        this.Type = "dxPivotGrid";
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


        var fromDate = new Date('2018-01-01');
        //fromDate.setDate(0);
        //fromDate.setDate(1);
        //fromDate.setHours(0, 0, 0);
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
                $("<div id='chart'>").appendTo(parentTag);
                $find = $("<div id='" + that.id + "'>").appendTo(parentTag);
                $("<div id='popup'>").appendTo(parentTag);
                $("<div id='loadPanel'>").appendTo(parentTag);
            }
            var averageTime = localStorage.averageTime || 5000;
            if (averageTime <= 0 || averageTime > 3600000) {
                averageTime = 5000;
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

            var findDisCount = function (data, type) {
                var qr = DevExpress.data.query([data]);
                if (LOADED.DIS) {
                    //var qr = DevExpress.data.query(dataObjects)
                    var fil = LOADED.DIS.filter(x =>
                        x._active == true
                        && x._deleted == false
                        && x.user_approve != null
                        && (!x.from_date || (x.from_date && new Date(x.from_date) <= new Date()))
                        && (!x.to_date || (x.to_date && new Date(x.to_date) >= new Date()))
                        && x.type_rule == type
                    ).map((x) => {
                        //x.period = x.period ? x.period : -9999;
                        //x.FILTER = JSON.parse(x.filter_dx) || ['1', '=', '0'];
                        return Object.assign(x, {
                            period: x.period ? x.period : -9999,
                            FILTER: JSON.parse(x.filter_dx) || ['1', '=', '0']
                        });
                    }).sort((a, b) => a.period < b.period);

                    for (var i = 0; i < fil.length; i++) {

                        var rs = qr.filter(fil[i].FILTER).toArray();
                        if (rs.length > 0) {
                            return fil[i];
                        }

                    }


                }
                return null;
            }

            var processARow = function (data) {
                let r = Object.assign({}, data);



                r.MONTH_VALUE = new Date(r.IN_MONTH + '-01');

                r.BALANCE = Math.min(0, r.RECEIPT_AMOUNT - r.BILL_INVOICE);
                r.CUSTOMER_COM_AMOUNT = r.CUSTOMER_COM_RATE * r.DOANH_THU || 0;
                r.PERSON_COM_AMOUNT = r.PERSON_COM_RATE * r.DOANH_THU || 0;
                r.REVENUE_DIFFERENCE = r.REVENUE_PUBLIC - r.DOANH_THU || 0;
                //r.COMPENSATION = 0;
                r.TOTAL_DISCOUNT_COM = r.DC
                    + r.CUSTOMER_COM_AMOUNT
                    + r.PERSON_COM_AMOUNT
                    + r.REVENUE_DIFFERENCE;

                r.COMPENSATION = r.COMPENSATION || 0;
                r.COST_PROJECT = r.COST_PROJECT || 0;
                r.AFTER_DISCOUNT = (r.RECEIPT_AMOUNT < r.BILL_INVOICE ? r.RECEIPT_AMOUNT : r.BILL_INVOICE) - r.PERSON_COM_AMOUNT - r.COMPENSATION;


                r.TOTAL_DISCOUNT_COM_AMOUNT = r.REVENUE_PUBLIC - r.AFTER_DISCOUNT;
                r.TOTAL_DISCOUNT_COM_RATE = r.TOTAL_DISCOUNT_COM_AMOUNT / (r.REVENUE_PUBLIC || 1);
                r.SALE_CAL_RATE = 0;
                if (r.CUSTOMER_TYPE == 0) {
                    r.SALE_CAL_RATE = 0;
                } else if (r.CUSTOMER_TYPE == 1) {
                    if (r.SERVICE_PERIOD > 3) {
                        //r.SALE_CAL_RATE = 0.005 * Math.max(0.15 - Math.max(r.TOTAL_DISCOUNT_COM_RATE, 0), 0) /0.15;//0.5%
                        r.SALE_CAL_RATE = (0.005 / 0.15) * (0.15 - (r.TOTAL_DISCOUNT_COM_RATE > 0 ? (r.TOTAL_DISCOUNT_COM_RATE < 0.15 ? r.TOTAL_DISCOUNT_COM_RATE : 0.15) : 0));
                    } else {
                        //r.SALE_CAL_RATE = Math.max(0.15 - Math.max(r.TOTAL_DISCOUNT_COM_RATE,0), 0);
                        r.SALE_CAL_RATE = 0.15 - (r.TOTAL_DISCOUNT_COM_RATE > 0 ? (r.TOTAL_DISCOUNT_COM_RATE < 0.15 ? r.TOTAL_DISCOUNT_COM_RATE : 0.15) : 0);
                    }
                }

                r.SALE_COM_AMOUNT = r.SALE_COM_RATE * r.AFTER_DISCOUNT || 0;
                r.SALE_CAL_AMOUNT = r.SALE_CAL_RATE * r.AFTER_DISCOUNT || 0;

                r.AVERAGE_REVENUE = r.DOANH_THU / (r.NUM_PACKAGE || 1);
                r.AR_AMOUNT = r.RECEIPT_AMOUNT < r.BILL_INVOICE ? r.RECEIPT_AMOUNT : r.BILL_INVOICE;
                r.AVERAGE_REAL = r.AR_AMOUNT / (r.NUM_PACKAGE || 1);
                r.INVOICE_AMOUNT = r.INVOICE_AMOUNT > r.BILL_INVOICE ? r.BILL_INVOICE : r.INVOICE_AMOUNT;
                ///

                r.FULL_COST_PER_KG = 0;
                if (r.A_0201) {
                    r.FULL_COST_PER_KG += r.A_0201;
                }
                if (r.A_0202) {
                    r.FULL_COST_PER_KG += r.A_0202;
                }
                if (r.A_0203) {
                    r.FULL_COST_PER_KG += r.A_0203;
                }
                if (r.A_0205) {
                    r.FULL_COST_PER_KG += r.A_0205;
                }
                if (r.A_0207) {
                    r.FULL_COST_PER_KG += r.A_0207;
                }
                if (r.A_OTHER) {
                    r.FULL_COST_PER_KG += r.A_OTHER;
                }



                let SC_R = 106893;
                r.FULL_COST_PER_SHIPMENT = 0;

                r.SC_0201 = 0;
                if (r.C_0201) {
                    r.SC_0201 = r.C_0201 * SC_R;
                    r.FULL_COST_PER_SHIPMENT += r.SC_0201;

                }
                r.SC_0202 = 0;
                if (r.C_0202) {
                    r.SC_0202 = r.C_0202 * SC_R;
                    r.FULL_COST_PER_SHIPMENT += r.SC_0202;

                }
                r.SC_0203 = 0;
                if (r.C_0203) {
                    r.SC_0203 = r.C_0203 * SC_R;
                    r.FULL_COST_PER_SHIPMENT += r.SC_0203;

                }
                r.SC_0205 = 0;
                if (r.C_0205) {
                    r.SC_0205 = r.C_0205 * SC_R;
                    r.FULL_COST_PER_SHIPMENT += r.SC_0205;

                }
                r.SC_0207 = 0;
                if (r.C_0207) {
                    r.SC_0207 = r.C_0207 * SC_R;
                    r.FULL_COST_PER_SHIPMENT += r.SC_0207;

                }
                if (r.C_OTHER) {
                    r.SC_OTHER = r.C_OTHER * SC_R;
                    r.FULL_COST_PER_SHIPMENT += r.SC_OTHER;

                }





                r.COST = r.FULL_COST_PER_KG + r.COST_PROJECT;
                r.NET_PROFIT = r.AFTER_DISCOUNT - r.COST - r.SALE_CAL_AMOUNT;
                r.COMPARE_PUBLIC_COST = r.REVENUE_PUBLIC - r.COST;
                ////
                r.AR_DELAY = r.AR_DELAY || 0;
                r.AR_DELAY -= 30;
                r.AR_DELAY = r.AR_DELAY > 0 ? r.AR_DELAY : 0;


                //virtual data
                r.AR_TARGET = r.AR_AMOUNT;//() * 1000000000;
                r.CUSTOMER_KPI = 1;//Math.random();
                r.AR_ARCHIVE = r.AR_AMOUNT / (r.AR_TARGET || 1);
                //end virtual


                return r;
            }

            var processOracle = function () {
                var data = LOADED.REV;
                let incNum = 0;
                loadPanel.option("text", "Processing " + (incNum++) + " / " + data.length);
                data = data.map(r => processARow(r));
                //end process customer
                that.Component.option("dataSource", data);
                that.Component.option("columns", [

                ]);
                loadPanel.hide();
            }

            var loadOracleData = function (dat) {
                LOADED.queque = 3;
                loadPanel.show();
                //REV
                $.ajax({
                    url: getURL(
                        'api/Accounting/Report/Revenues?FROM_DATE='
                        + dat['FROM_DATE']
                        + '&TO_DATE='
                        + dat['TO_DATE']
                        + (dat['CUSTOMER_CODE'] ? '&CUSTOMER_CODE=' + dat['CUSTOMER_CODE'] : "")
                    ),
                    method: "GET",
                }).done(function (a) {
                    LOADED.queque--;
                    LOADED.REV = a;
                    if (LOADED.queque <= 0) {
                        processOracle();
                    }
                    console.log("loaded REV");
                });

                //UPL
                $.ajax({
                    url: getURL(
                        'api/Accounting/UploadCommistion'
                    ),
                    method: "GET",
                }).done(function (a) {
                    LOADED.queque--;
                    LOADED.UPL = a;
                    if (LOADED.queque <= 0) {
                        processOracle();
                    }
                    console.log("loaded UPL");
                });
                //DIS
                $.ajax({
                    url: getURL(
                        'api/Accounting/DiscountConfig'
                    ),
                    method: "GET",
                }).done(function (a) {
                    LOADED.queque--;
                    LOADED.DIS = a;
                    if (LOADED.queque <= 0) {
                        processOracle();
                    }
                    console.log("loaded DIS");
                });



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
                        //b.setHours(b.getHours() - b.getTimezoneOffset() / 60);
                        dat[i] = b.toJSON();
                    }
                    if (option.hasOwnProperty(i) && i == "TO_DATE") {
                        var b = new Date(option[i].getTime());
                        //b.setHours(b.getHours() - b.getTimezoneOffset() / 60);
                        dat[i] = b.toJSON();
                    }

                }
                // if (monthDiff(dat.FROM_DATE || new Date(), dat.TO_DATE || new Date()) > 1 && !dat.CUSTOMER_CODE) {
                //     var result = DevExpress.ui.dialog.confirm("You choice big data. It will run very long time. Continue?", "Are you sure");
                //     result.done(function (dialogResult) {
                //         if (dialogResult) {
                //             loadOracleData(dat);
                //         }
                //     });
                // }else{
                //     loadOracleData(dat);
                // }
                loadOracleData(dat);

            }

            that.filterId = $("#form").dxForm({
                visible: false,
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

            var pivotGridChart = $("#chart").dxChart({
                commonSeriesSettings: {
                    type: "bar"
                },
                tooltip: {
                    enabled: true,
                    format: "đ ###,##0",
                    customizeTooltip: function (args) {
                        return {
                            html: args.seriesName + " | Total<div class='currency'>" + args.valueText + "</div>"
                        };
                    }
                },
                size: {
                    height: 200
                },
                adaptiveLayout: {
                    width: 450
                }
            }).dxChart("instance");

            $find.dxPivotGrid({
                allowSortingBySummary: true,
                allowSorting: true,
                allowFiltering: true,
                showBorders: true,
                allowExpandAll: true,
                export: {
                    enabled: true,
                    fileName: "SalesIncentive",
                },

                dataSource: {
                    store: new DevExpress.data.CustomStore({
                        load: function (loadOptions) {
                            var deferred = $.Deferred(),
                                args = {};

                            if (loadOptions.sort) {
                                args.orderby = loadOptions.sort[0].selector;
                                if (loadOptions.sort[0].desc)
                                    args.orderby += " desc";
                            }

                            args.skip = loadOptions.skip || 0;
                            args.take = loadOptions.take || 12;

                            $.ajax({
                                url: getURL(
                                    'api/Accounting/Report/Revenues?FROM_DATE='
                                    + fromDate.toJSON()
                                    + '&TO_DATE='
                                    + toDate.toJSON()),
                                dataType: "json",
                                data: args,
                                success: function (result) {
                                    result = result.map(r => processARow(r));
                                    deferred.resolve(result, { totalCount: result.length });
                                },
                                error: function () {
                                    deferred.reject("Data Loading Error");
                                },
                                timeout: 0
                            });

                            return deferred.promise();
                        }
                    }),
                    fields: [
                        // {
                        //     dataField: "IN_MONTH",
                        //     caption: "CREATED",
                        //     area:"column"

                        // },     
                        {
                            dataField: "MONTH_VALUE",
                            area: "column",
                            dataType: "date",
                        },
                        {
                            dataField: "CUSTOMER_KPI",
                            dataType: "number",
                            format: "percent",
                            summaryType: "avg",
                            area: "data",
                            showGrandTotals: false,
                        },
                        {
                            dataField: "AR_TARGET",
                            dataType: "number",
                            format: "###,##0",
                            summaryType: "sum",
                            area: "data",
                            showGrandTotals: false,
                        },
                        {
                            dataField: "AR_AMOUNT",
                            dataType: "number",
                            format: "###,##0",
                            summaryType: "sum",
                            area: "data",
                        },
                        
                        // {
                        //     caption: "AR_AMOUNT",
                        //     dataType: "number",
                        //     format: "percent",                            
                        //     area: "data",
                        //     showGrandTotals: false,
                        //     summaryDisplayMode: "percentVariation",
                        //     calculateSummaryValue: function (summaryCell) {
                        //         // Your code goes here
                        //     }
                        // },                            
                        {
                            caption: "CUSTOMER TYPE",
                            selector: function (data) {
                                var ty = ["KA", "SME", "Other"];
                                return ty[data.CUSTOMER_TYPE];
                            },
                            area: "row",
                        },
                        {
                            dataField: "SALE_MAN",
                            area: "row",
                        },
                        {
                            dataField: "MA_KH",
                            caption: "Customer Code",
                            sortOrder: 'asc',
                            area: "filter",
                        },
                        {
                            dataField: "TEN_KH",
                            caption: "Customer Name",
                            visible: true,
                            area: "row",
                        },

                    ]
                }

            });




            that.Component = $find.dxPivotGrid("instance");
            that.Component.bindChart(pivotGridChart, {
                //putDataFieldsInto:'args',
                inverted:true,
                dataFieldsDisplayMode: "splitAxes",
                alternateDataFields: true,
                customizeChart:function(chartOption){
                    console.log(chartOption);
                    var va = chartOption.valueAxis;
                    if(va && va.length>0){
                        for(var i = 0; i<va.length; i++){
                            if(va[i].name && va[i].name.indexOf("Kpi") > -1){
                                va[i].position = "right";
                                va[i].title = "KPI";
                            }
                            if(va[i].name && va[i].name.indexOf("Ar") > -1){
                                va[i].label.visible = false;
                            }
                        }
                    }
                },
                customizeSeries: function (seriesName, seriesOptions) {
                    if (seriesName.indexOf("Ar Target") > -1) {                       
                        seriesOptions.type = "area";
                    }
                    if (seriesName.indexOf("Kpi") > -1) {                       
                        seriesOptions.type = "spline";
                    }
                }
            });

        }

        this.Init();
    }

    return SaleIncentive;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = SaleIncentive;
else
    window.Revenue = SaleIncentive;