"use strict";


var KPIZone = (function () {

    var KPIZone = function (options) {
        var options = options || {};
        this.Name = "KPIZone";
        this.Type = "dxTreeList";
        this.id = options.id || (this.Name + (new Date()).getTime());
        this.Component = null;
        this.permit = getACL(this.Name) || { add: false, edit: false, delete: false };
        this.Data = new NCStore({
            url: "api/Accounting/KPIZone",
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

            var isExport = false;

            var exportToExcelfunction = function (e) {

                var tv = that.Component;// $("#Job_Progress_TreeList").dxTreeList("instance");
                var columns = tv.getVisibleColumns();
                var data = tv.getVisibleRows();

                var csvContent = "";

                for (var i = 0; i < columns.length; i++) {
                    csvContent += columns[i].caption + ",";
                }
                csvContent += "\r\n";

                for (var i = 0; i < data.length; i++) {
                    var row = data[i].values;
                    row.forEach(function (item, index) {
                        if (item === undefined || item === null) { csvContent += ","; }
                        else { csvContent += item + ","; };
                    }
                    );
                    csvContent += "\r\n";
                }

                var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

                if (navigator.msSaveBlob) {
                    navigator.msSaveBlob(blob, that.Name + '.csv')
                }
                else {
                    var link = document.createElement("a");
                    var url = URL.createObjectURL(blob);
                    link.setAttribute("href", url);
                    link.setAttribute("download", that.Name + '.csv');
                    document.body.appendChild(link);
                    // link.addEventListener("click",function(e){                        
                    //     e.preventDefault();
                    // });
                    link.click();
                    document.body.removeChild(link);
                };
            }

            var provinceStore = new NCData({
                url: 'api/master/province', callback: function (a) {
                    that.Component.columnOption('province', 'lookup.dataSource', a);
                }
            });
            var districtStore = new NCStore({
                url: 'api/master/district',
                filter: ["province_id=null"],
                key: "id",
            });

            $find.dxTreeList({
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
                keyExpr: "id",
                parentIdExpr: "parent",
                columnAutoWidth: true,
                wordWrapEnabled: true,
                autoExpandAll: false,
                searchPanel: {
                    visible: true,
                },
                showBorders: true,
                showRowLines: true,
                onToolbarPreparing: function (e) {
                    var toolbarItems = e.toolbarOptions.items;
                    toolbarItems.push(
                        {
                            location: "before",
                            widget: "dxButton",
                            options: {
                                //elementAttr: { id: "btn-Upload" },
                                visible: true,
                                icon: "fa fa-download",
                                text: "Download",
                                onClick: function (e) {
                                    setTimeout(() => {
                                        exportToExcelfunction();
                                    }, 1000);

                                }
                            },
                        },
                    );
                },
                onEditingStart: function (e) {
                    districtStore.filter = ["province_id=" + e.data.province];
                },
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
                        visible: false,
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
                        dataField: "parent",
                        visible: false,
                        lookup: {
                            dataSource: that.Data.Store(),
                            valueExpr: "id",
                            displayExpr: "name"
                        },
                    },
                    {
                        dataField: "province",
                        //visible: false,
                        lookup: {
                            dataSource: provinceStore.data,
                            valueExpr: "id",
                            displayExpr: function (o) { return "[" + o.province_code + "] " + o.province_name; }
                        },
                        setCellValue: function (newData, value, currentRowData) {
                            newData.province = value;
                            //provinceId = value;
                            newData.distric = null;
                            districtStore.filter = ["province_id=" + value];
                        }
                    }, 
                    {
                        dataField: "district",
                        visible: false,
                        lookup: {
                            dataSource: districtStore.Store(),
                            valueExpr: "id",
                            displayExpr: function (o) { return "[" + o._orc_code + "] " + o.district_name; }
                        }
                    },
                    {
                        dataField: "_active",
                    },
                    
                ],

            });

            that.Component = $find.dxTreeList("instance");

        }

        this.Init();
    }

    return KPIZone;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = KPIZone;
else
    window.KPIZone = KPIZone;