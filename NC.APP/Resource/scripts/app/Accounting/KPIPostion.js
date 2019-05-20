"use strict";


var KPIPostion = (function () {

    var KPIPostion = function (options) {
        var options = options || {};
        this.Name = "KPIPostion";
        this.Type = "dxDataGrid";
        this.id = options.id || (this.Name + (new Date()).getTime());
        this.Component = null;
        this.permit = getACL(this.Name) || { add: false, edit: false, delete: false };
        this.Data = new NCStore({
            url: "api/Accounting/KPIPostion",
            key: "id",
            //filter: ["(username eq '" + __USERNAME__ + "' or exists(select id from nc_core_user_role where role_id eq 1 and user_id eq " + __USERID__ + "))"],
            permit: this.permit
        });
        this.Key = null;

        this.Init = function () {
            var that = this;
            var $find = $(that.id);


            if (!$find.length) {
                var scriptTag = document.scripts[document.scripts.length - 1];
                var parentTag = scriptTag.parentNode;
                $find = $("<div id='" + that.id + "'>").appendTo(parentTag);
            }
            function checkCode(e) {
                //var dat = that.Data.Store().load();
                return true;
            }

            var syncTreeViewSelection = function (treeView, value) {
                if (!value) {
                    treeView.unselectAll();
                } else {
                    treeView.selectItem(value);
                }
            };

            var filterParent = function (a, parentId) {
                var rs = [];
                var pop = [];
                pop.push(parentId);
                while (pop.length > 0) {
                    var cur = pop.shift();
                    for (var i = 0; i < a.length; i++) {
                        if (a[i].id == cur) {
                            rs.push(a[i]);
                        }
                        if (a[i].parent_id == cur) {
                            //rs.push(a[i]);
                            pop.push(a[i].id);
                        }
                    }
                }
                return rs;
            }
            // var orgchart213 = [];
            // var orgchartStore = new NCData({
            //     url:'api/core/orgchart/getOrgchartAt/213',
            //     callback:function(a){
            //         orgchart213 = a;//filterParent(a,213);
            //         that.Component.columnOption('destination', 'lookup.dataSource', orgchart213);
            //     }
            // });
            var customerCodeName = [];
            var customerStore = new NCData({
                url: 'api/master/customer',
                // options:{
                //     select:["id","_orc_partner_code","customer_name"],
                // },
                callback: function (a) {
                    for (var i = 0; i < a.length; i++) {
                        a[i].code_name = "[" + a[i]._orc_partner_code + "] " + a[i].customer_name;
                    }
                    //mixStore.push(a);
                    //customerCodeName = a;
                    findUpdateDataSource("MA_KH", a);
                }
            });
            var serviceStore = new NCData({
                url: 'api/master/service',
                callback: function (a) {
                    for (var i = 0; i < a.length; i++) {
                        a[i].code_name = "[" + a[i].service_code + "] " + a[i].service_name;
                    }
                    findUpdateDataSource("service", a);
                }
            });
            var provinceStore = new NCData({
                url: 'api/master/province',
                callback: function (a) {
                    for (var i = 0; i < a.length; i++) {
                        a[i].code_name = "[" + a[i].province_code + "] " + a[i].province_name;
                    }
                    findUpdateDataSource("sender_province", a);
                    findUpdateDataSource("receiver_province", a);
                }
            });
            // var districtStore = new NCData({
            //     url:'api/master/district',
            //     callback:function(a){
            //         for(var i =0; i<a.length;i++){
            //             a[i].code_name = "["+a[i]._orc_code + "] "+a[i].district_name;
            //         }
            //         findUpdateDataSource("sender_district",a);
            //         findUpdateDataSource("receiver_district",a);
            //     }
            // });
            // var wardStore = new NCData({
            //     url:'api/master/ward',
            //     callback:function(a){
            //         for(var i =0; i<a.length;i++){
            //             a[i].code_name = "["+a[i].Id + "] "+a[i].ten_xa;
            //         }
            //         findUpdateDataSource("sender_ward",a);
            //         findUpdateDataSource("receiver_ward",a);
            //     }
            // });

            // var paymentStore = {data:[
            //     {id:'NG',Name:'Người gửi thanh toán'},
            //     {id:'NN',Name:'Người nhận thanh toán'},
            // ]};

            // var mixStore = new DevExpress.data.AspNet.createStore({
            //     key: "code",
            //     loadUrl: getURL('api/Accounting/DiscountConfig/CustomerAndUser'),
            //     onBeforeSend: function (method, ajaxOptions) {
            //         //ajaxOptions.xhrFields = { withCredentials: true };
            //         if (ajaxOptions.data.filter) {
            //             ajaxOptions.data.filterx = SqlBuilder(JSON.parse(ajaxOptions.data.filter));
            //         }

            //     }
            // });

            var mixStore = new NCData({
                url: 'api/Accounting/DiscountConfig/CustomerAndUser',
                callback: function (a) {
                    // for (var i = 0; i < a.length; i++) {
                    //     a[i].code_name = "[" + a[i].service_code + "] " + a[i].service_name;
                    // }
                    //findUpdateDataSource("service", a);
                    that.Component.columnOption("target", "lookup.dataSource", a);
                }
            });

            // var userStore = new NCData({
            //     url: 'api/core/user?$select=username,lastname,firstname',
            //     callback: function (a) {
            //         for (var i = 0; i < a.length; i++) {
            //             a[i].code = a[i].username;
            //             a[i].code_name = "[" + a[i].username + "] " + a[i].lastname + " " + a[i].firstname;
            //         }
            //         //that.Component.columnOption('username', 'lookup.dataSource', a);
            //         mixStore.push(a);
            //     }
            // });

            var findUpdateDataSource = function (field, dat) {
                for (var i = 0; i < Columns.length; i++) {
                    var tmp = Columns[i] || {};
                    if (tmp.dataField == field) {
                        tmp.lookup.dataSource = dat;
                        break;
                    }
                }
            };
            var getTypeField = function (field) {
                for (var i = 0; i < Columns.length; i++) {
                    var tmp = Columns[i] || {};
                    if (tmp.dataField == field) {
                        if (tmp.dataType)
                            return tmp.dataType;
                        return "String";
                    }
                }
                if (typeof field === 'string' || field instanceof String)
                    return "String";
                if (typeof field === 'number')
                    return "Number";
                if (field instanceof Date)
                    return "Date";
                if (typeof field === 'boolean')
                    return "boolean";
                return "Object";
            }
            var Columns = [
                {
                    dataField: "MA_KH",
                    caption: "Customer",
                    lookup: {
                        dataSource: customerStore.data || [],
                        valueExpr: "_orc_partner_code",
                        displayExpr: "code_name",
                    },
                    editorTemplate: function (info, cont) {
                        var div = $("<div>").dxAutocomplete({
                            dataSource: customerStore.data || [],
                            onValueChanged: function (data) {
                                info.setValue(data.value);
                            },
                            itemTemplate: function (data) {
                                return $("<div>[" + data._orc_partner_code +
                                    "] " + data.customer_name + "</div>");
                            },
                            valueExpr: "_orc_partner_code",
                            width: 250,
                            value: info.value,
                            searchExpr: ["code_name"],
                        });
                        cont.append(div);
                    }
                },
                {
                    dataField: "JOIN_DATE",
                    dataType: "date",
                    format: "dd/MM/yyyy",
                },
                {
                    dataField: "SERVICE_PERIOD",
                    dataType: "number",
                    format: "##0",
                },
                {
                    dataField: "IN_MONTH",
                    dataType: "string",
                    caption: "CREATED",
                },
                {
                    dataField: "NUM_PACKAGE",
                    //caption:"CREATED"  ,
                    dataType: "number",
                    format: "##0"
                },
                {
                    dataField: "DOANH_THU",
                    caption: "REVENUE",
                    dataType: "number",
                    format: "###,##0"
                },
                {
                    dataField: "DC",
                    caption: "DISCOUNT",
                    dataType: "number",
                    format: "###,##0"
                },
                {
                    dataField: "AFTER_DISCOUNT",
                    //caption:"DISCOUNT"  ,
                    dataType: "number",
                    format: "###,##0"
                },
                {
                    dataField: "BILL_INVOICE",
                    //caption:"DISCOUNT"  ,
                    dataType: "number",
                    format: "###,##0"
                },
                {
                    dataField: "INVOICE_AMOUNT",
                    //caption:"DISCOUNT"  ,
                    dataType: "number",
                    format: "###,##0"
                },
                {
                    dataField: "RECEIPT_AMOUNT",
                    //caption:"DISCOUNT"  ,
                    dataType: "number",
                    format: "###,##0"
                },
                {
                    dataField: "BALANCE",
                    //caption:"DISCOUNT"  ,
                    dataType: "number",
                    format: "###,##0"
                },
                {
                    dataField: "ALL_BALANCE",
                    //caption:"DISCOUNT"  ,
                    dataType: "number",
                    format: "###,##0"
                },

            ];
            var FilterId;
            var FilterValue = [];
            var SqlBuilder = function (a, type = "Object") {
                if (a == null)
                    return null;
                if (Array.isArray(a) && a.length == 3) {
                    var type = getTypeField(a[0]);

                    if (a[1] == "anyof") {
                        return "(" + SqlBuilder(a[0]) + " in (" + a[2].join(',') + "))";
                    }
                    if (a[1] == "between") {
                        return "(" + SqlBuilder(a[0]) + " BETWEEN " + a[2].map(
                            x => ((x.getTime) || (/[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z/.test(x))) ? "convert(datetime,''" + x.toJSON() + "'',127')" : x
                        ).join(' AND ') + ")";
                    }
                    if (a[1] == 'contains') {
                        return "(" + SqlBuilder(a[0]) + " like N''%" + SqlBuilder(a[2]) + "%'')";
                    }
                    if (a[1] == 'notcontains') {
                        return " not (" + SqlBuilder(a[0]) + " like N''%" + SqlBuilder(a[2]) + "%'')";
                    }
                    if (a[1] == 'startswith') {
                        return " (" + SqlBuilder(a[0]) + " like N''" + SqlBuilder(a[2]) + "%'')";
                    }
                    if (a[1] == 'endswith') {
                        return " not (" + SqlBuilder(a[0]) + " like N''%" + SqlBuilder(a[2]) + "'')";
                    }
                    if (a[1] == 'startswith') {
                        return " (" + SqlBuilder(a[0]) + " like N''" + SqlBuilder(a[2]) + "%'')";
                    }


                    return "(" + SqlBuilder(a[0]) + " " + a[1] + " " + SqlBuilder(a[2], type) + ")";
                }

                if (Array.isArray(a) && a.length > 3) {
                    var rs = "";
                    for (var i = 0; i < a.length; i++) {
                        rs = rs + " " + SqlBuilder(a[i]);
                    }
                    return "(" + rs + ")";
                }
                if (Array.isArray(a) && a.length == 1) {
                    return SqlBuilder(a[0]);
                }

                if (type == "String") {
                    return "N''" + a + "''";
                }
                if (type == "Date" || type == "DateTime") {
                    var b = new Date(a.getTime());
                    b.setHours(b.getHours() - b.getTimezoneOffset() / 60);
                    return "convert(datetime,''" + b.toJSON() + "'',127)";
                }


                if (a.getTime) {
                    var b = new Date(a.getTime());
                    b.setHours(b.getHours() - b.getTimezoneOffset() / 60);
                    return "convert(datetime,''" + b.toJSON() + "'',127)";
                }

                if (/[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z/.test(a)) {
                    return "convert(datetime,''" + a + "'',127)";
                }

                return "" + a;

            }

            $find.dxDataGrid({
                stateStoring: {
                    enabled: true,
                    type: "localStorage",
                    storageKey: that.Name,
                },
                paging: {
                    pageSize: 50
                },
                pager: {
                    showPageSizeSelector: true,
                    allowedPageSizes: [10, 20, 50, 100, 200],
                    showInfo: true
                },
                dataSource: that.Data.Store(),
                export:{
                    allowExportSelectedData: true,
                    enabled: true,
                    fileName: "KPIPostion"
                },
                editing: {
                    mode: "form",
                    allowUpdating: that.permit.edit || false,
                    allowDeleting: that.permit.delete || false,
                    allowAdding: that.permit.add || false,                    
                },
                selection: {
                    mode: "single"
                },
                searchPanel: {
                    visible: true,
                    placeholder: "Search..."
                },
                headerFilter: {
                    visible: true
                },
                showRowLines: true,
                showBorders: true,
                onSelectionChanged: function (e) {
                    that.Key = e.currentSelectedRowKeys[0];

                },
                onRowInserted:function(e){
                    $.ajax({
                        type: "POST",
                        url: getURL("api/Accounting/KPISetting/update_kpi"),                        
                        success: function (result) {                                                        
                        },
                    });
                },
                onRowUpdated:function(e){
                    $.ajax({
                        type: "POST",
                        url: getURL("api/Accounting/KPISetting/update_kpi"),                        
                        success: function (result) {                                                        
                        },
                    });
                },
                columns: [
                    {
                        dataField: "id",                        
                        formItem: {
                            visible: false
                        }
                    },
                    {
                        dataField: "name",
                    },
                    {
                        dataField: "description",
                    },
                    {
                        dataField: "default",
                        dataType: "number",
                        editorOptions: {
                            format: "###,##0",
                        },
                        format: "###,##0",                        
                    },
                    {
                        dataField: "_active",
                        dataType:"boolean"
                    },
                ],                

            });

            that.Component = $find.dxDataGrid("instance");

        }

        this.Init();
    }

    return KPIPostion;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = KPIPostion;
else
    window.KPIPostion = KPIPostion;