"use strict";


var KPISaler = (function () {

    var KPISaler = function (options) {
        var options = options || {};
        this.Name = "KPISaler";
        this.Type = "dxTreeList";
        this.id = options.id || (this.Name + (new Date()).getTime());
        this.Component = null;
        this.permit = getACL(this.Name) || { add: false, edit: false, delete: false };
        this.Data = new NCStore({
            url: "api/Accounting/KPIUser",
            key: "id",
            //filter: ["(username eq '" + __USERNAME__ + "' or exists(select id from nc_core_user_role where role_id eq 1 and user_id eq " + __USERID__ + "))"],
            permit: this.permit
        });
        this.Key = null;
        this.MasterUser = null;
        this.formStatus = "none";

        this.Init = function () {
            var that = this;
            var $find = $(that.id);


            if (!$find.length) {
                var scriptTag = document.scripts[document.scripts.length - 1];
                var parentTag = scriptTag.parentNode;
                $find = $("<div id='" + that.id + "'>").appendTo(parentTag);
            }
            
            var treeView;
            var syncTreeViewSelection = function(treeView, value){
                if (!value) {
                    treeView.unselectAll();
                } else {
                    treeView.selectItem(value);
                }
            };
            var getSelectedItemsKeys = function(items) {
                var result = [];
                items.forEach(function(item) {
                    if(item.selected) {
                        result.push(item.key);
                    }
                    if(item.items.length) {
                        result = result.concat(getSelectedItemsKeys(item.items));
                    }
                });
                return result;
            };

            var postionStore = new NCData({
                url: 'api/Accounting/KPIPostion',
                callback: function (a) {
                    a = a.map(x=>Object.assign({
                        code_name: '[' + x.name +'] ' +x.description
                    },x));
                    that.Component.columnOption('postion', 'lookup.dataSource', a);
                }
            });
            var fixZoneStore = [];
            var zoneStore = new NCData({
                url: 'api/Accounting/KPIZone',
                callback: function (a) {
                    that.Component.columnOption('zone', 'lookup.dataSource', a);
                    fixZoneStore = a.map((x)=>{
                        return Object.assign({
                            exp: a.filter(y=>y.parent == x.id).length>0,
                            code_name: '[' + x.name +'] ' +x.description
                        },x);
                    });
                }
            });
            var userStore = new NCData({
                url: 'api/core/user?$select=id,username,lastname,firstname',
                callback: function (a) {
                    for (var i = 0; i < a.length; i++) {
                        a[i].code_name = "[" + a[i].username + "] " + a[i].lastname + " " + a[i].firstname;
                    }
                    that.Component.columnOption('user', 'lookup.dataSource', a);
                }
            });

            

            $find.dxTreeList({
                // stateStoring: {
                //     enabled: true,
                //     type: "localStorage",
                //     storageKey: that.Name,
                // },
                paging: {
                    pageSize: 10
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
                    form:{
                        onDisposing:function(e){
                            that.formStatus = "none";
                        },
                        onInitialized:function(e){
                            //console.log(that.formStatus);
                            e.component.itemOption("Roles","visible",that.formStatus == "edit")
                        },
                        // onContentReady:function(e){
                        //     //console.log(that.formStatus);
                        //     if(that.formStatus=="edit"){
                        //         setTimeout(function(){
                        //             $("#RolesGrid").dxDataGrid("instance").refresh();
                        //         },200);   
                        //     }                                                     
                        // },
                        items: [{
                            itemType: "group",
                            caption: "Saler",
                            colCount: 2,
                            colSpan: 2,
                            items: [
                                "user",
                                "default",
                                "name",
                                "description",
                                "zone",
                                "postion",
                                "from_date",
                                "to_date",
                                "parent",
                                "_active"                                
                            ]
                        },
                            {
                                itemType: "group",
                                name:"Roles",
                                caption: "Roles",
                                colSpan: 2,
                                visible: that.formStatus == "edit",
                                template: function (data, itemElement) {
                                    var temp = $("<div  id='SalesGrid'>").appendTo(itemElement);
                                    $(temp).dxDataGrid({
                                        showRowLines: true,
                                        showBorders: true,                                        
                                        dataSource: new NCStore({
                                            url: "api/Accounting/KPIUser",
                                            key: "id",
                                            filter: ["[user]="+ that.MasterUser],
                                            permit: that.permit
                                        }).Store(),
                                        editing: {
                                            mode: "form",
                                            allowUpdating: that.permit.edit || false,
                                            allowDeleting: that.permit.delete || false,
                                            allowAdding: that.permit.add || false,    
                                        },
                                        onInitNewRow:function(e){
                                            e.data._active = true;
                                            e.data.user = that.MasterUser;     
                                            e.data.postion = 4;                                       
                                        },
                                        columns:[
                                            {
                                                dataField: "id",
                                                visible: false,
                                                formItem: {
                                                    visible: false
                                                }
                                            },  
                                            {                                                
                                                dataField: "zone",
                                                lookup: {
                                                    dataSource: zoneStore.data,
                                                    valueExpr: "id",
                                                    displayExpr: "name"
                                                },
                                                editCellTemplate: function (cellElement, cellInfo) {     
                                                    var temp = $("<div>").appendTo(cellElement);
                                                    $(temp).dxDropDownBox({
                                                        value: cellInfo.value,
                                                        valueExpr: "id",
                                                        displayExpr: "name",                                
                                                        showClearButton: true,
                                                        dataSource: fixZoneStore,
                                                        dropDownOptions:{
                                                            elementAttr: {
                                                                id: "zoneTree",                                        
                                                            }
                                                        },
                                                        contentTemplate: function(e){
                                                            var value = e.component.option("value"),
                                                                $treeView = $("<div>").dxTreeView({
                                                                    //autoExpandAll: true,
                                                                    //expandedRowKeys:[1,2,3],
                                                                    expandedExpr:"exp",
                                                                    dataSource: e.component.option("dataSource"),
                                                                    dataStructure: "plain",
                                                                    keyExpr: "id",
                                                                    parentIdExpr: "parent",
                                                                    selectionMode: "single",
                                                                    displayExpr: "name",
                                                                    selectByClick: true,
                                                                    onContentReady: function(args){
                                                                        syncTreeViewSelection(args.component, value);
                                                                    },
                                                                    selectNodesRecursive: false,
                                                                    onItemSelectionChanged: function(args){
                                                                        var nodes = args.component.getNodes(),
                                                                            value = getSelectedItemsKeys(nodes);                        
                                                                        e.component.option("value", value);
                                                                        //cellInfo.setValue(value);
                                                                    }
                                                                });
                                                            
                                                            treeView = $treeView.dxTreeView("instance");                                                                   
                                                            e.component.on("valueChanged", function(args){
                                                                syncTreeViewSelection(treeView, args.value);
                                                            });
                                                            
                                                            return $treeView;
                                                        },
                                                        onValueChanged:function(e){
                                                            var value = e.value;
                                                            if(Array.isArray(value)){
                                                                if(value[0]){
                                                                    value = value[0];
                                                                }else{
                                                                    value = null;
                                                                }
                                                            }
                                                            cellInfo.setValue(value);
                                                            e.component.close();
                                                        }
                                                    });
                                                }
                                            },
                                            {
                                                dataField: "postion",
                                                lookup: {
                                                    dataSource: postionStore.data,
                                                    valueExpr: "id",
                                                    displayExpr: "name"
                                                }
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
                                                dataField: "_active",
                                                dataType:"boolean"
                                            },                                   
                                        ]
                                    }).dxDataGrid("instance");//.appendTo(itemElement);                             
                                }
                            }
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
                parentIdExpr: "parent",
                columnAutoWidth: true,
                wordWrapEnabled: true,   
                autoExpandAll: false,             
                searchPanel: {
                    visible: true,                
                },
                showBorders:true,
                showRowLines:true,
                onSelectionChanged: function (e) {
                    that.Key = e.currentSelectedRowKeys[0];

                },
                onEditorPreparing: function (e) {
                    if (e.parentType == 'dataRow') {                        
                        if (e.dataField == 'user') {
                            e.editorOptions.onValueChanged = function (args) {
                                if(args.value){
                                    e.setValue(args.value);
                                    var sl = args.component.option("dataSource").store._array.filter(x => x.id == args.value);
                                    if (sl && sl.length > 0) {
                                        var dat = sl[0];
                                        $("#cName").dxTextBox("instance").option("value", dat.username);
                                        $("#cDescription").dxTextBox("instance").option("value", dat.lastname+" "+dat.firstname);
                                    }
                                }
                            }

                        }                        
                    }
                },
                onInitNewRow: function (info) {
                    info.data._active = true;
                    info.data.postion = 4;
                    that.formStatus = "new";
                },
                onEditingStart:function(e){
                    that.formStatus = "edit";
                    that.MasterUser = e.data.user;
                    
                    var grid = e.component;
                    var columns = grid.option("columns");
                    grid.beginUpdate();
                    // columns.forEach(function(column) {
                    //     grid.columnOption(column.dataField, "allowEditing", false);
                    // });
                    grid.columnOption("user", "allowEditing", false);
                    grid.columnOption("name", "allowEditing", false);
                    grid.endUpdate();
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
                        dataField: "user",
                        lookup: {
                            dataSource: userStore.data,
                            valueExpr: "id",
                            displayExpr: "code_name",
                        },
                        // setCellValue: function(newData, value, currentRowData) {
                        //     newData.user = value;
                        //     var sl = userStore.data.filter(x => x.id == value);
                        //     if (sl && sl.length > 0) {
                        //         var dat = sl[0];
                        //         $("#cName").dxTextBox("instance").option("value", dat.username);
                        //         $("#cDescription").dxTextBox("instance").option("value", dat.lastname+" "+dat.firstname);
                        //     }
                        // }
                    },
                    {
                        dataField: "default",
                        dataType: "number",
                        editorOptions: {
                            format: "###,##0",
                        },
                        format: "###,##0",
                        visible: false
                    },
                    {
                        dataField: "name",    
                        editorOptions: {
                            readOnly: true,
                            elementAttr: {
                                id: "cName",
                            },
                            inputAttr: {
                                id: "iName"
                            },
                        },                    
                    }, 
                    {
                        dataField: "description",
                        editorOptions: {
                            readOnly: true,
                            elementAttr: {
                                id: "cDescription",
                            },
                            inputAttr: {
                                id: "iDescription",
                            },
                        }, 
                    }, 
                    // {
                    //     dataField: "zone",
                    //     groupIdex:0,
                    //     lookup: {
                    //         dataSource: zoneStore.data,
                    //         valueExpr: "id",
                    //         displayExpr: "name"
                    //     },
                    //     editCellTemplate: function (cellElement, cellInfo) {     
                    //         var temp = $("<div>").appendTo(cellElement);
                    //         $(temp).dxDropDownBox({
                    //             value: cellInfo.value,
                    //             valueExpr: "id",
                    //             displayExpr: "name",                                
                    //             showClearButton: true,
                    //             dataSource: fixZoneStore,
                    //             dropDownOptions:{
                    //                 elementAttr: {
                    //                     id: "zoneTree",                                        
                    //                 }
                    //             },
                    //             contentTemplate: function(e){
                    //                 var value = e.component.option("value"),
                    //                     $treeView = $("<div>").dxTreeView({
                    //                         //autoExpandAll: true,
                    //                         //expandedRowKeys:[1,2,3],
                    //                         expandedExpr:"exp",
                    //                         dataSource: e.component.option("dataSource"),
                    //                         dataStructure: "plain",
                    //                         keyExpr: "id",
                    //                         parentIdExpr: "parent",
                    //                         selectionMode: "single",
                    //                         displayExpr: "name",
                    //                         selectByClick: true,
                    //                         onContentReady: function(args){
                    //                             syncTreeViewSelection(args.component, value);
                    //                         },
                    //                         selectNodesRecursive: false,
                    //                         onItemSelectionChanged: function(args){
                    //                             var nodes = args.component.getNodes(),
                    //                                 value = getSelectedItemsKeys(nodes);                        
                    //                             e.component.option("value", value);
                    //                             //cellInfo.setValue(value);
                    //                         }
                    //                     });
                                    
                    //                 treeView = $treeView.dxTreeView("instance");                                                                   
                    //                 e.component.on("valueChanged", function(args){
                    //                     syncTreeViewSelection(treeView, args.value);
                    //                 });
                                    
                    //                 return $treeView;
                    //             },
                    //             onValueChanged:function(e){
                    //                 var value = e.value;
                    //                 if(Array.isArray(value)){
                    //                     if(value[0]){
                    //                         value = value[0];
                    //                     }else{
                    //                         value = null;
                    //                     }
                    //                 }
                    //                 cellInfo.setValue(value);
                    //                 e.component.close();
                    //             }
                    //         });
                    //     }
                    // },
                    // {
                    //     dataField: "postion",
                    //     groupIdex:1,
                    //     lookup: {
                    //         dataSource: postionStore.data,
                    //         valueExpr: "id",
                    //         displayExpr: "name"
                    //     }
                    // },       
                    // {
                    //     dataField: "from_date",
                    //     format: "dd/MM/yyyy",
                    //     dataType: "date",
                    //     editorOptions: {
                    //         format: "dd/MM/yyyy",
                    //     }
                    // },
                    // {
                    //     dataField: "to_date",
                    //     format: "dd/MM/yyyy",
                    //     dataType: "date",
                    //     editorOptions: {
                    //         format: "dd/MM/yyyy",
                    //     }
                    // },             
                    {
                        dataField: "_active",
                        dataType:"boolean"
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
                ],                

            });

            that.Component = $find.dxTreeList("instance");

        }

        this.Init();
    }

    return KPISaler;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = KPISaler;
else
    window.KPISaler = KPISaler;