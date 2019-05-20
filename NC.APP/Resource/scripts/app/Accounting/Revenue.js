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
                        && x.user_approve!=null
                        && (!x.from_date || (x.from_date && new Date(x.from_date) <= new Date()))
                        && (!x.to_date || (x.to_date && new Date(x.to_date) >= new Date()))
                        && x.type_rule == type
                    ).map((x) => {
                        //x.period = x.period ? x.period : -9999;
                        //x.FILTER = JSON.parse(x.filter_dx) || ['1', '=', '0'];
                        return Object.assign(x,{period : x.period ? x.period : -9999,
                            FILTER : JSON.parse(x.filter_dx) || ['1', '=', '0']});
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

            var processARow = function (data){
                let r= Object.assign({},data);
                
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
                r.AFTER_DISCOUNT = (r.RECEIPT_AMOUNT < r.BILL_INVOICE ? r.RECEIPT_AMOUNT : r.BILL_INVOICE) -r.PERSON_COM_AMOUNT - r.COMPENSATION ;                
                
                
                r.TOTAL_DISCOUNT_COM_AMOUNT  = r.REVENUE_PUBLIC - r.AFTER_DISCOUNT;
                r.TOTAL_DISCOUNT_COM_RATE = r.TOTAL_DISCOUNT_COM_AMOUNT/( r.REVENUE_PUBLIC ||1);
                r.SALE_CAL_RATE = 0;
                if(r.CUSTOMER_TYPE==0){
                    r.SALE_CAL_RATE = 0;
                }else if(r.CUSTOMER_TYPE==1){
                    if(r.SERVICE_PERIOD>3){
                        //r.SALE_CAL_RATE = 0.005 * Math.max(0.15 - Math.max(r.TOTAL_DISCOUNT_COM_RATE, 0), 0) /0.15;//0.5%
                        r.SALE_CAL_RATE = (0.005/0.15)*(0.15-(r.TOTAL_DISCOUNT_COM_RATE>0?(r.TOTAL_DISCOUNT_COM_RATE<0.15?r.TOTAL_DISCOUNT_COM_RATE:0.15):0));
                    }else{
                        //r.SALE_CAL_RATE = Math.max(0.15 - Math.max(r.TOTAL_DISCOUNT_COM_RATE,0), 0);
                        r.SALE_CAL_RATE = 0.15-(r.TOTAL_DISCOUNT_COM_RATE>0?(r.TOTAL_DISCOUNT_COM_RATE<0.15?r.TOTAL_DISCOUNT_COM_RATE:0.15):0);
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
                if(r.A_0201){
                    r.FULL_COST_PER_KG += r.A_0201;
                }
                if(r.A_0202){
                    r.FULL_COST_PER_KG += r.A_0202;
                }
                if(r.A_0203){
                    r.FULL_COST_PER_KG += r.A_0203;
                }
                if(r.A_0205){
                    r.FULL_COST_PER_KG += r.A_0205;
                }
                if(r.A_0207){
                    r.FULL_COST_PER_KG += r.A_0207;
                }
                if(r.A_OTHER){
                    r.FULL_COST_PER_KG += r.A_OTHER;
                }
                

                
                let SC_R = 106893;
                r.FULL_COST_PER_SHIPMENT = 0;
                
                r.SC_0201 = 0;
                if(r.C_0201){ 
                    r.SC_0201 =  r.C_0201 * SC_R;                  
                    r.FULL_COST_PER_SHIPMENT += r.SC_0201;
                    
                }
                r.SC_0202 = 0;
                if(r.C_0202){ 
                    r.SC_0202 =  r.C_0202 * SC_R;                  
                    r.FULL_COST_PER_SHIPMENT += r.SC_0202;
                    
                }
                r.SC_0203 = 0;
                if(r.C_0203){ 
                    r.SC_0203 =  r.C_0203 * SC_R;                  
                    r.FULL_COST_PER_SHIPMENT += r.SC_0203;
                    
                }
                r.SC_0205 = 0;
                if(r.C_0205){ 
                    r.SC_0205 =  r.C_0205 * SC_R;                  
                    r.FULL_COST_PER_SHIPMENT += r.SC_0205;
                    
                }
                r.SC_0207 = 0;
                if(r.C_0207){ 
                    r.SC_0207 =  r.C_0207 * SC_R;                  
                    r.FULL_COST_PER_SHIPMENT += r.SC_0207;
                    
                }
                if(r.C_OTHER){ 
                    r.SC_OTHER =  r.C_OTHER * SC_R;                  
                    r.FULL_COST_PER_SHIPMENT += r.SC_OTHER;
                    
                }

                
                

                
                r.COST = r.FULL_COST_PER_KG + r.COST_PROJECT;
                r.NET_PROFIT = r.AFTER_DISCOUNT - r.COST - r.SALE_CAL_AMOUNT;
                r.COMPARE_PUBLIC_COST = r.REVENUE_PUBLIC - r.COST;
                ////
                r.AR_DELAY = r.AR_DELAY || 0;
                r.AR_DELAY -= 30;
                r.AR_DELAY = r.AR_DELAY>0?r.AR_DELAY:0;

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
                    {
                        dataField: "MA_KH",
                        caption: "Customer Code",
                        sortOrder: 'asc',
                        allowEditing: false,
                    },
                    {
                        dataField: "TEN_KH",
                        caption: "Customer Name",
                        allowEditing: false,
                    },
                    {
                        dataField: "CUSTOMER_TYPE",
                        //caption: "Customer Name",
                        lookup:{
                            dataSource:[
                                {id:0,name:"KA"},{id:1,name:"SME"},{id:2,name:""}
                            ],
                            valueExpr:"id",
                            displayExpr:"name"
                        },
                        allowEditing: false,
                    },
                    {
                        dataField: "JOIN_DATE",
                        dataType: 'date',
                        format: 'dd/MM/yyyy',
                        allowEditing: false,
                    },
                    {
                        dataField: "SERVICE_PERIOD",
                        dataType: "number",
                        format: "#",
                        allowEditing: false,
                    },
                    {
                        dataField: "IN_MONTH",
                        caption: "CREATED",
                        sortOrder: 'asc',
                        allowEditing: false,
                    },
                    {
                        dataField: "NUM_PACKAGE",
                        caption:"Number of shipment"  ,
                        dataType: "number",
                        format: "#",
                        allowEditing: false,
                    },
                    {
                        dataField: "DOANH_THU",
                        caption: "REVENUE",
                        dataType: "number",
                        format: "###,##0",
                        allowEditing: false,
                    },
                    {
                        dataField: "REVENUE_PUBLIC",
                        caption:"Public Rate Revenue (VND)"  ,
                        dataType: "number",
                        format: "###,##0",
                        allowEditing: false,
                    },                    
                    {
                        dataField: "BILL_INVOICE",
                        //caption:"DISCOUNT"  ,
                        dataType: "number",
                        format: "###,##0",
                        allowEditing: false,
                    },
                    {
                        dataField: "INVOICE_AMOUNT",
                        //caption:"DISCOUNT"  ,
                        dataType: "number",
                        format: "###,##0",
                        allowEditing: false,
                    },
                    {
                        dataField: "AR_AMOUNT",
                        //caption:"DISCOUNT"  ,
                        dataType: "number",
                        format: "###,##0",
                        allowEditing: false,
                    },
                    {
                        dataField: "BALANCE",
                        //caption:"DISCOUNT"  ,
                        dataType: "number",
                        format: "###,##0",
                        allowEditing: false,
                    },
                    {
                        caption:"CREDIT",
                        columns:[
                            {
                                dataField:"INVOICE_DATE",
                                dataType:"date",
                                format:"yyyy-MM-dd",
                                allowEditing: false,
                            },
                            {
                                dataField:"PAYMENT_DATE",
                                caption:"AR DATE",
                                dataType:"date",
                                format:"yyyy-MM-dd",
                                allowEditing: false,
                            },
                            {
                                dataField:"AR_DELAY",
                                dataType:"number",
                                format:"###,##0",
                                allowEditing: false,
                            }
                        ]
                    },
                    {
                        caption:"DISCOUNT CACULATION",
                        columns:[
                            {
                                dataField: "DC",
                                caption: "Customer Discount (VND)",
                                dataType: "number",
                                format: "###,##0",
                                allowEditing: false,
                            },
                            {
                                dataField: "CUSTOMER_COM_RATE",
                                caption:"Customer Commission Rate"  ,
                                dataType: "number",
                                format: "##0%",
                                allowEditing: false,
                                visible:false
                            },   
                            {
                                dataField: "CUSTOMER_COM_AMOUNT",
                                caption: "Customer Commission",
                                dataType: "number",
                                format: "###,##0",
                                allowEditing: false,
                                visible:false
                            },
                            {
                                dataField: "PERSON_COM_RATE",
                                caption:"Person Commission Rate"  ,
                                dataType: "number",
                                format: "##0%",
                                allowEditing: false,
                            },   
                            {
                                dataField: "PERSON_COM_AMOUNT",
                                caption: "Person Commission",
                                dataType: "number",
                                format: "###,##0",
                                allowEditing: false,
                            },
                            {
                                dataField: "REVENUE_DIFFERENCE",
                                caption:"Difference (VND)"  ,
                                dataType: "number",
                                format: "###,##0",
                                allowEditing: false,
                                //cssClass:"bg-warning"
                            },
                            {
                                dataField: "TOTAL_DISCOUNT_COM",
                                cssClass:"bg-warning",
                                caption: "Total Discount (VND)",
                                dataType: "number",
                                format: "###,##0",
                                allowEditing: false,
                            }
                        ]
                    }, 
                    {
                        caption:"COST",
                        cssClass:"bg-red",
                        columns:[
                            {
                                dataField: "COST_PROJECT",
                                caption:"PROJECT COST"  ,
                                dataType: "number",
                                format: "###,##0" ,
                                allowEditing: true,
                                setCellValue: function(newData, value, currentRowData) {
                                    let tmp = Object.assign(currentRowData,{COST_PROJECT:value}) ;
                                    newData = Object.assign(newData,processARow(tmp));
                                }
                            },
                            {
                                caption:"Kg By Service",
                                columns:[
                                    {
                                        dataField:"A_0201",
                                        caption:"Express",
                                        dataType: "number",
                                        format: "###,##0" ,
                                        allowEditing: false,
                                    },
                                    {
                                        dataField:"A_0202",
                                        caption:"48H",
                                        dataType: "number",
                                        format: "###,##0" ,
                                        allowEditing: false,
                                    },
                                    {
                                        dataField:"A_0203",
                                        caption:"Urgent",
                                        dataType: "number",
                                        format: "###,##0" ,
                                        allowEditing: false,
                                    },
                                    {
                                        dataField:"A_0205",
                                        caption:"Road",
                                        dataType: "number",
                                        format: "###,##0" ,
                                        allowEditing: false,
                                    },
                                    {
                                        dataField:"A_0207",
                                        caption:"FCL",
                                        dataType: "number",
                                        format: "###,##0" ,
                                        allowEditing: false,
                                    }   ,
                                    {
                                        dataField:"A_OTHER",
                                        caption:"OTHER",
                                        dataType: "number",
                                        format: "###,##0" ,
                                        allowEditing: false,
                                    }                                     
                                ]
                            },
                            {
                                dataField: "FULL_COST_PER_KG",
                                caption: "KG COST",
                                dataType: "number",
                                format: "###,##0",
                                allowEditing: false,
                            },
                            {
                                caption:"Shipment By Service",
                                columns:[
                                    {
                                        dataField:"SC_0201",
                                        caption:"Express",
                                        dataType: "number",
                                        format: "###,##0" ,
                                        allowEditing: false,
                                    },
                                    {
                                        dataField:"SC_0202",
                                        caption:"48H",
                                        dataType: "number",
                                        format: "###,##0" ,
                                        allowEditing: false,
                                    },
                                    {
                                        dataField:"SC_0203",
                                        caption:"Urgent",
                                        dataType: "number",
                                        format: "###,##0" ,
                                        allowEditing: false,
                                    },
                                    {
                                        dataField:"SC_0205",
                                        caption:"Road",
                                        dataType: "number",
                                        format: "###,##0" ,
                                        allowEditing: false,
                                    },
                                    {
                                        dataField:"SC_0207",
                                        caption:"FCL",
                                        dataType: "number",
                                        format: "###,##0" ,
                                        allowEditing: false,
                                    },
                                    {
                                        dataField:"SC_OTHER",
                                        caption:"OTHER",
                                        dataType: "number",
                                        format: "###,##0" ,
                                        allowEditing: false,
                                    }                                      
                                ]
                            },
                            {
                                dataField: "FULL_COST_PER_SHIPMENT",
                                caption: "SHIPMENT COST",
                                dataType: "number",
                                format: "###,##0",
                                allowEditing: false,
                            },
                            
                            {
                                dataField: "COMPENSATION",
                                //caption:"DISCOUNT"  ,
                                dataType: "number",
                                format: "###,##0" ,
                                allowEditing: true,
                                setCellValue: function(newData, value, currentRowData) {
                                    let tmp = Object.assign(currentRowData,{COMPENSATION:value}) ;
                                    newData = Object.assign(newData,processARow(tmp));
                                }
                            },
                            {
                                dataField: "COST",
                                caption: "TOTAL COST",
                                dataType: "number",
                                format: "###,##0",
                                allowEditing: false,
                            },
                            {
                                dataField: "NET_PROFIT",
                                //caption: "Person Commission",
                                dataType: "number",
                                format: "###,##0",
                                allowEditing: false,
                            },
                            {
                                dataField: "COMPARE_PUBLIC_COST",
                                caption: "PUBLIC - COST",
                                dataType: "number",
                                format: "###,##0",
                                allowEditing: false,
                            },
                        ]
                    },                   
                    {
                        cssClass:"bg-gray",
                        caption:"INCENTIVE CACULATION",
                        columns:[
                                                      
                            {
                                dataField: "AFTER_DISCOUNT",
                                caption:"AFTER DISCOUNT"  ,
                                dataType: "number",
                                format: "###,##0",
                                allowEditing: false,
                            },  
                            {
                                dataField: "TOTAL_DISCOUNT_COM_RATE",
                                caption:"Total Discount Rate"  ,
                                dataType: "number",
                                format: "##0%",
                                allowEditing: false,
                            },  
                            {
                                dataField: "SALE_COM_RATE",
                                caption:"Sale Rate"  ,
                                dataType: "number",
                                format: "##0%",
                                allowEditing: false,
                            },   
                            {
                                dataField: "SALE_COM_AMOUNT",
                                caption:"Sale Amount"  ,
                                dataType: "number",
                                format: "###,##0",
                                allowEditing: false,
                            },   
                            {
                                dataField: "SALE_CAL_RATE",
                                caption:"Incentive Rate"  ,
                                dataType: "number",
                                format: "##0%",
                                allowEditing: false,
                            },  
                            {
                                dataField: "SALE_CAL_AMOUNT",
                                caption:"Incentive Amount"  ,
                                dataType: "number",
                                format: "###,##0",
                                allowEditing: false,
                            },   
                            {
                                dataField: "SALE_COM_TARGET",
                                caption: "Sale Code",
                                allowEditing: false,
                                //dataType: "number",
                                //format: "###,##0"
                            },  
                            {
                                dataField: "SALE_MAN",
                                //caption: "Sale Code",
                                allowEditing: false,
                                //dataType: "number",
                                //format: "###,##0"
                            },                      
                        ]
                    },
                    
                    // {
                    //     caption: "SYSTEM CACULATION COMMISTION",
                    //     columns: [
                    //         {
                    //             dataField: "CUSTOMER_COM_RATE",
                    //             caption: "Customer Rate",
                    //             dataType: "number",
                    //             format: "##0%"
                    //         },
                            
                    //         {
                    //             dataField: "CUSTOMER_COM_TARGET",
                    //             caption: "Customer Receiver",
                    //             //dataType: "number",
                    //             //format: "###,##0"
                    //         },
                    //         {
                    //             dataField: "PERSON_COM_RATE",
                    //             caption: "Person Rate",
                    //             dataType: "number",
                    //             format: "##0%"
                    //         },
                            
                    //         {
                    //             dataField: "PERSON_COM_TARGET",
                    //             caption: "Person Receiver",
                    //             //dataType: "number",
                    //             //format: "###,##0"
                    //         },
                    //         {
                    //             dataField: "SALE_COM_RATE",
                    //             caption: "SALE Rate",
                    //             dataType: "number",
                    //             format: "##0%"
                    //         },
                    //         {
                    //             dataField: "SALE_COM_AMOUNT",
                    //             caption: "Sale Amount",
                    //             dataType: "number",
                    //             format: "###,##0"
                    //         },
                    //         {
                    //             dataField: "SALE_COM_TARGET",
                    //             caption: "Staff Code",
                    //             //dataType: "number",
                    //             //format: "###,##0"
                    //         },
                    //     ]
                    // },
                    {
                        caption: "ACTUALLY ACCOUNTING COMMISTION",
                        cssClass:"bg-success",
                        columns: [
                            {
                                dataField: "ACT_CUSTOMER_COM_RATE",
                                caption: "Customer Rate",
                                dataType: "number",
                                format: "##0%",
                                cssClass:"bg-success",
                                allowEditing: false,
                            },
                            {
                                dataField: "ACT_CUSTOMER_COM_AMOUNT",
                                caption: "Customer Amount",
                                dataType: "number",
                                format: "###,##0",
                                cssClass:"bg-success",
                                allowEditing: false,
                            },
                            {
                                dataField: "ACT_CUSTOMER_COM_TARGET",
                                caption: "Customer Receiver",
                                //dataType: "number",
                                //format: "###,##0"
                                cssClass:"bg-success",
                                allowEditing: false,
                            },
                            {
                                dataField: "ACT_SALE_COM_RATE",
                                caption: "SALE Rate",
                                dataType: "number",
                                format: "##0%",
                                cssClass:"bg-success",
                                allowEditing: false,
                            },
                            {
                                dataField: "ACT_SALE_COM_AMOUNT",
                                caption: "Sale Amount",
                                dataType: "number",
                                format: "###,##0",
                                cssClass:"bg-success",
                                allowEditing: false,
                            },
                            {
                                dataField: "ACT_SALE_COM_TARGET",
                                caption: "Staff Code",
                                //dataType: "number",
                                //format: "###,##0"
                                cssClass:"bg-success",
                                allowEditing: false,
                            },
                        ]
                    },
                    //{
                    //    caption: "TOTAL",
                    //    columns: [
                    //        {
                    //            dataField: "TOTAL_COM",
                    //            caption: "System Commistion",
                    //            dataType: "number",
                    //            format: "###,##0"
                    //        },
                    //        {
                    //            dataField: "ACT_TOTAL_COM",
                    //            caption: "Actually Commistion",
                    //            dataType: "number",
                    //            format: "###,##0"
                    //        }
                    //    ]
                    //},
                    {
                        caption: "AVERAGE",
                        columns: [
                            {
                                dataField: "AVERAGE_REVENUE",
                                caption: "Total Rev (+VAT) / Number of shipment",
                                dataType: "number",
                                format: "###,##0",
                                allowEditing: false,
                            },
                            {
                                dataField: "AVERAGE_REAL",
                                caption: "AR amount / Number of shipment",
                                dataType: "number",
                                format: "###,##0",
                                allowEditing: false,
                            }
                        ]
                    }
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
                editing: {
                    mode: "cell",
                    allowUpdating: true
                },
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
                // masterDetail: {
                //     enabled: true,
                //     template: function (container, options) {
                //         var currentEmployeeData = options.data;

                //         $("<div>")
                //             .addClass("master-detail-caption")
                //             .text(currentEmployeeData.MA_KH + " " + currentEmployeeData.TEN_KH + "'s Invoice:")
                //             .appendTo(container);

                //         $("<div>")
                //             .dxDataGrid({
                //                 columnAutoWidth: true,
                //                 showRowLines: true,
                //                 showBorders: true,
                //                 columns: [
                //                     {
                //                         dataField: "SO_HD",
                //                         caption: "INVOICE NO."
                //                     },
                //                     {
                //                         dataField: "INVOICE_DATE",
                //                         dataType: "date",
                //                         format: "dd/MM/yyyy"
                //                     },
                //                     {
                //                         dataField: "INVOICE_AMOUNT",
                //                         dataType: "number",
                //                         format: "###,##0"
                //                     },
                //                     {
                //                         dataField: "RECEIPT_AMOUNT",
                //                         dataType: "number",
                //                         format: "###,##0"
                //                     },
                //                     {
                //                         dataField: "PAYMENT_DATE",
                //                         dataType: "date",
                //                         format: "dd/MM/yyyy"
                //                     },
                //                     {
                //                         caption: "NOT PAYMENT",
                //                         dataType: "number",
                //                         format: "###,##0",
                //                         calculateCellValue: function (rowData) {
                //                             return rowData.INVOICE_AMOUNT - rowData.RECEIPT_AMOUNT;
                //                         }
                //                     }],
                //                 dataSource: currentEmployeeData.INVOICE_LIST
                //             }).appendTo(container);
                //     }
                // }

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
                //         format: "###,##0"
                //     },
                //     {
                //         dataField: "BILLS_IN_MONTH_AD_TO_INVOICE",
                //         dataType: "number",
                //         format: "###,##0"
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