"use strict";


var DiscountConfig = (function () {

    var DiscountConfig = function (options) {
        var options = options || {};
        this.Name = "DiscountConfig";
        this.Type = "dxDataGrid";
        this.id = options.id || (this.Name + (new Date()).getTime());
        this.Component = null;
        this.permit = getACL(this.Name) || { add: false, edit: false, delete: false };
        this.Data = new NCStore({
            url: "api/Accounting/DiscountConfig",
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
                editing: {
                    mode: "form",
                    allowUpdating: that.permit.edit || false,
                    allowDeleting: that.permit.delete || false,
                    allowAdding: that.permit.add || false,
                    form: {
                        items: [
                            {
                                itemType: "group",
                                items: [
                                    {
                                        itemType: "tabbed",
                                        tabPanelOptions: {
                                            deferRendering: false
                                        },
                                        tabs: [{
                                            title: "Infomation",
                                            //colCount:2,
                                            items: [
                                                "type_rule",
                                                "depcription",
                                                "rate",
                                                "target",
                                                "from_date",
                                                "to_date",
                                                "period",
                                                "_active"
                                            ]
                                        }],
                                    },

                                ]
                            },
                            {
                                itemType: "group",
                                items: [
                                    {
                                        itemType: "tabbed",
                                        tabPanelOptions: {
                                            deferRendering: false
                                        },
                                        tabs: [
                                            {
                                                title: "Dx",
                                                items: [
                                                    {
                                                        dataField: "filter_dx",
                                                        label: {
                                                            visible: false,
                                                        }
                                                    }
                                                ]
                                            },
                                            {
                                                title: "Custom Rate",
                                                items: [
                                                    {
                                                        dataField: "custom_result",
                                                        label: {
                                                            visible: false,
                                                        },
                                                    }
                                                ]
                                            },
                                            {
                                                title: "Sql",
                                                items: [
                                                    {
                                                        dataField: "filter_sql",
                                                        label: {
                                                            visible: false,
                                                        },
                                                    }
                                                ]
                                            }
                                        ],

                                    }
                                ]
                            },
                        ]

                    }
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
                columns: [
                    {
                        dataField: "id",
                        visible: false,
                        formItem: {
                            visible: false
                        }
                    },
                    {
                        dataField: "depcription",
                    },
                    {
                        dataField: "type_rule",
                        lookup: {
                            dataSource: [
                                {
                                    id: 0,
                                    name: "Customer Discount"
                                },
                                {
                                    id: 1,
                                    name: "Customer Commission"
                                },
                                {
                                    id: 2,
                                    name: "Employee Commission"
                                }
                            ],
                            valueExpr: "id",
                            displayExpr: "name",
                        },
                        validationRules: [{
                            type: "required"
                        }],
                        groupIndex: 1,
                    },

                    {
                        dataField: "target",
                        validationRules: [{
                            type: "required"
                        }],
                        lookup: {
                            dataSource: mixStore.data || [],
                            valueExpr: "code",
                            displayExpr: "code_name",
                        },
                        editorTemplate: function (info, cont) {
                            var div = $("<div>").dxSelectBox({
                                dataSource: mixStore.data || [],
                                onValueChanged: function (data) {
                                    info.setValue(data.value);
                                },
                                valueExpr: "code",
                                displayExpr: "code_name",
                                value: info.value,
                                searchExpr: ["code_name"],
                                minSearchLength: 3,
                            });
                            cont.append(div);
                        },
                        groupIndex: 0,
                    },
                    {
                        dataField: "rate",
                        dataType: "number",
                        format: "#0%",
                        validationRules: [{
                            type: "required"
                        }],
                    },
                    {
                        dataField: "from_date",
                        dataType: "date",
                        format: "dd/MM/yyyy"
                    },
                    {
                        dataField: "to_date",
                        dataType: "date",
                        format: "dd/MM/yyyy"
                    },
                    {
                        dataField: "period",
                        dataType: "number",
                    },
                    {
                        dataField: "_active",
                        caption: "Active",
                        dataType: "boolean",
                        visible: false,
                        // formItem: {
                        //     visible: false,
                        // },
                        //width:"75px",
                    },
                    {
                        dataField: "filter_dx",
                        caption: "condition",
                        //visible: false,
                        editCellTemplate: function (cellElement, cellInfo) {
                            var div = document.createElement("div");
                            cellElement.get(0).appendChild(div);

                            FilterValue = [];
                            if (typeof cellInfo.value === 'string' && cellInfo.value.length > 0) {
                                FilterValue = JSON.parse(cellInfo.value);
                            } else {
                                FilterValue = cellInfo.value
                            }
                            FilterId = $(div).dxFilterBuilder({
                                //height: 150,
                                elementAttr: { style: "min-height:340px" },
                                allowHierarchicalFields: true,
                                value: FilterValue,
                                fields: Columns,
                                onValueChanged: function (e) {
                                    if (e.value) {
                                        cellInfo.setValue(JSON.stringify(e.value));
                                        FilterValue = e.value;
                                        //strSql = dynamicItemFilter(   SqlBuilder(e.value.slice(0),cColumn));  

                                    } else {
                                        cellInfo.setValue(null);

                                        //strSql = null;
                                    }
                                },


                            }).dxFilterBuilder("instance");
                        },
                    },
                    {
                        dataField: "filter_sql",
                        visible: false,
                        editCellTemplate: function (cellElement, cellInfo) {
                            var div = document.createElement("div");
                            cellElement.get(0).appendChild(div);
                            $(div).dxTextArea({
                                value: cellInfo.value,
                                minHeight: 340,
                                readOnly: true,
                            });
                        },
                    },
                    {
                        dataField: "custom_result",
                        visible: false,
                        editCellTemplate: function (cellElement, cellInfo) {
                            var div = $("<div id='editor' style='min-height: 340px; width: 100%'>").appendTo(cellElement);                            
                            $(cellElement).css("min-height", "340px");
                            // $(div).dxTextArea({
                            //     value: cellInfo.value,
                            //     elementAttr: { style: "min-height:340px", id:"id_custom_result" },
                            //     minHeight:340,
                            //     //readOnly: true,
                            //     onValueChanged: function (e) {
                            //         if (e.value) {
                            //             cellInfo.setValue(e.value);                                        
                            //         } else {
                            //             cellInfo.setValue(null);

                            //             //strSql = null;
                            //         }
                            //     },
                            // });
                            // setTimeout(function () {
                            //     $("#id_custom_result textarea").css("min-height", "340px");
                            // }, 200);
                            
                            // trigger extension
                            var langTools = ace.require("ace/ext/language_tools");
                            var editor = ace.edit("editor");
                            var CSharpMode = ace.require("ace/mode/csharp").Mode;
                            editor.session.setMode(new CSharpMode());
                   
                            editor.setOptions({
                                enableBasicAutocompletion: true,
                                enableSnippets: true,
                                enableLiveAutocompletion: true
                            });

                            var RevenueCompleter = {
                                getCompletions: function(editor, session, pos, prefix, callback) {
                                    if (prefix.length === 0) { callback(null, []); return }
                                    var data = [
                                        {name:'MA_KH',value:'MA_KH',score:0,meta:'Revenue Data'},
                                        {name:'TEN_KH',value:'TEN_KH',score:0,meta:'Revenue Data'},
                                        {name:'JOIN_DATE',value:'JOIN_DATE',score:0,meta:'Revenue Data'},
                                        {name:'CUSTOMER_TYPE',value:'CUSTOMER_TYPE',score:0,meta:'Revenue Data'},
                                        {name:'SERVICE_PERIOD',value:'SERVICE_PERIOD',score:0,meta:'Revenue Data'},
                                        {name:'IN_MONTH',value:'IN_MONTH',score:0,meta:'Revenue Data'},
                                        {name:'DOANH_THU',value:'DOANH_THU',score:0,meta:'Revenue Data'},
                                        {name:'NUM_PACKAGE',value:'NUM_PACKAGE',score:0,meta:'Revenue Data'},
                                        {name:'DC',value:'DC',score:0,meta:'Revenue Data'},
                                        {name:'BILL_INVOICE',value:'BILL_INVOICE',score:0,meta:'Revenue Data'},
                                        {name:'PERSON_COM_RATE',value:'PERSON_COM_RATE',score:0,meta:'Revenue Data'},
                                        {name:'PERSON_COM_TARGET',value:'PERSON_COM_TARGET',score:0,meta:'Revenue Data'},
                                        {name:'CUSTOMER_COM_RATE',value:'CUSTOMER_COM_RATE',score:0,meta:'Revenue Data'},
                                        {name:'CUSTOMER_COM_TARGET',value:'CUSTOMER_COM_TARGET',score:0,meta:'Revenue Data'},
                                        {name:'SALE_COM_RATE',value:'SALE_COM_RATE',score:0,meta:'Revenue Data'},
                                        {name:'SALE_COM_TARGET',value:'SALE_COM_TARGET',score:0,meta:'Revenue Data'},
                                        {name:'INVOICE_AMOUNT',value:'INVOICE_AMOUNT',score:0,meta:'Revenue Data'},
                                        {name:'RECEIPT_AMOUNT',value:'RECEIPT_AMOUNT',score:0,meta:'Revenue Data'},
                                        {name:'ACT_CUSTOMER_COM_RATE',value:'ACT_CUSTOMER_COM_RATE',score:0,meta:'Revenue Data'},
                                        {name:'ACT_CUSTOMER_COM_AMOUNT',value:'ACT_CUSTOMER_COM_AMOUNT',score:0,meta:'Revenue Data'},
                                        {name:'ACT_CUSTOMER_COM_TARGET',value:'ACT_CUSTOMER_COM_TARGET',score:0,meta:'Revenue Data'},
                                        {name:'ACT_SALE_COM_TARGET',value:'ACT_SALE_COM_TARGET',score:0,meta:'Revenue Data'},
                                        {name:'ACT_SALE_COM_RATE',value:'ACT_SALE_COM_RATE',score:0,meta:'Revenue Data'},
                                        {name:'ACT_SALE_COM_AMOUNT',value:'ACT_SALE_COM_AMOUNT',score:0,meta:'Revenue Data'},
                                        {name:'REVENUE_PUBLIC',value:'REVENUE_PUBLIC',score:0,meta:'Revenue Data'}
                                    ];
                                    
                                    callback(null,data.filter(x=>x.value.includes(prefix)));                                    
                                }
                            }
                            langTools.addCompleter(RevenueCompleter);

                            editor.setValue(cellInfo.value);
                            editor.on("change", function(e){
                                var vl = editor.getValue();
                                if (vl) {
                                    cellInfo.setValue(vl);                                        
                                } else {
                                    cellInfo.setValue(null);
                                }
                            });
                        },
                    },
                ],
                onKeyDown:function(e){
                    if (e.event.keyCode == 13)
                        e.handled = true;
                },
                onInitNewRow: function (e) {
                    e.data.from_date = new Date();
                    e.data.type_rule = 0;
                    e.data._active = true;
                    that.Key = null;
                },
                onEditingStart: function (e) {
                    that.Key = e.data.key;
                    if (e.data.approved_date && !(that.permit.approve == true)) {
                        var grid = e.component;
                        var columns = grid.option("columns");
                        grid.beginUpdate();
                        columns.forEach(function (column) {
                            grid.columnOption(column.dataField, "allowEditing", false);
                        });
                        grid.endUpdate();
                    }
                },
                onRowInserting: function (e) {
                    e.data.filter_sql = SqlBuilder(FilterValue);
                },
                onRowUpdating: function (e) {
                    if (e.newData.filter_dx) {
                        e.newData.filter_sql = SqlBuilder(FilterValue);
                    }
                }

            });

            that.Component = $find.dxDataGrid("instance");

        }

        this.Init();
    }

    return DiscountConfig;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = DiscountConfig;
else
    window.DiscountConfig = DiscountConfig;