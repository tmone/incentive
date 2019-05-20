"use strict";


var Orgchart = (function () {

    var Orgchart = function(options){
        var options = options || {};
        this.Name = "OrgchartTree";
        this.Type = "dxTreeList";
        this.id = options.id || (this.Name + (new Date()).getTime());
        this.Component = null;
        this.permit = getACL(this.Name) || {add:false, edit:false, delete:false, addRoot:false};
        this.Data = new NCStore({url:'api/core/orgchart',key:"id",permit: this.permit});        
        this.Key = null; 
        this.Init = function(){
            var that = this;
            var $find = $(that.id);
            
            
            if(!$find.length){
                var scriptTag = document.scripts[document.scripts.length - 1];
                var parentTag = scriptTag.parentNode;
                $find = $("<div id='"+that.Id+"'>").appendTo(parentTag);
            }

            var syncTreeViewSelection = function (treeView, value) {
                if (!value) {
                    treeView.unselectAll();
                } else {
                    treeView.selectItem(value);
                }
            };
            
            function initDragging ($gridElement) {
                $gridElement.find('.dragRow').draggable({
                    helper: 'clone',
                    start: function (event, ui) {
                        var $originalRow = $(this),
                            $clonedRow = ui.helper;
                        var $originalRowCells = $originalRow.children(),
                            $clonedRowCells = $clonedRow.children();
                        for (var i = 0; i < $originalRowCells.length; i++)
                            $($clonedRowCells.get(i)).width($($originalRowCells.get(i)).width());
                        $clonedRow
                          .width($originalRow.width())
                          .addClass('drag-helper');
                    }
                });
                $gridElement.find('.dragRow').droppable({
                    drop: function (event, ui) {
                        var draggingRowKey = ui.draggable.data('keyValue');
                        var targetRowKey = $(this).data('keyValue');
                        console.log(draggingRowKey,targetRowKey);
          
                        //$gridElement.dxDataGrid('instance').refresh();
                    }
                });
            }

            var provinceStore = new NCData({url:'api/master/province',callback:function(a){            
                that.Component.columnOption('province', 'lookup.dataSource', a);
            }});
            var districtStore = new NCStore({
                url:'api/master/district',
                filter:["province_id=null"],
                key:"id",            
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
                    mode: "popup",
                    //form: {
                    //   colCount:1,
                    //}   
                },
                keyExpr: "id",
                parentIdExpr: "parent_id",
                columnAutoWidth: true,
                wordWrapEnabled: true,   
                autoExpandAll: false,             
                searchPanel: {
                    visible: true,                
                },
                showBorders:true,
                showRowLines:true,
                onToolbarPreparing: function (e) {
                    var toolbarItems = e.toolbarOptions.items;
                    toolbarItems.push({
                        widget: 'dxButton',
                        location: 'before',                        
                        options: {
                            icon: 'add',
                            text: "Add Root",
                            visible: that.permit.addroot || false,
                            onClick: function () {
                                that.Component.addRow();
                            }
                        },
                        
                    });
                },
                onContextMenuPreparing: function (e) {
                    if (e.row.rowType === "data") {
                        var numu = e.row.data.NumUser > 0 ? false : true;
                        e.items = [{
                            text: "Add Child",
                            visible: that.permit.add || false,
                            onItemClick: function () {
                                //DevExpress.ui.notify(e.row.rowIndex);
                                var k = e.component.getKeyByRowIndex(e.row.rowIndex);
                                if(k)
                                    that.Component.addRow(k);
                            }
                        },
                        {
                            text: "Edit",
                            visible: that.permit.edit || false,
                            onItemClick: function () {
                                that.Component.editRow(e.row.rowIndex);
                            }
                        },
                        {
                            text: "Delete",
                            visible: numu && (that.permit.delete || false),
                            onItemClick: function () {
                                that.Component.deleteRow(e.row.rowIndex);
                            }
                        }];
                    }
                },            
                onSelectionChanged: function (e) {
                    that.Key = e.currentSelectedRowKeys[0];                                
                }, 
                onInitNewRow:function(e){
                    e.data._orc_sync='I';
                    that.Key = null;
                },
                onEditingStart:function(e){
                    e.data._orc_sync='U';
                    that.Key = e.data.key;
                    districtStore.filter = ["province_id="+e.data.province];
                },   
                onRowUpdating:function(e){
                    e.newData._orc_sync = 'U';
                },
                onRowInserting:function(e){
                    e.data._orc_sync = 'I';

                },   
                onRowPrepared: function (e) {
                    if (e.rowType != 'data')
                        return;
                    e.rowElement
                    .addClass('dragRow')
                    .data('keyValue', e.key)
                    .data('parentId',e.data.parent_id);
                    if(e.data.parent_id == 0 || e.data.parent_id == null){
                        e.component.expandRow(e.key);
                    };
                }, 
                onContentReady: function (e) {
                    //initDragging(e.element);
                }, 
                headerFilter: {
                    visible: true
                },
                selection: {
                    mode: "single"
                },
                columns: [
                    {
                        dataField: "org_name",
                        caption: "Name",
                        cellTemplate: function (container, options) {                            
                            var num = $("<span class='pull-right badge bg-red'>").text(options.data.NumUser);
                            
                            var div = $("<div>");
                            var code = $("<span>").append("<b>").text("["+options.data.code+"] ");
                            if(options.data.code){
                                div.append(code);

                            }
                            var text = $("<span>").text(options.value);
                            if(options.data.id == 1)
                                text.addClass("text-orange");
                            if(options.data.province || options.data.district)
                                text.addClass("text-blue");
                            div.append(text);
                            if (options.data.NumUser > 0) {
                                div.append(num);
                            }
                            if (options.data._default == true) {
                                div.append(def);
                            }
                            div.appendTo(container);
                        },
                        setCellValue: function(newData, value, currentRowData) {
                            newData.org_name = value;
                            newData._orc_org_name = value;
                        },              
                        validationRules: [{
                            type: "required",
                        }],
                    }, {
                        dataField: "code",                      
                        visible:false,
                    }
                    , {
                        dataField: "description",                      
                        visible:false,
                    }, 
                    {
                        dataField: "province",
                        visible: false,
                        lookup: {
                            dataSource: provinceStore.data,
                            valueExpr: "id",
                            displayExpr:function(o){return "["+o.province_code+"] "+o.province_name;}
                        },
                        setCellValue: function (newData, value, currentRowData) {
                            newData.province = value;
                            //provinceId = value;
                            newData.distric = null;
                            districtStore.filter = ["province_id="+value];
                        }
                    }
                        , {
                            dataField: "district",
                        visible: false,
                        lookup: {
                            dataSource: districtStore.Store(),
                            valueExpr: "id",
                            displayExpr: function(o){return "["+o._orc_code+"] "+o.district_name;}
                        }
                    }
                        , {
                            dataField: "subdistric",
                            caption: "Sub Distric",
                            visible: false,
                            allowEditing: false,
                            formItem: {
                                visible: false
                            }
                    }
                    , 
                    {
                        dataField: "address",                      
                        visible:false
                    }, 
                    {
                        dataField: "_orc_org_code",   
                        caption:"Oracle Code",   
                        visible:false
                    }, 
                    {
                        dataField: "_active",
                        caption: "Active",
                        width: 90,
                        formItem: {
                            visible:false
                        }
                    },
                    {
                        dataField: "_orc_sync",
                        caption: "Sync",
                        width: 90,
                        formItem: {
                            visible:false
                        },
                        visible:false,

                    },
                    {
                        dataField: "parent_id",
                        caption: "Parent",
                        visible: false,
                        // lookup: {
                        //     dataSource: that.Data.Store(),
                        //     valueExpr: "id",
                        //     displayExpr: "org_name"
                        // },
                        editCellTemplate: function (cellElement, cellInfo) {
                            var div = document.createElement("div");
                            cellElement.get(0).appendChild(div);
                            $(div).dxDropDownBox({
                                value: cellInfo.value,
                                valueExpr: "id",
                                displayExpr: "org_name",
                                dataSource: that.Data.Store(),
                                contentTemplate: function (e) {
                                    var value = e.component.option("value"),
                                        $treeView = $("<div>").dxTreeView({
                                            dataSource: e.component.option("dataSource"),
                                            dataStructure: "plain",
                                            keyExpr: "id",
                                            parentIdExpr: "parent_id",
                                            selectionMode: "single",
                                            displayExpr: "org_name",
                                            selectByClick: true,
                                            searchEnabled: true,
                                            expandAllEnabled:true,
                                            onContentReady: function (args) {
                                                syncTreeViewSelection(args.component, value);
                                            },
                                            selectNodesRecursive: false,
                                            onItemSelectionChanged: function (args) {
                                                var value = args.component.getSelectedNodesKeys();
                                                e.component.option("value", value);
                                                if (value.length > 0)
                                                    cellInfo.setValue(value[0]);
                                            }
                                        });

                                    var treeView = $treeView.dxTreeView("instance");

                                    e.component.on("valueChanged", function (args) {
                                        syncTreeViewSelection(treeView, args.value);
                                        if (args.value.length > 0)
                                            cellInfo.setValue(args.value[0]);
                                    });

                                    return $treeView;
                                }
                            });


                        }
                    
                    }

                ]
    
            });
    
            that.Component = $find.dxTreeList("instance");
    
        };
        this.Init();
    };

        
    return Orgchart;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Orgchart;
else
    window.Orgchart = Orgchart;