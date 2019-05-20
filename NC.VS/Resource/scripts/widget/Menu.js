"use strict";

var Menu = (function () {

    var Menu = function (options) {
        var options = options || {};        
        this.Name = "Menu";
        this.Type = "dxTreeList";
        this.id = options.id || (this.Name + (new Date()).getTime());
        this.Component = null;
        this.permit =getACL(this.Name) || {
            add: false, edit: false, delete: false, addRoot: false, setHome: false,
            addRole: false, editRole: false, deleteRole: false,
            addUser: false, editUser: false, deleteUser: false,
        };
        this.Data = new NCStore({ url: 'api/core/menu', key: "id" ,permit: this.permit});
        this.Key = null;

        this.Init = function () {
            var that = this;
            var $find = $(that.id);
            
            if(!$find.length){
                var scriptTag = document.scripts[document.scripts.length - 1];
                var parentTag = scriptTag.parentNode;
                $find = $("<div id='"+that.Id+"'>").appendTo(parentTag);
            }
            
    
            var arrayStore;
            var pageStore;
            var menuId;
            var userId;
            var roleId;
            var gridId;
            var userStore;
            var roleStore;
            var selectRole;
            var isLoadUser = false;
            var isLoadRole = false;
            var selectedUser = [];
            var selectedRole = [];
    
            var menuUserStore;
            var menuRoleStore;
    
            var treeView;
    
            //load all page
            pageStore = new NCData({
                url:"api/core/page",
                callback:function(a){
                    if (gridId) {
                        gridId.beginUpdate();
                        gridId.columnOption('pageid', 'lookup.dataSource', a);
                        gridId.endUpdate();
                    }
                }
            });
            //load all user
            userStore = new NCData({
                url:"api/core/user",
                callback:function(a){
                    if (userId) {    
                        userId.dxDataGrid("instance").beginUpdate();
                        userId.dxDataGrid("instance").columnOption('user_id', 'lookup.dataSource', a);
                        userId.dxDataGrid("instance").endUpdate();
                    }
                }
            });

           //load all role
            roleStore = new NCData({
                url: "api/core/role",
                callback: function (a) {
                    if (roleId) {
                        roleId.dxDataGrid("instance").beginUpdate();
                        roleId.dxDataGrid("instance").columnOption('role_id', 'lookup.dataSource', a);
                        roleId.dxDataGrid("instance").endUpdate();
                    }
                }
            });
            
           
            var syncTreeViewSelection = function (treeView, value) {
                if (!value) {
                    treeView.unselectAll();
                } else {
                    treeView.selectItem(value);
                }
            };
    
            $find.dxTreeList({
                dataSource: {
                    key: "id",
                    load: function () {
                        if (arrayStore) {
                            return arrayStore.load();
                        } else {
                            return $.ajax({
                                url: getURL('api/core/menu'),
                                method: "GET"
                            }).done(function (data) {
                                arrayStore = new DevExpress.data.ArrayStore({
                                    key: "id",
                                    data: data
                                });
                            });
                        }
                    },
                    update: function (key, values) {
                        if (values.Roles == "CHANGE") {
                            //clear old
                            $.ajax({
                                url: getURL('api/core/menurole/' + key),
                                method: "DELETE"
                            }).done(function (data) {
                                //add new
                                for (var i = 0; i < menuRoleStore._array.length; i++) {
                                    var dat = menuRoleStore._array[i];
                                    var al = dat.allow == true ? 1 : 0;
                                    var de = dat.deny == true ? 1 : 0;
                                    var tmp = { menu_id: key, role_id: dat.role_id, allow: al, deny: de };
                                    $.ajax({
                                        url: getURL('api/core/menurole'),
                                        method: "POST",
                                        data: tmp,
                                    }).done(function (data) {
    
                                    });
                                }
                            });
                            delete values.Roles;
                        }
                        if (values.Users == "CHANGE") {
                            //clear old
                            $.ajax({
                                url: getURL('api/core/menuuser/' + key),
                                method: "DELETE"
                            }).done(function (data) {
                                //add new
                                for (var i = 0; i < menuUserStore._array.length; i++) {
                                    var dat = menuUserStore._array[i];
                                    var al = dat.allow == true ? 1 : 0;
                                    var de = dat.deny == true ? 1 : 0;
                                    var tmp = { menu_id: key, user_id: dat.user_id, allow: al, deny: de };
                                    $.ajax({
                                        url: getURL('api/core/menuuser'),
                                        method: "POST",
                                        data: tmp,
                                    }).done(function (data) {
    
                                    });
                                }
                            });
                            delete values.Users;
                        }
                        if (Object.keys(values).length > 0) {
                            return $.ajax({
                                url: getURL('api/core/menu/put/' + key),
                                method: "PUT",
                                data: values
                            }).done(function () {
                                arrayStore.update(key, values);
                            })
                        }
                    },
                    insert: function (values) {
                        //var list = $("#gridContainer").dxDataGrid("instance");
                        var datapost = values;
                        var userChange = false;
                        var roleChange = false;
                        if (datapost.Roles == "CHANGE") {
                            delete datapost.Roles;
                            roleChange = true;
                        }
                        if (datapost.Users == "CHANGE") {
                            userChange = true;
                            delete datapost.Users;
                        }
                        return $.ajax({
                            url: getURL('api/core/menu'),
                            method: "POST",
                            data: datapost
                        }).done(function (e) {
                            datapost.id = e[0].id;
                            var key = e[0].id;
                            arrayStore.insert(datapost);
                            if (roleChange) {
                                //add new
                                for (var i = 0; i < menuRoleStore._array.length; i++) {
                                    var dat = menuRoleStore._array[i];
                                    var al = dat.allow == true ? 1 : 0;
                                    var de = dat.deny == true ? 1 : 0;
                                    var tmp = { menu_id: key, role_id: dat.role_id, allow: al, deny: de };
                                    $.ajax({
                                        url: getURL('api/core/menurole'),
                                        method: "POST",
                                        data: tmp,
                                    }).done(function (data) {
    
                                    });
                                }
                            }
                            if (userChange) {
                                //add new
                                for (var i = 0; i < menuUserStore._array.length; i++) {
                                    var dat = menuUserStore._array[i];
                                    var al = dat.allow == true ? 1 : 0;
                                    var de = dat.deny == true ? 1 : 0;
                                    var tmp = { menu_id: key, user_id: dat.user_id, allow: al, deny: de };
                                    $.ajax({
                                        url: getURL('api/core/menuuser'),
                                        method: "POST",
                                        data: tmp,
                                    }).done(function (data) {
    
                                    });
                                }
                            }
                        })
                    },
                    remove: function (key) {
                        
                            //clear old
                            $.ajax({
                                url: getURL('api/core/menuuser/' + key),
                                method: "DELETE"
                            }).done(function (data) { });
                        
                            //clear old
                            $.ajax({
                                url: getURL('api/core/menurole/' + key),
                                method: "DELETE"
                            }).done(function (data) { });
                        
    
                        return $.ajax({
                            url: getURL('api/core/menu/' + key),
                            method: "DELETE"
                        }).done(function () {
                            arrayStore.remove(key);
                        })
                    }
                },
                keyExpr: "id",
                parentIdExpr: "parent_id",
                columnAutoWidth: true,
                wordWrapEnabled: true,
                autoExpandAll: true,
                columns: [{
                    dataField: "id",
                    allowEditing: false,
                    formItem: {
                        visible: false,
                    },
                    visible: false,
                },
                {
                    dataField: "title",
                    sortOrder: "asc",
                    cellTemplate: function (cellElement, cellInfo) {
                        cellElement.append("<i class='fa " + cellInfo.data.icon + "' style='padding-right:10px'>").append(cellInfo.value);
                        var def = $("<span class='pull-right badge bg-green'>").append("<i class='fa fa-home'>");
                        if(cellInfo.data.home)
                            cellElement.append(def);
                    },
                    validationRules: [{ type: "required" }],
                },
                {
                    dataField: "pageid",
                    caption: "Page",
                    lookup: {
                        dataSource: function (option) {
                            return pageStore;
                        },
                        valueExpr: "id",
                        displayExpr: "page_name"
                    },
                },
                {
                    dataField: "parent_id",
                    caption: "Parent",
                    lookup: {
                        dataSource: function (options) {
                            return {
                                store: arrayStore,
                                filter: null,
                            };
                        },
                        valueExpr: "id",
                        displayExpr: "title"
                    },
                    visible: false,
                },
                {
                    dataField: "order",
                },
                {
                    dataField: "icon",
                    cellTemplate: function (cellElement, cellInfo) {
                        cellElement.append("<i class='fa " + cellInfo.value + "' style='padding-right:10px'>").append(cellInfo.value);
                    },
                    visible: false,
                    editCellTemplate: function (cellElement, cellInfo) {
                        var div = document.createElement("div");
                        cellElement.get(0).appendChild(div);
                        $(div).dxSelectBox({
                            dataSource: new DevExpress.data.DataSource({
                                store: icons,
                                key: "id",
                                group: "group",
                                paginate: true,
                            }),
                            valueExpr: "name",
                            value: cellInfo.value,
                            onValueChanged: function (e) {
                                cellInfo.setValue(e.value);
                            },
                            displayExpr: "name",
                            itemTemplate: function (data) {
                                return "<i class='fa " + data.name + " pull-right'></i>" + data.name;
                            },
                            searchEnabled: true,
                            searchExpr: ["name","group"],
                            grouped: true,
                        });
                    }
    
                },
                {
                    dataField: "Users",
                    visible: false,
                    editCellTemplate: function (cellElement, cellInfo) {
                        var div = document.createElement("div");
                        cellElement.get(0).appendChild(div);
                        userId = $(div).dxDataGrid({
                            dataSource: {
                                key: "id",
                                load: function () {
                                    if (menuUserStore) {
                                        return menuUserStore.load();
                                    } else {
                                        return $.ajax({
                                            url: getURL('api/core/menuuser?$filter=menu_id eq ' + menuId),
                                            method: "GET",
                                            data: { menuId: menuId }
                                        }).done(function (data) {
                                            menuUserStore = new DevExpress.data.ArrayStore({
                                                key: "id",
                                                data: data
                                            });
                                        });
                                    }
                                },
                                insert: function (values) {
                                    var datapost = values;
                                    if (menuId)
                                        datapost.menu_id = menuId;
                                    menuUserStore.insert(datapost);
                                    cellInfo.setValue("CHANGE");
                                },
                                remove: function (key) {
                                    menuUserStore.remove(key);
                                    cellInfo.setValue("CHANGE");
                                }, update: function (key, values) {
                                    menuUserStore.update(key, values);
                                    cellInfo.setValue("CHANGE");
                                },
                            },
                            onInitNewRow: function (e) {
                                e.data.menu_id = menuId;
                                e.data.deny = true;
                                e.data.allow = false;
                            },
                            columnAutoWidth: true,
                            showBorders: true,
                            showRowLines: true,
                            wordWrapEnabled: true,
                            searchPanel: {
                                visible: true,
    
                            },
                            editing: {
                                mode: "cell",
                                allowUpdating: that.permit.editUser || false,
                                allowDeleting: that.permit.deleteUser || false,
                                allowAdding: that.permit.addUser || false
                            },
                            headerFilter: {
                                visible: true
                            },
                            columns: [
                                {
                                    dataField: "user_id",
                                    caption: "User",
                                    lookup: {
                                        dataSource: userStore.data,
                                        valueExpr: "id",
                                        displayExpr: "username"
                                    }
    
                                },
                                {
                                    dataField: "allow",
                                    dataType: "boolean",
                                    setCellValue: function (newData, value, currentRowData) {
                                        newData.allow = value;
                                        if (value && currentRowData.deny) {
                                            newData.deny = false;
                                        }
                                    }
                                },
                                {
                                    dataField: "deny",
                                    dataType: "boolean",
                                    setCellValue: function (newData, value, currentRowData) {
                                        newData.deny = value;
                                        if (value && currentRowData.allow) {
                                            newData.allow = false;
                                        }
                                    }
                                }
                            ],
                        })
                    }
                },
                {
                    dataField: "Roles",
                    visible: false,
                    editCellTemplate: function (cellElement, cellInfo) {
                        var div = document.createElement("div");
                        cellElement.get(0).appendChild(div);
                        roleId = $(div).dxDataGrid({
                            dataSource: {
                                key: "id",
                                load: function () {
                                    if (menuRoleStore) {
                                        return menuRoleStore.load();
                                    } else {
                                        return $.ajax({
                                            url: getURL('api/core/menurole?$filter=menu_id eq ' + menuId),
                                            method: "GET",
                                            data: { menuId: menuId }
                                        }).done(function (data) {
                                            menuRoleStore = new DevExpress.data.ArrayStore({
                                                key: "id",
                                                data: data
                                            });
                                        });
                                    }
                                },
                                insert: function (values) {
                                    var datapost = values;
                                    if (menuId)
                                        datapost.menu_id = menuId;
                                    menuRoleStore.insert(datapost);
                                    cellInfo.setValue("CHANGE");
    
                                },
                                remove: function (key) {
                                    menuRoleStore.remove(key);
                                    cellInfo.setValue("CHANGE");
                                }, update: function (key, values) {
                                    menuRoleStore.update(key, values);
                                    cellInfo.setValue("CHANGE");
                                },
                            },
                            onInitNewRow: function (e) {
                                e.data.menu_id = menuId;
                                e.data.deny = true;
                                e.data.allow = false;
                            },
                            columnAutoWidth: true,
                            showBorders: true,
                            showRowLines: true,
                            wordWrapEnabled: true,
                            searchPanel: {
                                visible: true,
    
                            },
                            editing: {
                                mode: "cell",
                                allowUpdating: that.permit.editRole || false,
                                allowDeleting: that.permit.deleteRole || false,
                                allowAdding: that.permit.addRole || false
                            },
                            headerFilter: {
                                visible: true
                            },
                            columns: [
                                {
                                    dataField: "role_id",
                                    caption: "Role",
                                    lookup: {
                                        dataSource: roleStore.data,
                                        valueExpr: "id",
                                        displayExpr: "role_name"
                                    },
                                    editCellTemplate: function (cellElement, cellInfo) {
                                        var div = document.createElement("div");
                                        cellElement.get(0).appendChild(div);
                                        $(div).dxDropDownBox({
                                            value: cellInfo.value,
                                            valueExpr: "id",
                                            displayExpr: "role_name",
                                            dataSource: roleStore,
                                            contentTemplate: function (e) {
                                                var value = e.component.option("value"),
                                                    $treeView = $("<div>").dxTreeView({
                                                        dataSource: roleStore.data,
                                                        dataStructure: "plain",
                                                        keyExpr: "id",
                                                        parentIdExpr: "parent_id",
                                                        selectionMode: "single",
                                                        displayExpr: "role_name",
                                                        selectByClick: true,
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
    
                                                treeView = $treeView.dxTreeView("instance");
    
                                                e.component.on("valueChanged", function (args) {
                                                    syncTreeViewSelection(treeView, args.value);
                                                    if (args.value.length > 0)
                                                        cellInfo.setValue(args.value[0]);
                                                });
    
                                                return $treeView;
                                            }
                                        });    
                                        
                                    }
                                },
                                {
                                    dataField: "allow",
                                    dataType: "boolean",
                                    setCellValue: function (newData, value, currentRowData) {
                                        newData.allow = value;
                                        if (value && currentRowData.deny) {
                                            newData.deny = false;
                                        }
                                    }
                                },
                                {
                                    dataField: "deny",
                                    dataType: "boolean",
                                    setCellValue: function (newData, value, currentRowData) {
                                        newData.deny = value;
                                        if (value && currentRowData.allow) {
                                            newData.allow = false;
                                        }
                                    }
                                }
                            ],
                        })
                    }
                }
                ],
                editing: {
                    mode: "form",
                    //allowUpdating: that.permit.edit || false,
                    //allowDeleting: that.permit.delete || false,
                    //allowAdding: that.permit.add || false,
                    form: {
                        colCount: 1,
                        items: [{
                            itemType: "tabbed",
                            tabPanelOptions: {
                                deferRendering: false
                            },
                            tabs: [{
                                title: "Menu Infomations",
                                colCount: 2,
                                items: [
                                    "title",
                                    "pageid",
                                    "order",
                                    "icon",
                                    "parent_id",
                                ]
                            }, {
                                title: "Roles",
                                items: [{
                                    dataField: "Roles",
                                    label: {
                                        visible: false
                                    },
                                }]
                            }, {
                                title: "Users",
                                items: [{
                                    dataField: "Users",
                                    label: {
                                        visible: false
                                    },
                                }]
                            }]
                        }]
                    }
    
                },
                selection: {
                    mode: "single"
                },
                onSelectionChanged: function (selectedItems) {
                    var data = selectedItems.selectedRowsData[0];
                    if (data) {
                        menuId = data.id;
                    }
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
                        var numu = e.row.data.NumUser > 0 ? false : true;
                        var isHome = e.row.data.home;
                        var k = e.component.getKeyByRowIndex(e.row.rowIndex);
                        e.items = [{
                            text: "Add Child",
                            visible: that.permit.add || false,
                            onItemClick: function () {                                                                
                                if (k)
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
                            visible: (that.permit.delete || false) && numu,                            
                            onItemClick: function () {
                                that.Component.deleteRow(e.row.rowIndex);
                            }
                        },{
                            text: "Set Home",
                            beginGroup:true,
                            visible: (that.permit.setHome || false) && !isHome,
                            onItemClick: function(){
                                if (k && (that.permit.setHome || false)) {
                                    $.ajax({
                                        url: getURL('api/core/menuHome/setHome/' + k),
                                        method: "PUT",
                                        data: k                                    
                                    }).done(function () { 
                                        for(var i =0; i< arrayStore._array.length;i++){
                                            if(arrayStore._array[i].home){
                                                arrayStore._array[i].home = false;
                                            }
                                        }
                                        arrayStore.update(k, {home:true});                                       
                                        e.component.refresh();                                    
                                    })
                                }
                            }
                        }
                    ];
                    }
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
                paging: {
                    pageSize: 10
                },
                onEditingStart: function (e) {
                    menuId = e.data.id;
                    menuRoleStore = null;
                    menuUserStore = null;
                },
                onInitNewRow: function (e) {
                    menuId = 0;
                    menuRoleStore = null;
                    menuUserStore = null;
                    e.data.page_id = 0;
                }
            });
            that.Component = $find.dxTreeList("instance");
            gridId = that.Component;
    
        };
        this.Init();
    }

    
    return Menu;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Menu;
else
    window.Menu = Menu;