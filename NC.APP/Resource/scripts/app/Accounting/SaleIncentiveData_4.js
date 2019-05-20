"use strict";


var SaleIncentiveData = (function () {

    var SaleIncentiveData = function (options) {
        var options = options || {};
        this.Name = "SaleIncentive";
        this.Type = "dxDataGrid";
        this.id = options.id || (this.Name + (new Date()).getTime());
        this.Component = null;
        this.permit = getACL(this.Name) || { add: false, edit: false, delete: false };
        this.Data = null;
        this.Key = [];
        this.filterId;
        var that = this;


        this.Init = function () {
            var that = this;
            var $find = $(that.id);



            if (!$find.length) {
                var scriptTag = document.scripts[document.scripts.length - 1];
                var parentTag = scriptTag.parentNode;
                $find = $("<div id='" + that.id + "'>").appendTo(parentTag);
            }

            var dataKPI = [];
            var dataStore = new NCData({
                url:'api/Accounting/Data/KPIData',
                wait:true,
                callback:function(a){
                    dataKPI = a;
                }
            });

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

            $find.dxDataGrid({
                paging: {
                    pageSize: 50
                },
                pager: {
                    showPageSizeSelector: true,
                    allowedPageSizes: [10, 20, 50, 100, 200],
                    showInfo: true
                },
                groupPanel: {
                    visible: true
                },
                grouping: {
                    autoExpandAll: true,
                },
                columnChooser: {
                    enabled: true,                   
                },
                "export": {
                    enabled: true,
                    fileName: "Incentive",
                    allowExportSelectedData: true
                },
                // onToolbarPreparing: function (e) {
                //     var toolbarItems = e.toolbarOptions.items;
                //     toolbarItems.push(
                //         {
                //             location: "before",
                //             widget: "dxButton",
                //             options: {
                //                 //elementAttr: { id: "btn-Upload" },
                //                 visible: true,
                //                 icon: "fa fa-download",
                //                 text: "Download",
                //                 onClick: function (e) {
                //                     setTimeout(() => {
                //                         exportToExcelfunction();
                //                     }, 1000);

                //                 }
                //             },
                //         },
                //     );
                // },
                dataSource: {
                    //filter:[["IN_MONTH",">=",new Date('2018-07-01')],"and",["IN_MONTH","<=",new Date('2018-09-01')]],
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
                            args.take = loadOptions.take || 20;     

                            function loadElastic(lastID) {
                                $.ajax({
                                    url: getURL('api/Accounting/Report/KPI_NEW'),
                                    dataType: "json",
                                    success: function (result) {                                       
                                        
                                        deferred.resolve(result, { totalCount: result.length });
                                    },
                                    error: function () {
                                        deferred.reject("Data Loading Error");
                                    },
                                    timeout: 0
                                });
                            }

                            //loadElastic(lastID);
                            loadElastic();
                            return deferred.promise();
                        }
                    })
                },
                selection: {
                    mode: "single"
                },
                headerFilter: {
                    visible: true
                },
                keyExpr: "id",
                parentIdExpr: "parent",
                //autoExpandAll: true,
                allowColumnReordering: true,
                allowColumnResizing: true,
                columnAutoWidth: true,
                columnFixing: {
                    enabled: true
                },
                //wordWrapEnabled: true,                
                searchPanel: {
                    visible: true,
                },
                showBorders: true,
                showRowLines: true,
                columns: [
                    {
                        dataField: "SALE_MAN",
                        fixed:true,
                        //dataType:"date",
                        // editorOptions: {
                        //     format: "yyyy-MM",
                        // },
                        // format: "yyyy-MM",
                    },
                    {
                        dataField: "SaleDescription",
                        fixed:true,
                    },
                    {
                        dataField: "TARGET",
                        editorOptions: {
                            format: "###,##0",
                        },
                        format: "###,##0",
                    },
                    {
                        dataField: "AR",
                        editorOptions: {
                            format: "###,##0",
                        },
                        format: "###,##0",
                    },
                    {
                        dataField: "KPI",
                        editorOptions: {
                            format: "percent",
                        },
                        format: "percent",
                        alignment: "right",
                        allowGrouping: false,
                        cellTemplate: function (container, options) {
                            var t = $("<div/>");
                            var te = options.value * 100 >> 0;
                            t.text(te + " %")
                            if(te>0){
                                t.appendTo(container);  
                                if(te<80){
                                    container.addClass('text-red');
                                }else if(te<=100){
                                    container.addClass('text-blue');
                                }else if(te<=150){
                                    container.addClass('text-green');
                                }else if(te<=200){
                                    container.addClass('text-perfect');
                                }else {
                                    container.addClass('text-super');
                                }
                            }                                                      
                        },                        
                    },
                    {
                        dataField: "IncentiveType1",
                        caption: "Normal Price Incentive",
                        editorOptions: {
                            format: "###,##0",
                        },
                        format: "###,##0",
                    },
                    {
                        dataField: "IncentiveType2",
                        caption: "Special Price Incentive",
                        editorOptions: {
                            format: "###,##0",
                        },
                        format: "###,##0",
                    },
                    {
                        dataField: "IncentiveType3",
                        caption: "Internal Service Incentive",
                        editorOptions: {
                            format: "###,##0",
                        },
                        format: "###,##0",
                    },
                    {
                        dataField: "IncentiveType4",
                        caption: "FLC Service Incentive",
                        editorOptions: {
                            format: "###,##0",
                        },
                        format: "###,##0",
                    },
                    {
                        dataField: "BonusType1",
                        caption: "Bonus",
                        editorOptions: {
                            format: "###,##0",
                        },
                        format: "###,##0",
                    },
                    {
                        dataField: "IncentiveTotal",
                        caption: "TOTAL Incentive",
                        editorOptions: {
                            format: "###,##0",
                        },
                        format: "###,##0",
                    },
                ],
            });




            that.Component = $find.dxDataGrid("instance");


        }

        this.Init();
    }

    return SaleIncentiveData;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = SaleIncentiveData;
else
    window.SaleIncentiveData = SaleIncentiveData;