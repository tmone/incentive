"use strict";


var SaleIncentiveData = (function () {

    var SaleIncentiveData = function (options) {
        var options = options || {};
        this.Name = "SaleIncentive";
        this.Type = "dxTreeList";
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

            $find.dxTreeList({
                paging: {
                    pageSize: 50
                },
                pager: {
                    showPageSizeSelector: true,
                    allowedPageSizes: [10, 20, 50, 100, 200],
                    showInfo: true
                },
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
                            function findParentID(obj, xs) {
                                var fi = -1;
                                var t = obj.filter(function (x, i) {
                                    if (x.SALE_MAN == xs.PAR1 && x.IN_MONTH == xs.IN_MONTH) {
                                        fi = i;
                                        return true;
                                    }
                                    return false;
                                });
                                if (t && t.length > 0) {
                                    return t[0].id || 'id' + fi;
                                }
                                return null;
                            }
                            function getParent(d) {
                                var v = d;
                                if (typeof d.getMonth !== 'function') {
                                    v = new Date(d);
                                }
                                var y = v.getFullYear();

                                var m = v.getMonth() + 1;
                                var q = 1;
                                if (m >= 4 && m <= 6) {
                                    q = 2;
                                } else if (m >= 7 && m <= 9) {
                                    q = 3;
                                } else if (m > 9) {
                                    q = 4;
                                }
                                if (m < 10) {
                                    m = '0' + m;
                                }
                                var mtmp = 'D' + y + 'Q' + q + m;
                                return mtmp;
                            }

                            function createKeyYear(ar) {
                                var rs = [];

                                //return rs;

                                ar.forEach((ve) => {
                                    var v = ve;
                                    if (typeof ve.getMonth !== 'function') {
                                        v = new Date(ve);
                                    }
                                    var y = v.getFullYear();
                                    var ytmp = 'D' + y + '0000';
                                    if (rs.filter(x => x.id == ytmp).length == 0) {
                                        rs.push({
                                            id: ytmp,
                                            SaleDescription: 'Year ' + y,
                                            SALE_MAN: y
                                        });
                                    }
                                    var m = v.getMonth() + 1;
                                    var q = 1;
                                    if (m >= 4 && m <= 6) {
                                        q = 2;
                                    } else if (m >= 7 && m <= 9) {
                                        q = 3;
                                    } else if (m > 9) {
                                        q = 4;
                                    }
                                    if (m < 10) {
                                        m = '0' + m;
                                    }
                                    var qtmp = 'D' + y + 'Q' + q + '00';
                                    if (rs.filter(x => x.id == qtmp).length == 0) {
                                        rs.push({
                                            id: qtmp,
                                            SaleDescription: 'Quarter ' + q,
                                            parent: ytmp,
                                            SALE_MAN: 'Q' + q,
                                        });
                                    }
                                    var mtmp = 'D' + y + 'Q' + q + m;
                                    if (rs.filter(x => x.id == mtmp).length == 0) {
                                        rs.push({
                                            id: mtmp,
                                            SaleDescription: 'Month ' + m,
                                            parent: qtmp,
                                            SALE_MAN: m
                                        });
                                    }
                                });
                                return rs;
                            }

                            function loadElastic(lastID) {
                                $.ajax({
                                    url: getURL('api/Accounting/Report/KPI'),
                                    dataType: "json",
                                    success: function (result) {
                                        var adding = [];
                                        result = result.map((x, i, arr) => {
                                            if (x.ZONE5 == null) {
                                                if (x.ZONE4 == null) {
                                                    if (x.ZONE3 == null) {
                                                        if (x.ZONE2 == null) {
                                                            if (x.ZONE1 == null) {
                                                                x.ZONE5 = x.SALE_MAN;
                                                                x.ZONE4 = x.PAR4;
                                                                x.ZONE3 = x.PAR3;
                                                                x.ZONE2 = x.PAR2;
                                                                x.ZONE1 = x.PAR1;
                                                            } else {
                                                                x.ZONE5 = x.ZONE1;
                                                                x.ZONE4 = x.SALE_MAN;
                                                                x.ZONE3 = x.PAR3;
                                                                x.ZONE2 = x.PAR2;
                                                                x.ZONE1 = x.PAR1;
                                                            }
                                                        } else {
                                                            x.ZONE5 = x.ZONE2;
                                                            x.ZONE4 = x.ZONE1;
                                                            x.ZONE3 = x.SALE_MAN;
                                                            x.ZONE2 = x.PAR2;
                                                            x.ZONE1 = x.PAR1;
                                                        }
                                                    } else {
                                                        x.ZONE5 = x.ZONE3;
                                                        x.ZONE4 = x.ZONE2;
                                                        x.ZONE3 = x.ZONE1;
                                                        x.ZONE2 = x.SALE_MAN;
                                                        x.ZONE1 = x.PAR1;
                                                    }
                                                } else {
                                                    x.ZONE5 = x.ZONE4;
                                                    x.ZONE4 = x.ZONE3;
                                                    x.ZONE3 = x.ZONE2;
                                                    x.ZONE2 = x.ZONE1;
                                                    x.ZONE1 = x.SALE_MAN;
                                                }
                                            }
                                            x.id = 'id' + i;
                                            var tpar = findParentID(arr, x);
                                            // if(tpar == null){
                                            //     tpar = getParent(x.IN_MONTH);
                                            //     if(x.PAR1!=null){
                                            //         var npar = tpar+x.PAR1;
                                            //         if(adding.filter(x=>x ==npar ).length==0){
                                            //             adding.push({
                                            //                 id: npar,
                                            //                 SaleDescription:npar,
                                            //                 parent: tpar,
                                            //                 IN_MONTH: x.PAR1
                                            //             });
                                            //         }

                                            //         tpar = npar;
                                            //     }
                                            // } 
                                            x.parent = tpar || getParent(x.IN_MONTH);
                                            //x.IN_MONTH = x.IN_MONTH.substr(0,7) || '';
                                            return x;
                                        });
                                        var temp = result.slice(0).map(x => x.IN_MONTH);

                                        var datat = [];

                                        dataKPI.map(function(x,i,dar){
                                            var fi = findParentID(result,{
                                                PAR1 : x.SALE_MAN,
                                                IN_MONTH: x.IN_MONTH
                                            });
                                            if(fi!=null){
                                                datat.push(Object.assign({
                                                    parent: fi ,
                                                    id: "dt"+i
                                                },x));
                                            }
                                        });

                                        result = result.concat(createKeyYear(temp), adding, datat);
                                        
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




            that.Component = $find.dxTreeList("instance");


        }

        this.Init();
    }

    return SaleIncentiveData;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = SaleIncentiveData;
else
    window.SaleIncentiveData = SaleIncentiveData;