"use strict";


var CustomerGroup = (function () {

    var CustomerGroup = function(options){
        var options = options || {};
        this.Name = "Customer";
        this.Type = "dxTreeList";
        this.id = options.id || (this.Name + (new Date()).getTime());
        this.Component = null;
        this.permit = getACL(this.Name) || {add:false, edit:false, delete:false, addRoot:false};
        this.Data = new NCStore({url:'api/master/customergroup',key:"id",permit: this.permit});        
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
            
            // function initDragging ($gridElement) {
            //     $gridElement.find('.dragRow').draggable({
            //         helper: 'clone',
            //         start: function (event, ui) {
            //             var $originalRow = $(this),
            //                 $clonedRow = ui.helper;
            //             var $originalRowCells = $originalRow.children(),
            //                 $clonedRowCells = $clonedRow.children();
            //             for (var i = 0; i < $originalRowCells.length; i++)
            //                 $($clonedRowCells.get(i)).width($($originalRowCells.get(i)).width());
            //             $clonedRow
            //               .width($originalRow.width())
            //               .addClass('drag-helper');
            //         }
            //     });
            //     $gridElement.find('.dragRow').droppable({
            //         drop: function (event, ui) {
            //             var draggingRowKey = ui.draggable.data('keyValue');
            //             var targetRowKey = $(this).data('keyValue');
            //             console.log(draggingRowKey,targetRowKey);
          
            //             //$gridElement.dxDataGrid('instance').refresh();
            //         }
            //     });
            // }
    
            $find.dxTreeList({
                dataSource: that.Data.Store(),
                editing: {
                    mode: "form",
                    form: {
                      colCount:1,
                    }   
                },
                showRowLines: true,
                showBorders: true,
                keyExpr: "id",
                parentIdExpr: "parent_id",
                columnAutoWidth: true,
                wordWrapEnabled: true,   
                autoExpandAll: false,             
                searchPanel: {
                    visible: true,   
                    width:'100px',             
                },
                onToolbarPreparing: function (e) {
                    var toolbarItems = e.toolbarOptions.items;
                    toolbarItems.push({
                        widget: 'dxButton',
                        location: 'before',                        
                        options: {
                            icon: 'add',
                            text: "Add Root",
                            visible: that.permit.add || false,
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
                    //e.data._orc_sync='I';
                    that.Key = null;
                },
                onEditingStart:function(e){
                    //e.data._orc_sync='U';
                    that.Key = e.data.key;
                },   
                onRowUpdating:function(e){
                    //e.newData._orc_sync = 'U';
                },
                onRowInserting:function(e){
                    //e.data._orc_sync = 'I';

                },   
                // onRowPrepared: function (e) {
                //     if (e.rowType != 'data')
                //         return;
                //     e.rowElement
                //     .addClass('dragRow')
                //     .data('keyValue', e.key)
                //     .data('parentId',e.data.parent_id);
                //     if(e.data.parent_id == 0 || e.data.parent_id == null){
                //         e.component.expandRow(e.key);
                //     };
                // }, 
                // onContentReady: function (e) {
                //     //initDragging(e.element);
                // }, 
                headerFilter: {
                    visible: true
                },
                selection: {
                    mode: "single"
                },
                columns: [
                    {
                        dataField: "group_name",
                        caption: "Name",
                        // cellTemplate: function (container, options) {                            
                        //     var num = $("<span class='pull-right badge bg-red'>").text(options.data.NumUser);
                        //     var div = $("<div>").append($("<span>").text(options.value));
                        //     if (options.data.NumUser > 0) {
                        //         div.append(num);
                        //     }
                        //     if (options.data._default == true) {
                        //         div.append(def);
                        //     }
                        //     div.appendTo(container);
                        // },
                        // setCellValue: function(newData, value, currentRowData) {
                        //     newData.org_name = value;
                        //     newData._orc_org_name = value;
                        // },              
                        validationRules: [{
                            type: "required",
                        }],
                    },                     
                    {
                        dataField: "parent_id",
                        caption: "Parent",
                        visible: false,
                        editCellTemplate: function (cellElement, cellInfo) {
                            var div = document.createElement("div");
                            cellElement.get(0).appendChild(div);
                            $(div).dxDropDownBox({
                                value: cellInfo.value,
                                valueExpr: "id",
                                displayExpr: "group_name",
                                dataSource: that.Data.Store(),
                                contentTemplate: function (e) {
                                    var value = e.component.option("value"),
                                        $treeView = $("<div>").dxTreeView({
                                            dataSource: e.component.option("dataSource"),
                                            dataStructure: "plain",
                                            keyExpr: "id",
                                            parentIdExpr: "parent_id",
                                            selectionMode: "single",
                                            displayExpr: "group_name",
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

        
    return CustomerGroup;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = CustomerGroup;
else
    window.CustomerGroup = CustomerGroup;