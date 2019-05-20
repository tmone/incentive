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
            var lastSource = [];
    
            $find.dxDataGrid({
                paging: {
                    pageSize: 50
                },
                pager: {
                    showPageSizeSelector: true,
                    allowedPageSizes: [10, 20, 50, 100, 200],
                    showInfo: true
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
                            function findParentID(obj,xs){
                                var t = obj.filter(x=>x.SALE_MAN ==xs.PAR1 && x.IN_MONTH == xs.IN_MONTH);
                                if(t&&t.lenght>0){
                                    return t.id;
                                }
                                return null;
                            }
                            function getParent(d){
                                var v = d;
                                if(typeof d.getMonth !== 'function'){
                                    v = new Date(d);
                                }
                                var y = v.getFullYear();
                                
                                var m = v.getMonth() + 1;
                                if(m<10){
                                    m = '0'+m;
                                }
                                var q = 1;
                                if(m>=4&&m<=6){
                                    q = 2;
                                }else if(m>=7&&m<=9){
                                    q =3;
                                }else{
                                    q =4;
                                }
                                var mtmp = 'D'+y+'Q'+q+m;                                
                                return mtmp;
                            }

                            function createKeyYear(ar){
                                var rs = [];

                                //return rs;

                                ar.forEach((ve) => {
                                    var v = ve;
                                    if(typeof ve.getMonth !== 'function'){
                                        v = new Date(ve);
                                    }
                                    var y = v.getFullYear();
                                    var ytmp = 'D'+y+'0000';
                                    if(rs.filter(x=>x.id == ytmp).length==0){
                                        rs.push({
                                            id: ytmp,
                                            SaleDescription:y,
                                            IN_MONTH: y
                                        });
                                    }
                                    var m = v.getMonth() + 1;
                                    if(m<10){
                                        m = '0'+m;
                                    }
                                    var q = 1;
                                    if(m>=4&&m<=6){
                                        q = 2;
                                    }else if(m>=7&&m<=9){
                                        q =3;
                                    }else{
                                        q =4;
                                    }                                    
                                    var qtmp = 'D'+y+'Q'+q+'00';
                                    if(rs.filter(x=>x.id == qtmp).length==0){
                                        rs.push({
                                            id: qtmp,
                                            SaleDescription:'Q'+q,
                                            parent: ytmp,
                                            IN_MONTH: 'Q'+q,
                                        });
                                    }
                                    var mtmp = 'D'+y+'Q'+q+m;
                                    if(rs.filter(x=>x.id == mtmp).length==0){
                                        rs.push({
                                            id: mtmp,
                                            SaleDescription:y+'-'+m,
                                            parent: qtmp,
                                            IN_MONTH: m
                                        });
                                    }                                    
                                });
                                return rs;
                            }

                            function loadElastic(lastID){                                
                                $.ajax({
                                    url: getURL('api/Accounting/Report/KPI'                                       ),
                                    dataType: "json",            
                                    success: function(result){
                                        result = result.map((x,i)=>{
                                            if(x.ZONE5 == null){
                                                if(x.ZONE4 == null){
                                                    if(x.ZONE3 == null){
                                                        if(x.ZONE2 == null){
                                                            if(x.ZONE1 == null){
                                                                x.ZONE5 = x.SALE_MAN;
                                                                x.ZONE4 = x.PAR4;
                                                                x.ZONE3 = x.PAR3;
                                                                x.ZONE2 = x.PAR2;
                                                                x.ZONE1 = x.PAR1;
                                                            }else{
                                                                x.ZONE5 = x.ZONE1;
                                                                x.ZONE4 = x.SALE_MAN;
                                                                x.ZONE3 = x.PAR3;
                                                                x.ZONE2 = x.PAR2;
                                                                x.ZONE1 = x.PAR1;
                                                            }                                                            
                                                        }else{
                                                            x.ZONE5 = x.ZONE2;
                                                            x.ZONE4 = x.ZONE1;
                                                            x.ZONE3 = x.SALE_MAN;
                                                            x.ZONE2 = x.PAR2;
                                                            x.ZONE1 = x.PAR1;
                                                        }
                                                    }else{
                                                        x.ZONE5 = x.ZONE3;
                                                        x.ZONE4 = x.ZONE2;
                                                        x.ZONE3 = x.ZONE1;
                                                        x.ZONE2 = x.SALE_MAN;
                                                        x.ZONE1 = x.PAR1;
                                                    }
                                                }else{
                                                    x.ZONE5 = x.ZONE4;
                                                    x.ZONE4 = x.ZONE3;
                                                    x.ZONE3 = x.ZONE2;
                                                    x.ZONE2 = x.ZONE1;
                                                    x.ZONE1 = x.SALE_MAN;
                                                }
                                            }   
                                            //x.id = 'id'+i;
                                            //x.parent = x.PAR1 || getParent(x.IN_MONTH);
                                            //x.IN_MONTH = x.IN_MONTH.substr(0,7) || '';
                                            x.SORT = x.PAR1 ? 0 : 1;
                                           // x.PAR1 = x.PAR1 || x.SALE_MAN;
                                            
                                            return x;                                         
                                        });
                                        //var temp = result.slice(0).map(x=>x.IN_MONTH);
                                        //result = result.concat(createKeyYear(temp));
                                        lastSource = result.slice();
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
                allowColumnReordering:true,
                allowColumnResizing:true,
                columnAutoWidth: true,
                columnFixing:{
                    enabled:true
                },
                groupPanel:{
                    enabled:true,
                },
                columnChooser:{
                    enabled:true,
                },
                //wordWrapEnabled: true,                
                searchPanel: {
                    visible: true,
                },
                showBorders: true,
                showRowLines: true,
                columns:[
                    {
                        caption:"Y",
                        dataField:"IN_MONTH",
                        dataType:"date",
                        editorOptions: {
                            format: "yyyy",
                        },
                        format: "yyyy",
                        sortOrder:"asc",
                        //visible:false,
                        groupIndex:0
                    },
                    {
                        caption:"Q",
                        calculateCellValue:function(e){
                            var d = e.IN_MONTH;
                            if(typeof d.getMonth !== 'function'){
                                d = new Date(d);
                            }
                            return 'Q' + ((d.getMonth() / 3 >> 0) + 1);
                        },
                        sortOrder:"asc",
                        visible:false,     
                        groupIndex:1 ,                  
                    },
                    {
                        caption:"M",
                        calculateCellValue:function(e){
                            var d = e.IN_MONTH;
                            if(typeof d.getMonth !== 'function'){
                                d = new Date(d);
                            }
                            return d.getMonth()  + 1;
                        },
                        sortOrder:"asc",
                        visible:false,     
                        groupIndex:2 ,                  
                    },     
                    {
                        dataField:"PAR1",
                        sortOrder:"asc",
                    },
                    {
                        dataField:"SALE_MAN",
                        sortOrder:"asc",
                    },                    
                    {
                        dataField:"TARGET",
                        editorOptions: {
                            format: "###,##0",
                        },
                        format: "###,##0",
                    },
                    {
                        dataField:"AR",
                        editorOptions: {
                            format: "###,##0",
                        },
                        format: "###,##0",
                    },
                    {
                        dataField:"KPI",
                        editorOptions: {
                            format: "percent",
                        },
                        format: "percent",
                    },
                    {
                        dataField:"IncentiveType1",
                        caption:"Normal Price Incentive",
                        editorOptions: {
                            format: "###,##0",
                        },
                        format: "###,##0",
                    },
                    {
                        dataField:"IncentiveType2",
                        caption:"Special Price Incentive",
                        editorOptions: {
                            format: "###,##0",
                        },
                        format: "###,##0",
                    },
                    {
                        dataField:"IncentiveType3",
                        caption:"Internal Service Incentive",
                        editorOptions: {
                            format: "###,##0",
                        },
                        format: "###,##0",
                    },
                    {
                        dataField:"IncentiveType4",
                        caption:"FLC Service Incentive",
                        editorOptions: {
                            format: "###,##0",
                        },
                        format: "###,##0",
                    },
                    {
                        dataField:"BonusType1",
                        caption:"Bonus",
                        editorOptions: {
                            format: "###,##0",
                        },
                        format: "###,##0",
                    },
                    {
                        dataField:"IncentiveTotal",
                        caption:"TOTAL Incentive",
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