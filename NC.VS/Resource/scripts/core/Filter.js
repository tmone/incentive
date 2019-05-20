"use strict";


var Filter = (function () {

    var Filter = function(options){
        var options = options || {};
        this.Name = "Filter";
        this.Type = "dxDataGrid";
        this.id = options.id || (this.Name + (new Date()).getTime());
        this.Component = null;
        this.permit = getACL(this.Name) || {
            add: false, edit: false, delete: false, 
            addRole: false, editRole: false, deleteRole: false,
            addUser: false, editUser: false, deleteUser: false,
        };
        this.Data = new NCStore({url:'api/core/filter',key:"id",permit:this.permit});
        this.Key = null;
        
        this.Init = function(){
            var that = this;
            var $find = $(that.id);
            
            if(!$find.length){
                var scriptTag = document.scripts[document.scripts.length - 1];
                var parentTag = scriptTag.parentNode;
                $find = $("<div id='"+that.id+"'>").appendTo(parentTag);
            }

            var tableStore = new NCData({
                url:'api/core/filter/getTable',
                callback:function(a){
                    that.Component.columnOption("table_name","lookup.dataSource",a);
                  
                }

            });

            var FilterId;
            var FilterValue;
            var Columns = [];

            var DataColumn = {};

            var columnCount = 0;

            var menuId;
            var arrayStore;
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

            //load all user
            userStore = new NCData({
                url: "api/core/user",
                callback: function (a) {
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

            var appStore = new NCData({
                url:'api/core/app',
                callback:function(a){
                    that.Component.columnOption("app_id","lookup.dataSource",a);
                }
            });

            var orgStore = new NCData({url:'api/core/orgchart'});

            var syncTreeViewSelection = function (treeView, value) {
                if (!value) {
                    treeView.unselectAll();
                } else {
                    treeView.selectItem(value);
                }
            };
            var cColumn = [];
            var strSql;
            function getColumn(tableName){
                var columnStore = new NCData({
                    url:'api/core/filter/getColumn?n='+tableName,
                    callback:function(a){    
                        cColumn = a;                    
                        BuildColumn(a);
                    }
                });
            }

            function setFilter(){
                try{
                    if(FilterId)
                        FilterId.option("value",FilterValue);                    
                        return FilterValue;
                }catch{
                    DevExpress.ui.notify("Some column name in table is changed. Please resetting again","error",2000);
                    if(FilterId)
                        FilterId.option("value",[]);
                    return [];
                }
            }

            function BuildColumn(A){
                DataColumn = {};
                Columns = [];
                for(var i =0; i< A.length; i++){
                    var tmp = A[i];
                    var nColumn = {};
                    nColumn.dataField = tmp.column_name.replace("~",".");
                    nColumn.caption = tmp.title;
                    if(tmp.column_name.includes('.org_id')){
                        nColumn.filterOperations = [ "=", "<>", "isblank", "isnotblank", "anyof"];
                    }

                    var ct = tmp.column_type;
                    if(
                        ct == "int" 
                        || ct == "bigint" 
                        || ct == "decimal" 
                        || ct == "float" 
                        || ct == "money" 
                        || ct == "numberic" 
                        || ct == "smallint"
                        || ct == "tinyint"
                        || ct == "smallmoney"
                    ){
                        nColumn.dataType = "number";
                    }else if(
                        ct == "date"
                        || ct == "time"
                        || ct == "datetime"
                        || ct == "smalldatetime"
                    ){
                        nColumn.dataType = "datetime"
                    }else if(
                        ct=="bit"
                    ){
                        nColumn.dataType = "boolean"
                    }

                    if((tmp.lookup && tmp.lookup.length>0) || tmp.column_name == "org_id"){
                        columnCount++;
                        var sspl = tmp.lookup || "api/core/orgchart;org_name;id";
                        var spl = sspl.split(";");
                        
                        nColumn.lookup = {dataSource:[],valueExpr:spl[2],displayExpr:spl[1]};
                        var rDat = new NCData({
                            url:spl[0],
                            byref:nColumn,
                            callback:function(e,byref){
                                byref.lookup.dataSource = e;
                                Columns.push(byref);
                                if(--columnCount<1){
                                    //update filter
                                    FilterId.option("fields",Columns);
                                    setFilter();
                                }
                            }
                        });                        
                    }else{
                        Columns.push(nColumn);
                    }                    
                }
            }

            var findC = function(cl){
                for(var i =0; i< cColumn.length; i++){
                    if( cColumn[i].column_name == cl){
                        return cColumn[i];
                    }
                }
                return null;
            }

            var dynamicItemFilter = function(str){
                var rs = null;
                if(!str)
                    return null;
                rs = str.replace(/\(([A-Za-z0-9_]+.Item._)([0-9]+)([^\)]+)\)/g,function(st,p1,p2,p3){
                    return "(property_id=" + p2 + " and [value] "+p3+")";
                });

                rs = rs.replace(/\(_([0-9]+)([^\)]+)\)/g,function(st,p1,p2,p3){
                    return "(property_id=" + p1 + " and [value] "+p2+")";
                });
                return rs;
            }

            var SqlBuilder  = function(a){
                if(a==null)
                    return null;
                if(Array.isArray(a) && a.length == 3){
                    var cl = findC(a[0]);
                    if(cl && cl.extent_filter && cl.extent_filter.length >0){
                        var str = cl.extent_filter;
                        var newArr = [];
                        newArr[0] = "_TMP_";
                        for(var i =1; i< a.length;i++){
                            newArr.push(a[i]);
                        }
                        var rs = SqlBuilder(newArr);
                        rs = rs.replace("_TMP_",cl.column_name);
                        str = str.replace("{0}",rs);                     


                        return str;
                    }

                    if(a[1] == "anyof"){
                        return "(" + SqlBuilder(a[0]) + " in (" + a[2].join(',')+"))";
                    }
                    if(a[1] == "between"){
                        return "(" + SqlBuilder(a[0]) + " BETWEEN " + a[2].map(
                            x => ((x.getTime)||(/[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z/.test(x)) )? "convert(datetime,''"+ x.toJSON()+"'',127')":x
                        ).join(' AND ')+")";
                    }
                    if(a[1] == 'contains'){
                        return "(" + SqlBuilder(a[0]) + " like N''%" + SqlBuilder(a[2]) +"%'')";
                    }
                    if(a[1] == 'notcontains'){
                        return " not (" + SqlBuilder(a[0]) + " like N''%" + SqlBuilder(a[2]) +"%'')";
                    }
                    if(a[1] == 'startswith'){
                        return " (" + SqlBuilder(a[0]) + " like N''" + SqlBuilder(a[2]) +"%'')";
                    }
                    if(a[1] == 'endswith'){
                        return " not (" + SqlBuilder(a[0]) + " like N''%" + SqlBuilder(a[2]) +"'')";
                    }
                    if(a[1] == 'startswith'){
                        return " (" + SqlBuilder(a[0]) + " like N''" + SqlBuilder(a[2]) +"%'')";
                    }
                    
                    return "("+SqlBuilder(a[0]) + " " + a[1] + " " +  SqlBuilder(a[2])  +")"   ; 
                }
                if(Array.isArray(a) && a.length < 3){
                    var cl = findC(a[0]);
                    if(cl && cl.extent_filter && cl.extent_filter.length >0){
                        var str = cl.extent_filter;
                        var newArr = [];
                        newArr[0] = "_TMP_";
                        for(var i =1; i< a.length;i++){
                            newArr.push(a[i]);
                        }
                        var rs = SqlBuilder(newArr);
                        rs = rs.replace("_TMP_",cl.column_name);
                        str = str.replace("{0}",rs);
                        return str;
                    }
                }
                if(Array.isArray(a) && a.length > 3){
                    var rs ="";
                    for(var i =0; i< a.length; i++){
                        rs = rs +" " + SqlBuilder(a[i]);
                    }
                    return "("+rs+")";
                }
                
                if(a.getTime){
                    return "convert(datetime,''" + a.toJSON() +"'',127)";
                }
                if (/[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z/.test(a)) {
                    return "convert(datetime,''" + a +"'',127)";
                }

                return ""+a;
                
            }
            var formId;
            var sqlId;

            $find.dxDataGrid({
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
                dataSource: {
                    key: "id",
                    load: function () {
                        if (arrayStore) {
                            return arrayStore.load();
                        } else {
                            return $.ajax({
                                url: getURL('api/core/filter'),
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
                                url: getURL('api/core/filter/clearRole/' + key),
                                method: "DELETE"
                            }).done(function (data) {
                                //add new
                                for (var i = 0; i < menuRoleStore._array.length; i++) {
                                    var dat = menuRoleStore._array[i];
                                    var al = dat.allow == true ? 1 : 0;
                                    var de = dat.deny == true ? 1 : 0;
                                    var tmp = { filter_id: key, role_id: dat.role_id, allow: al, deny: de };
                                    $.ajax({
                                        url: getURL('api/core/FilterRole'),
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
                                url: getURL('api/core/filter/clearUser/' + key),
                                method: "DELETE"
                            }).done(function (data) {
                                //add new
                                for (var i = 0; i < menuUserStore._array.length; i++) {
                                    var dat = menuUserStore._array[i];
                                    var al = dat.allow == true ? 1 : 0;
                                    var de = dat.deny == true ? 1 : 0;
                                    var tmp = { filter_id: key, user_id: dat.user_id, allow: al, deny: de };
                                    $.ajax({
                                        url: getURL('api/core/FilterUser'),
                                        method: "POST",
                                        data: tmp,
                                    }).done(function (data) {

                                    });
                                }
                            });
                            delete values.Users;
                        }
                        if (Object.keys(values).length > 0) {
                            if(Object.keys(values).join('').includes('filter_dx'))                           
                                values.filter_sql = strSql;
                            return $.ajax({
                                url: getURL('api/core/filter/put/' + key),
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
                        if(Object.keys(datapost).join('').includes('filter_dx'))                           
                            datapost.filter_sql = strSql;                    
                        return $.ajax({
                            url: getURL('api/core/filter'),
                            method: "POST",
                            data: datapost
                        }).done(function (e) {
                            datapost.id = e[0].id;
                            var key = e[0].id;
                            menuId = key;
                            arrayStore.insert(datapost);
                            if (roleChange) {
                                //add new
                                for (var i = 0; i < menuRoleStore._array.length; i++) {
                                    var dat = menuRoleStore._array[i];
                                    var al = dat.allow == true ? 1 : 0;
                                    var de = dat.deny == true ? 1 : 0;
                                    var tmp = { filter_id: key, role_id: dat.role_id, allow: al, deny: de };
                                    $.ajax({
                                        url: getURL('api/core/FilterRole'),
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
                                    var tmp = { filter_id: key, user_id: dat.user_id, allow: al, deny: de };
                                    $.ajax({
                                        url: getURL('api/core/FilterUser'),
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
                            url: getURL('api/core/filter/clearRole/' + key),
                            method: "DELETE"
                        }).done(function (data) { });

                        //clear old
                        $.ajax({
                            url: getURL('api/core/filter/clearUser/' + key),
                            method: "DELETE"
                        }).done(function (data) { });


                        return $.ajax({
                            url: getURL('api/core/filter/' + key),
                            method: "DELETE"
                        }).done(function () {
                            arrayStore.remove(key);
                        })
                    }
                },
                editing: {
                    mode: "form",
                    allowUpdating: that.permit.edit || false,
                    allowDeleting: that.permit.delete || false,
                    allowAdding: that.permit.add || false,
                    form: {
                        colCount:1,
                        onInitialized:function(e){
                            formId = e.component;
                        },
                        items: [{
                            itemType: "tabbed",
                            tabPanelOptions: {
                                deferRendering: false
                            },
                            tabs: [{
                                title: "Filter Table",
                                colCount: 2,
                                items: [
                                    "table_name",
                                    "description",
                                    "filter_dx",
                                    "_active",                                                                        
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
                searchPanel: {
                    visible: true,                
                    placeholder: "Search..."
                },
                headerFilter: {
                    visible: true
                },
                showRowLines: true,
                showBorders: true,
                groupPanel: {
                    visible: true
                },
                onEditorPreparing: function(e) {          
                    if (e.parentType == "dataRow" && e.dataField == "table_name") {            
                      e.editorOptions.grouped = true;
                      e.editorOptions.dataSource.group = "app_name";
                    }      
                    if (e.parentType == "dataRow" && e.dataField == "filter_sql") {            
                        sqlId = e;
                      }                
                },
                onSelectionChanged: function (e) {
                    that.Key = e.currentSelectedRowKeys[0];   
                    menuId = that.Key; 
                          
                },
                onEditingStart: function (e) {
                    menuId = e.data.id;
                    menuRoleStore = null;
                    menuUserStore = null;
                    getColumn(e.data.table_name);
                },
                onInitNewRow: function (e) {
                    menuId = 0;
                    e.data._active = true;
                    menuRoleStore = null;
                    menuUserStore = null; 
                    strSql = null;                   
                },
                columns: [
                    {
                        dataField:"app_id",
                        caption:"App",
                        lookup:{
                            dataSource: appStore.data,
                            valueExpr:"id",
                            displayExpr:"app_name",                            
                        },
                        groupIndex:0,
                    },
                    {
                        dataField:"table_name",
                        caption:"Table",
                        lookup:{
                            dataSource: tableStore.data,
                            valueExpr:"table_name",
                            displayExpr:"title",                            
                        },
                        setCellValue: function(newData, value, currentRowData) {
                            newData.table_name = value;
                            getColumn(value);
                        }
                    },
                    {
                        dataField:"description",
                    },
                    {
                        dataField:"filter_dx",
                        editCellTemplate: function (cellElement, cellInfo) {
                            var div = document.createElement("div");
                            cellElement.get(0).appendChild(div);
                            

                            if( typeof cellInfo.value === 'string'  && cellInfo.value.length>0) {
                                FilterValue = JSON.parse(cellInfo.value);
                            }else{
                                FilterValue = cellInfo.value
                            }
                            FilterId = $(div).dxFilterBuilder({
                                height: 150,
                                allowHierarchicalFields:true,
                                value: [],
                                fields: Columns,
                                onValueChanged: function (e) {
                                    if(e.value){
                                        cellInfo.setValue(JSON.stringify(e.value));
                                        //console.log(e.value);
                                        //console.log(SqlBuilder(e.value,cColumn));   
                                        //var editor = formId.getEditor("filter_sql");  
                                        //editor.setValue("abc");
                                        //editor.option("value",SqlBuilder(e.value,cColumn))  ;  
                                        //formId.updateData("filter_sql",SqlBuilder(e.value,cColumn)) ;  
                                        strSql = dynamicItemFilter(   SqlBuilder(e.value.slice(0),cColumn));  
                                        //sqlId.component.cellValue(cellInfo.rowIndex, 'filter_sql',  dynamicItemFilter(   SqlBuilder(e.value.slice(0),cColumn)));
                                    }else{
                                        cellInfo.setValue(null);
                                        //e.component.cellValue(cellInfo.rowIndex,"filter_sql",null);
                                        strSql = null;
                                    }                    
                                },
                                customOperations: [{
                                    name: "anyof",
                                    caption: "Is any of",
                                    icon: "check",
                                    editorTemplate: function(conditionInfo) {

                                        var treeView, dataGrid;
    
                                        var syncTreeViewSelection = function(treeView, value){
                                            if (!value) {
                                                treeView.unselectAll();
                                                return;
                                            }
                                            
                                            value.forEach(function(key){
                                                treeView.selectItem(key);
                                            });
                                        };

                                       

                                        var orgId = $("<div>").dxDropDownBox({                                            
                                            valueExpr: "id",
                                            displayExpr: "org_name",
                                            value: conditionInfo.value,
                                            dataSource: orgStore.data,
                                            contentTemplate: function(e){
                                                var value = e.component.option("value"),
                                                    $treeView = $("<div>").dxTreeView({
                                                        dataSource: e.component.option("dataSource"),
                                                        dataStructure: "plain",
                                                        keyExpr: "id",
                                                        parentIdExpr: "parent_id",
                                                        selectionMode: "multiple",
                                                        displayExpr: "org_name",
                                                        selectByClick: true,
                                                        onContentReady: function(args){
                                                            syncTreeViewSelection(args.component, value);
                                                        },
                                                        selectNodesRecursive: true,
                                                        showCheckBoxesMode: "normal",
                                                        onItemSelectionChanged: function(args){
                                                            var value = args.component.getSelectedNodesKeys();
                                                            e.component.close();
                                                            //e.component.option("value", value);
                                                            conditionInfo.setValue(value);
                                                        }
                                                    });
                                                
                                                treeView = $treeView.dxTreeView("instance");
                                                
                                                e.component.on("valueChanged", function(args){
                                                    var value = args.value;
                                                    syncTreeViewSelection(treeView, value);
                                                });
                                                
                                                return $treeView;
                                            },


                                            onValueChanged: function(e) {
                                                conditionInfo.setValue(e.value);
                                            },
                                            width: "auto",                                            
                                        });
                                        return orgId;
                                    },
                                    calculateFilterExpression: function(filterValue, field) {
                                        if(filterValue && filterValue.length > 0) {
                                            var result = [],
                                                lastIndex = filterValue.length - 1;
                                            filterValue.forEach(function(value, index) {
                                                result.push([field.dataField, "=", value]);
                                                index !== lastIndex && result.push("or");                        
                                            });
                                            return result;
                                        }
                                    }
                                }],

                            }).dxFilterBuilder("instance");
                        },        
                                      
                    },
                    {
                        dataField:"filter_sql",                        
                    },
                    {
                        dataField:"_active",
                        caption:"Active"       ,
                        dataType:"boolean"                 
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
                                                url: getURL('api/core/filterUser?$filter=filter_id eq ' + menuId),
                                                method: "GET",
                                                data: { filter_id: menuId }
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
                                            datapost.filter_id = menuId;
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
                                    e.data.filter_id = menuId;
                                    e.data._active = true;                                    
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
                                        dataField: "_active",
                                        caption:"Active",
                                        dataType: "boolean",                                        
                                    },                                    
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
                                                url: getURL('api/core/filterRole?$filter=filter_id eq ' + menuId),
                                                method: "GET",
                                                data: { filter_id: menuId }
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
                                            datapost.filter_id = menuId;
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
                                    e.data.filter_id = menuId;
                                    e.data._active = true;                                    
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
                                                                e.component.close();
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
                                        dataField: "_active",
                                        caption:"Active",
                                        dataType: "boolean",                                        
                                    },                                    
                                ],
                            })
                        }
                    }
                ],
            });
    
    
            that.Component = $find.dxDataGrid("instance");
    
        }

        this.Init();
    }
    
    return Filter;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Filter;
else
    window.Filter = Filter;