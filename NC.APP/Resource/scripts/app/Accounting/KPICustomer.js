﻿"use strict";


var KPICustomer = (function () {

    var KPICustomer = function (options) {
        var options = options || {};
        this.Name = "KPICustomer";
        this.Type = "dxDataGrid";
        this.id = options.id || (this.Name + (new Date()).getTime());
        this.Component = null;
        this.Master = options.master || null;
        this.permit = getACL(this.Name) || {
            add: false,
            edit: false,
            elete: false,
        };
        this.Data = [];
        // = DevExpress.data.AspNet.createStore({
        //     key: "waybill_number",
        //     loadUrl: getURL('api/Navigation/HistoryScan/HistoryDx'),

        //     onBeforeSend: function(method, ajaxOptions) {

        //         if(ajaxOptions.data.filter){
        //             var fil = $("#fixGridId").dxDataGrid("instance").option("filterValue");
        //             ajaxOptions.data.filterx = SqlBuilder(fil);//JSON.parse(ajaxOptions.data.filter)
        //         }
        //     }
        // });
        this.Key = null;
        this.SelectedData;
        this.lastData;
        this.printedList = [];
        this.month = null;
        var getTypeField = function (value, column = "") {
            if (column.length > 0) {
                var Columns = $("#fixGridId").dxDataGrid("instance").option("columns");
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
            if (Array.isArray(a) && a.length == 3) {


                if (a[1] == "anyof") {
                    return "(" + SqlBuilder(a[0]) + " in (" + a[2].join(',') + "))";
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


        // var fromDate = new Date();
        // fromDate.setHours(0,0,0,0);
        // var toDate = new Date();
        // toDate.setHours(23,59,59,999);
        // this.lastFilter=[['sys_updatedate','>=',fromDate],'and',['sys_updatedate','<=',toDate]];



        this.Init = function () {
            var that = this;
            var $find = $(that.id);

            var getMonthStr = function(m){
                if(m && m.getTime()){
                    return m.toJSON().substr(0,7);
                }
                return "";
            }

            var findPush = function (dat) {
                dat['client_code'] = dat['_1'];                
                dat['saler'] = dat['_2'];                
                dat['TypeS'] = "Ok";

                if (!dat.client_code || dat.client_code.length < 3) {
                    return;
                }

                var fi = that.Data.filter(x => x.client_code == dat.client_code);
                if (fi && fi.length > 0) {
                    return;
                }


                if ((dat.client_code+'').indexOf(' ') >= 0) {
                    return;
                }

                that.Data.push(dat);

                //that.Component.selectRows([id], true);
                that.Component.refresh();
            }




            if (!$find.length) {
                var scriptTag = document.scripts[document.scripts.length - 1];
                var parentTag = scriptTag.parentNode;
                //toolbar = $("<div id='toolbar_"+that.id+"' style='padding-bottom: 10px;'>").appendTo(parentTag);
                $find = $("<div id='" + that.id + "'>").appendTo(parentTag);
                //$("<div class='popup'>").appendTo(parentTag);
            } else {
                //$find.parent().append("<div class='popup'>");
            }
            var tmpFile;
            var popup = null,
                popupOptions = {
                    width: 300,
                    height: 200,
                    contentTemplate: function () {
                        var fileUploader = $("<div id='fileId'>").dxFileUploader({
                            multiple: false,
                            name: "UpFile",
                            accept: "*",
                            uploadMode: "instantly",
                            //uploadHeaders:{                
                            //    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                            //},
                            uploadUrl: getURL("api/core/ImportExcel/Upload"),
                            onValueChanged: function (e) {
                                //loadPanel.show();
                                tmpFile = (new Date().getTime() % 1000000) + 1000000;
                                var url = e.component.option("uploadUrl");
                                url = updateQueryStringParameter(url, "n", tmpFile);
                                e.component.option("uploadUrl", url);
                            },
                            onUploaded: function (e) {
                                if (tmpFile) {
                                    $.ajax({
                                        type: "GET",
                                        url: getURL("api/core/ImportExcel/getExcelData/" + tmpFile),
                                        data: {
                                            'id': tmpFile
                                        },
                                        success: function (result) {
                                            //e.component.selectItem(result);
                                            //dataitems = JsonForm(result, ID);
                                            var dat = JSON.parse(result);
                                            for (var i = 0; i < dat.length; i++) {
                                                findPush(dat[i]);
                                            };
                                            popup.hide();
                                        },
                                    });
                                }
                            }
                        });
                        return fileUploader;
                    },
                    showTitle: true,
                    title: "Chọn dữ liệu Excel",
                    visible: false,
                    dragEnabled: true,
                    closeOnOutsideClick: true,
                    // toolbarItems:[{
                    //     toolbar:'bottom',
                    //     widget:'dxButton',
                    //     options:{
                    //         icon:"runner",
                    //         text:"Go",
                    //         onClick:function(e){
                    //             DevExpress.ui.notify(that.selectedUser);
                    //             popup.hide();
                    //         }
                    //     }
                    // }],
                };

            var showInfo = function () {
                if (popup) {
                    $(".popup").remove();
                }
                var $popupContainer = $("<div />")
                    .addClass("popup")
                    .appendTo($("#change-state"));
                popup = $popupContainer.dxPopup(popupOptions).dxPopup("instance");
                popup.show();
            };

            var checkUpload = function () {
                if (that.Data.length > 0) {
                    $("#btn-Upload").dxButton("instance").option("visible", true);
                }
            }
            var numSucess = 0;
            var totalRun = 0;
            var uploadData = function () {
                var data = that.Component.getSelectedRowsData();
                if (data.length == 0) {
                    DevExpress.ui.notify("Không có dữ liệu để upload....", "warning", 2000);
                    return;
                }
                numSucess = data.length;
                totalRun = data.length;
                for (var i = 0; i < data.length; i++) {
                    var dat = data[i];
                    $.ajax({
                        type: "POST",
                        url: getURL("api/Accounting/KPICustomer/AddCustomer"),
                        data: dat,
                        async:false,
                        success: function (result) {
                            var rs = JSON.parse(result);
                            if (rs.TypeS == "Ok") {
                                removeItem(rs);
                                numSucess--;
                            } else {
                                addError(rs);
                            }
                            totalRun--;
                            if (totalRun <= 0) {
                                if (numSucess <= 0) {
                                    that.Component.option("masterDetail.autoExpandAll", false);
                                } else {
                                    that.Component.option("masterDetail.autoExpandAll", true);
                                }
                                that.Component.refresh();
                                if (that.Master) {
                                    that.Master.Component.refresh();
                                }
                                that.Component.endCustomLoading();
                                $.ajax({
                                    type: "POST",
                                    url: getURL("api/Accounting/KPISetting/update_kpi"),                        
                                    success: function (result) {                                                        
                                    },
                                });
                            }
                        },
                    });
                }
            }

            var removeItem = function (obj) {
                for (var i = 0; i < that.Data.length; i++) {
                    if (that.Data[i].client_code == obj.client_code) {
                        that.Data.splice(i, 1);
                        break;
                    }
                }
            }

            var addError = function (obj) {
                for (var i = 0; i < that.Data.length; i++) {
                    if (that.Data[i].client_code == obj.client_code) {
                        that.Data[i].NoteS = obj.NoteS;
                        that.Data[i].TypeS = obj.TypeS;
                        break;
                    }
                }
                //that.Component.deselectRows(obj.number);
            
            }

            var mont = new Date();
            mont.setDate(0);
            that.month = mont;


            $find.dxDataGrid({
                // stateStoring: {
                //     enabled: true,
                //     type: "localStorage",
                //     storageKey: that.Name,
                // },
                selectionFilter: ["type", "=", "Ok"],
                elementAttr: { id: "fixGridId" },
                columnAutoWidth: true,
                paging: {
                    //pageSize: 50,
                    enabled: false,
                },
                //pager: {
                //    showPageSizeSelector: true,
                //    allowedPageSizes: [10, 20, 50, 100, 200],
                //    showInfo: true
                //},
                dataSource: that.Data,
                remoteOperations: false,
                // remoteOperations: {
                //     sorting: true,
                //     paging: true,
                //     filtering: true,
                // },                  
                selection: {
                    mode: "multiple",
                    //deferred: true,
                },
                // searchPanel: {
                //     visible: true,                
                //     placeholder: "Search..."
                // },
                editing: {
                    mode: "cell",
                    allowUpdating: true,
                    allowDeleting: true,
                    //allowAdding: true,
                    useIcons: true
                },
                "export": {
                    enabled: true,
                    fileName: "Customer_KPI",
                    allowExportSelectedData: false
                },
                filterRow: { visible: true },
                //filterPanel: { visible: true },
                headerFilter: { visible: true },
                //filterValue:that.lastFilter,
                showRowLines: true,
                showBorders: true,
                onOptionChanged: function (e) {
                    if (e.name == "filterValue" && (e.value == null || e.value.length == 0)) {
                        var tmp = that.lastFilter;
                        e.component.option("filterValue", tmp);
                    }

                },

                // onCellPrepared: function(options) {
                //     //var fieldData = options.value;
                //     if(options.rowType=="data" && options.column.command && options.column.command=="select"){
                //         options.cellElement.dxCheckBox("instance").option("value",options.data.type=="Ok");
                //     }
                // },
                onToolbarPreparing: function (e) {
                    var toolbarItems = e.toolbarOptions.items;
                    toolbarItems.push(                        
                        // {
                        //     location: "before",
                        //     widget: "dxDateBox",
                        //     options: {
                        //         elementAttr: { id: "detail_status" },
                        //         value:that.month,   
                        //         displayFormat: 'yyyy-MM',
                        //         calendarOptions: {
                        //             maxZoomLevel: 'year',
                        //             minZoomLevel: 'century',
                        //         },
                        //         onValueChanged:function(e){
                        //             that.month = e.value;
                        //         }                             
                        //     },
                        // },
                        {
                            location: "before",
                            widget: "dxButton",
                            options: {
                                elementAttr: { id: "btn-Excel" },
                                visible: true,
                                icon: "fa fa-file-excel-o",
                                text: "Excel",
                                onClick: function (e) {
                                    // var state = $("#detail_status").dxDateBox("instance").option("value");
                                    // if (!state || state == null) {
                                    //     DevExpress.ui.notify("Not choice Month...", "error", 2000);
                                    //     return;
                                    // }
                                    showInfo();
                                }
                            },
                        },                        
                        {
                            location: "after",
                            widget: "dxButton",
                            options: {
                                elementAttr: { id: "btn-Upload" },
                                visible: false,
                                icon: "fa fa-upload",
                                text: "Upload",
                                onClick: function (e) {
                                    that.Component.beginCustomLoading("Upload server....");
                                    uploadData();
                                }
                            },
                        },
                        {
                            location: "after",
                            widget: "dxButton",
                            options: {
                                elementAttr: { id: "btn-Upload" },
                                visible: true,
                                icon: "fa fa-refresh",
                                //text:"Clear",
                                onClick: function (e) {
                                    that.Data = [];
                                    that.Component.option("dataSource", that.Data);
                                    that.Component.option("masterDetail.autoExpandAll", false);
                                }
                            },
                        },
                    );
                },
                onSelectionChanged: function (e) {
                    // that.Key = e.currentSelectedRowKeys[0];  
                    // that.SelectedData = e.selectedRowsData;
                    $("#btn-Upload").dxButton("instance").option("visible", e.selectedRowKeys.length > 0);

                },
                onContentReady: function (e) {

                },
                onRowPrepared: function (e) {

                    if (e.rowType == 'data') {
                        //var cls = e.data.ma_trang_thai;
                        //var clr = findColor(cls);
                        //e.rowElement.addClass(clr.color);
                        if (e.data.TypeS == "Ok") {
                            setTimeout(function () {
                                e.component.selectRows([e.key], true);
                            }, 100)
                        } else {
                            setTimeout(function () {
                                e.component.deselectRows([e.key]);
                            }, 100)
                        }
                    }
                },
                // onRowInserted:function(e){
                //     checkUpload();
                // },
                // onRowRemoved:function(e){
                //     checkUpload();
                // },
                masterDetail: {
                    enabled: true,
                    template: function (container, options) {
                        var dat = options.data;

                        if (dat.NoteS) {
                            $("<div>")
                                .addClass("bg-red")
                                .text(dat.NoteS)
                                .appendTo(container);
                        }
                    }
                },
                keyExpr: "client_code",
                columns: [
                    // {
                    // dataField: "STT",                    
                    // }
                    , {
                        dataField: "client_code",
                        caption: "Mã KH",
                        dataType: "string",
                        // editorOptions:{
                        //     readOnly:true,
                        // },
                    },                    
                    {
                        dataField: "saler",
                        caption: "NV Sale",
                        dataType: "string",
                        //format:"###,##0"                                                                 
                    },                    
                    {
                        dataField: "TypeS",
                        //caption: "Loại HH",
                        dataType: "string",
                        visible:false,
                    },

                ],
            });


            that.Component = $find.dxDataGrid("instance");


        }

        this.Init();
        //this.AutoRefress();
        //this.reset();

    }


    KPICustomer.prototype.reset = function () {

        this.Component.selectRows([]);
        this.selectedRowsData = [];
        this.Key = null;
        this.lastData = null;
        //$("#txt-Number").dxTextBox("instance").option("value",null);
        //$("#txt-Number").dxTextBox("instance").focus();
    }

    return KPICustomer;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = KPICustomer;
else
    window.KPICustomer = KPICustomer;