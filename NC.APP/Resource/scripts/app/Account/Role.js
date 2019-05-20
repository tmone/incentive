"use strict";


var Role = (function () {

    var Role = function(options){
        var options = options || {};
        this.Name = "Roles";
        this.Type = "dxTreeList";
        this.id = options.id || (this.Name + (new Date()).getTime());
        this.Component = null;
        this.permit = getACL(this.Name) || {add:false, edit:false, delete:false, addRoot:false, setDefault:false};
        this.Data = new NCStore({url:'api/core/role',key:"id",permit: this.permit});
        this.selected = options.selected || [];
        this.expanded = options.expanded || [];        
        this.Key = null;
        
        this.Init = function(){
            var that = this;
            var $find = $(that.id);
             
            if(!$find.length){
                var scriptTag = document.scripts[document.scripts.length - 1];
                var parentTag = scriptTag.parentNode;
                $find = $("<div id='"+that.Id+"'>").appendTo(parentTag);
            }
            
            function updateDefault(k) {
                /* for (var i = 0; i < arrayStore._array.length; i++) {
                    var tmp = arrayStore._array[i];
                    if (tmp.id == k) {
                        tmp._default = true;
                    } else {
                        tmp._default = false;
                    }
                } */
            }

            var syncTreeViewSelection = function (treeView, value) {
                if (!value) {
                    treeView.unselectAll();
                } else {
                    treeView.selectItem(value);
                }
            };
                
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
                    form: {
                        colCount:1,
                    }   
                },
                keyExpr: "id",
                parentIdExpr: "parent_id",
                columnAutoWidth: true,
                wordWrapEnabled: true,
                expandedRowKeys: that.expanded,
                selectedRowKeys: that.selected,
                searchPanel: {
                    visible: true,                
                },
                onToolbarPreparing: function (e) {
                    var toolbarItems = e.toolbarOptions.items;
                    toolbarItems.push({
                        widget: 'dxButton',
                        location: 'before',                        
                        options: {
                            icon: 'add',
                            text: "Add Root",
                            visible: that.permit.addRoot || false,
                            onClick: function () {
                                that.Component.addRow();
                            }
                        },
                        
                    });
                },
                onContextMenuPreparing: function (e) {
                    if (e.row.rowType === "data") {
                        var k = e.component.getKeyByRowIndex(e.row.rowIndex);
                        var numu = e.row.data.NumUser > 0 ? false : true;
                        var defau = e.row.data._default?false:true;
                        var canDel = e.row.data.id>3;
                        e.items = [{
                            text: "Add Child",
                            visible: that.permit.add || false,
                            onItemClick: function () {                           
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
                            visible: numu && (that.permit.delete || false) && canDel,
                            onItemClick: function () {
                                that.Component.deleteRow(e.row.rowIndex);
                            }
                        },{
                            text: "Set Default",
                            beginGroup: true,
                            visible: defau && (that.permit.setDefault || false),
                            onItemClick: function () {                            
                                if (k && (that.permit.setDefault || false)) {
                                    $.ajax({
                                        url: getURL('api/core/roleDefault/setDefault/' + k),
                                        method: "PUT",
                                        data: k                                    
                                    }).done(function () {
                                        //updateDefault(k);
                                        e.component.refresh();                                    
                                    })
                                }
                            }
                        }];
                    }
                },            
                onSelectionChanged: function (e) {
                    that.selected = e.currentSelectedRowKeys; 
                    that.Key = e.currentSelectedRowKeys[0];                 
    
                },                    
                headerFilter: {
                    visible: true
                },
                selection: {
                    mode: "single"
                },
                columns: [
                    {
                        dataField: "role_name",
                        caption: "Name",
                        cellTemplate: function (container, options) {
                            var def = $("<span class='pull-right badge bg-green'>Default</span>");
                            var num = $("<span class='pull-right badge bg-red'>").text(options.data.NumUser);
                            var div = $("<div>").append($("<span>").text(options.value));
                            if (options.data.NumUser > 0) {
                                div.append(num);
                            }                            
                            if (options.data._default==true) {
                                div.append(def);
                            }
                            div.appendTo(container);
                        }
                    }, {
                        dataField: "description",
                        visible: false,
                    }, {
                        dataField: "weight",
                        dataType:"number"
                    }
                    , {
                        dataField: "_active",
                        caption: "Active",
                        width: 90,
                        formItem: {
                            visible: false
                        }
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
                                displayExpr: "role_name",
                                dataSource: that.Data.Store(),
                                contentTemplate: function (e) {
                                    var value = e.component.option("value"),
                                        $treeView = $("<div>").dxTreeView({
                                            dataSource: e.component.option("dataSource"),
                                            dataStructure: "plain",
                                            keyExpr: "id",
                                            parentIdExpr: "parent_id",
                                            selectionMode: "single",
                                            displayExpr: "role_name",
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
    
        }
        this.Init();
        
    };
    
    return Role;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Role;
else
    window.Role = Role;