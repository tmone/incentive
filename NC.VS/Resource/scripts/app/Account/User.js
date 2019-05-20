"use strict";

var User = (function () {

    var User = function (options) {
        var options = options || {};
        this.Name = "UserManager";
        this.Type = "dxDataGrid";
        this.id = options.id || (this.Name + (new Date()).getTime());
        this.Component = null;
        this.permit = getACL(this.Name) || { add: false, edit: false, delete: false, 
            addOrgchart:false,deleteOrgchart:false,
            addRole:false,deleteRole:false,
            editPassword:false,
        };
        this.Data = new NCStore({ url: 'api/core/user', key: "id",permit:this.permit });
        this.Key = 0;
        this.Init = function () {
            var that = this;
            
            var isNew = true;
            var isLoadOrgchart = false;
            var isLoadRole = false;
            var isEditRole = false;
            var isEditOrgchart = false;
    
            var roleId;
            var orgchartId;
            
            var roleStore = new NCData({url:'api/core/role',callback:function(a){
                if(roleId){
                    roleId.dxTreeList("instance").option("dataSource",{store:a,key:"id"});
                }            
            }});
            var orgchartStore = new NCData({url:'api/core/orgchart',callback:function(a){
                if(orgchartId){
                    orgchartId.dxTreeList("instance").option("dataSource",{store:a,key:"id"});
                }            
            }});
            var provinceStore = new NCData({url:'api/master/province',callback:function(a){            
                that.Component.columnOption('province', 'lookup.dataSource', a);
            }});
            var districtStore = new NCStore({
                url:'api/master/district',
                filter:["province_id=null"],
                key:"id",            
            });
            
            var defaultId=[];
            var defaultrole = new NCData({
                url:"api/core/roledefault/getDefault",
                callback:function(a){
                    if(a.length)
                        defaultId = a.map(b=>b.id);
                }
            });
            
            function loadRole(k){
                var tmp = new NCData({
                    url:'api/core/userrole?$select=role_id&$filter=user_id eq '+k,
                    callback:function(a){
                        if(a.length == 0)
                            a = defaultId;

                        if(roleId){
                            isLoadRole = true;
                            var b = [];
                            for(var i =0; i< a.length; i++){
                                b.push(a[i].role_id);
                            }
                            roleId.dxTreeList("instance").beginUpdate();
                            roleId.dxTreeList("instance").selectRows(b);
                            roleId.dxTreeList("instance").endUpdate();
                            isLoadRole = false;
                        }
                    }
                });
            }
            function selectChildOrgchart(k){
                var rs = [];
                var d = orgchartStore.data;
                for(var i = 0; i< d.length;i++){
                    if(d[i].parent_id == k)
                        rs.push(d[i].id);
                }
                return rs;
            }
            function childOrchartChoice(k){
                var chid = selectChildOrgchart(k);
                if(chid.length>0){
                    isLoadOrgchart = true;
                    orgchartId.dxTreeList("instance").beginUpdate();
                    orgchartId.dxTreeList("instance").selectRows(chid,true);
                    orgchartId.dxTreeList("instance").endUpdate();
                    isLoadOrgchart = false;
                    for(var i = 0; i< chid.length;i++){
                        childOrchartChoice(chid[i]);
                    }
                }
            }
            function loadOrgchart(k){
                var tmp = new NCData({
                    url:'api/core/userorgchart?$select=orgchart_id&$filter=user_id eq '+k,
                    callback:function(a){
                        if(orgchartId){
                            var b = [];
                            for(var i =0; i< a.length; i++){
                                b.push(a[i].orgchart_id);
                            }
                            isLoadOrgchart = true;
                            orgchartId.dxTreeList("instance").beginUpdate();
                            orgchartId.dxTreeList("instance").selectRows(b);
                            orgchartId.dxTreeList("instance").endUpdate();
                            isLoadOrgchart = false;
                        }
                    }
                });
            }
    
            function saveRole(l){
                if((that.permit.deleteRole || false) && (that.permit.addRole || false)){
                    $.ajax({
                        url: getURL('api/core/userorgchart/UpdateRoleByUserId/'+that.Key),
                        method: "PUT",
                        data:{ol:l.join(",")}
                    }).done(function (data) {
                        // if(that.permit.addRole || false)                    
                        //     for(var i =  0; i< l.length; i++){
                        //         $.ajax({
                        //             url: getURL('api/core/userrole'),
                        //             method: "POST",
                        //             data:{user_id: that.Key,role_id:l[i]}
                        //         }).done(function (data) {                            
                                    
                        //         });
                        //     }                    
                    });
                }
            }
    
            function saveOrgchart(l){
                if((that.permit.deleteOrgchart || false) && (that.permit.addOrgchart || false)){
                    $.ajax({
                        url: getURL('api/core/userorgchart/UpdateOrgchartByUserId/'+that.Key),
                        method: "PUT",
                        data:{ol:l.join(",")}
                    }).done(function (data) {
                                  
                    });
                }
            }
    
            
            var $find = $(that.id);
            if(!$find.length){
                var scriptTag = document.scripts[document.scripts.length - 1];
                var parentTag = scriptTag.parentNode;
                $find = $("<div id='"+that.id+"'>").appendTo(parentTag);
            }

            var changeEmployee = true;

            var validateUserCode = function (params) {
                $.ajax({
                    url: getURL("api/core/user/isValidUserCode"),
                    method: "POST",
                    data: {
                        user_code: params.value,
                        user_id: that.Key
                    },
                    success: function (result) {
                        var rs = JSON.parse(result);
                        params.rule.isValid = rs.Result;
                        params.rule.message = rs.Message;
                        params.validator.validate();
                    }
                })
                // Validation result until the response is recieved
                return false;
            };
            
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
                dataSource: that.Data.Store(),
                columns: [{
                    dataField: "id",
                    allowEditing: false,
                    formItem: {
                        visible: false
                    }
                }, {
                    dataField: "avatar",
                    visible: false,                
                }
                    , {
                        dataField: "username",
                        caption: (that.permit.editPassword || false) ? "User Name" : "Staft Code",
                        sortOrder: "asc",
                        validationRules: [{
                            type: "required"
                        },{
                            type: 'custom',
                            validationCallback: validateUserCode
                        }],
                        setCellValue: function(newData, value, currentRowData) {
                            newData.username = value;
                            newData._orc_user_name = value;
                        }
                    }
                    , {
                        dataField: "password",
                        caption: (that.permit.editPassword||false)?"Password":"",
                        visible:false,
                        editCellTemplate: function (cellElement, cellInfo) {
                            //if (that.permit.editPassword || false) {
                                var div = document.createElement("div");
                                cellElement.get(0).appendChild(div);
                                $(div).dxTextBox({
                                    mode: "password",
                                    value: cellInfo.value,
                                    onValueChanged: function (e) {
                                        cellInfo.setValue(e.value);
                                    },
                                    visible: that.permit.editPassword,
                                });
                            //}
                        },
                        validationRules: [{
                            type: "required"
                        }],
                        setCellValue: function(newData, value, currentRowData) {
                            newData.password = value;
                            newData._orc_pass = value;
                        },
                        formItem: {
                            visible: that.permit.editPassword || false,
                        }
                    }
    
                    , {
                        dataField: "firstname",
                        caption: "First Name",
                    validationRules: [{
                        type: "required"
                    }]
                }
                    , {
                        dataField: "lastname",
                        caption: "Last Name",
                    validationRules: [{
                        type: "required",
                    }]
                    }
                    , {
                        dataField: "email",
                        validationRules: [{ type: 'email' }],
                        formItem: {
                            mode: "email"
                        },
                    }
                    , {
                    dataField: "sex",
                    caption: "Male",
                    dataType:"boolean"
    
                }
                    , {
                        dataField: "brithday",
                        caption: "Birthday",
                    dataType: "date"
                }
                    , {
                    dataField: "location",
                    visible: false,
                    allowEditing: false,
                    formItem: {
                        visible: false
                    }
                }
                , {
                    dataField: "province",
                    visible: false,
                    lookup: {
                        dataSource: provinceStore.data,
                        valueExpr: "id",
                        displayExpr:"province_name"
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
                        displayExpr: "district_name"
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
                    , {dataField:"fulladdress",
                    caption:"Full Address",
                  }             
                  , {dataField:"_orc_sync",
                  caption:"Sync",
                  visible:false,
                  formItem:{
                      visible: false
                  }
                }      
                ],
                editing: {
                    mode: "form",
                    allowUpdating: that.permit.edit || false,
                    allowDeleting: that.permit.delete || false,
                    allowAdding: that.permit.add || false,
                    form: {
                        colCount: 1,
                        items: [{
                            itemType: "tabbed",
                            tabPanelOptions: {
                                deferRendering: false
                            },
                            tabs: [{
                                title: "User Infomations",
                                colCount:2,
                                items: [
                                    "username",
                                    "password",
                                    "firstname",
                                    "lastname",
                                    "email",
                                    "sex",
                                    "province",
                                    "district",
                                    "fulladdress",
                                    "brithday",
                                ]
                            }, {
                                title: "Roles",                            
                                items: [{
                                    dataField: "Roles",
                                    label: {
                                        visible: false
                                    },
                                    template: function (data, itemElement) {
                                        roleId = $("<div>").dxTreeList({
                                            stateStoring: {
                                                enabled: true,
                                                type: "localStorage",
                                                storageKey: that.id+"_Role"
                                            },
                                            visible: (that.permit.addRole || that.permit.deleteRole || false),
                                            dataSource: roleStore.data,                                        
                                            keyExpr: "id",
                                            parentIdExpr: "parent_id",
                                            columnAutoWidth: true,
                                            wordWrapEnabled: true,
                                            selectedRowKeys: defaultId,
                                            searchPanel: {
                                                visible: true,
                
                                            },
                                            headerFilter: {
                                                visible: true
                                            },
                                            selection: {
                                                mode: "multiple",
                                                recursive: false
                                            },
                                            columns: [
                                                {
                                                    dataField: "role_name",
                                                    caption: "Name"
                                                },
                                                {
                                                    dataField: "description",
                                                },
                                                {
                                                    dataField: "weight",
                                                }
                                            ],
                                            onSelectionChanged: function (e) {
                                                // if (!isLoadRole)
                                                //     cellInfo.setValue(e.selectedRowKeys.join(','));
                                                isEditRole = true;
                                            }
                                        });
                                        itemElement.append(roleId);
                                    }
                                    
                                }]
                            }, {
                                    title: "Organization Units",
                                    
                                    items: [{
                                        dataField: "Orgcharts",
                                        label: {
                                            visible:false
                                        }, 
                                        template: function (data, itemElement) {
                                            orgchartId = $("<div>").dxTreeList({
                                                stateStoring: {
                                                    enabled: true,
                                                    type: "localStorage",
                                                    storageKey: that.id+"_Orgchart"
                                                },
                                                visible: (that.permit.addOrgchart || that.permit.deleteOrgchart || false),
                                                dataSource: orgchartStore.data,                                            
                                                keyExpr: "id",
                                                parentIdExpr: "parent_id",                                                
                                                searchPanel: {
                                                    visible: true,
                    
                                                },
                                                autoExpandAll: true,
                                                columnAutoWidth: true,
                                                scrolling: {
                                                    mode: "standard"
                                                },
                                                paging: {
                                                    enabled: true,
                                                    pageSize: 5
                                                },
                                                pager: {
                                                    showPageSizeSelector: true,
                                                    allowedPageSizes: [5, 10, 20, 100],
                                                    showInfo: true
                                                },
                                                headerFilter: {
                                                    visible: true
                                                },
                                                selection: {
                                                    mode: "multiple",
                                                    recursive: false,
                                                    
                                                },
                                                columns: [
                                                    {
                                                        dataField: "org_name",
                                                        caption: "Name"
                                                    }
                                                ],
                                                onToolbarPreparing: function (ef) {
                                                    var toolbarItems = ef.toolbarOptions.items;
                                                    toolbarItems.push({
                                                        widget: 'dxButton',
                                                        location: 'before',                        
                                                        options: {
                                                            icon: 'revert',
                                                            text: "Reload",                                                            
                                                            onClick: function () {
                                                                loadOrgchart(that.Key);
                                                            }
                                                        },
                                                        
                                                    },
                                                    {
                                                        widget: 'dxButton',
                                                        location: 'before',                        
                                                        options: {
                                                            icon: 'revert',
                                                            text: "Clear",                                                            
                                                            onClick: function () {
                                                                isLoadOrgchart = true;
                                                                orgchartId.dxTreeList("instance").beginUpdate();
                                                                orgchartId.dxTreeList("instance").selectRows([]);
                                                                orgchartId.dxTreeList("instance").endUpdate();
                                                                isLoadOrgchart = false;
                                                            }
                                                        },
                                                        
                                                    }
                                                );
                                                },
                                                onSelectionChanged: function (e) {                                                                    
                                                    //saveOrgchart(e.selectedRowKeys);
                                                    isEditOrgchart = true;
                                                    if(e.currentSelectedRowKeys.length>0)
                                                        childOrchartChoice(e.currentSelectedRowKeys[0]);
                                                }
                                            });
                                            itemElement.append(orgchartId);
                                        }                                       
                                    }]
                            }, {
                                    title: "Avata",                                
                                    items: [{
                                        dataField: "avatar",
                                        template: function (data, itemElement) {
                                            var url = data.editorOptions.value;
                                            itemElement.append(
                                                "<img src='/Resource/images/Profiles/" + (url?url:"default.png") +"' style='display:" +(isNew?"none":"block")+"'>"
                                            );
                                        },
                                        label: {
                                            visible: false
                                        },
                                    }]
                            },{
                                title:"Employee",
                                items:[{
                                    dataField:"changeEmployee",
                                    editorType:"dxCheckBox",
                                    editorOptions:{
                                        value: changeEmployee,
                                        onValueChanged:function(e){
                                            changeEmployee = e.value;
                                        }
                                    }
                                }],
                            }]
                        }],
                        onDisposing: function(e){
                            if(isEditOrgchart){
                                saveOrgchart(orgchartId.dxTreeList("instance").getSelectedRowKeys());
                                isEditOrgchart = false;
                            }
                            if(isEditRole){
                                saveRole(roleId.dxTreeList("instance").getSelectedRowKeys());
                                isEditRole = false;
                            }                        
                        },
                        onContentReady: function (e) {
                            setTimeout(function () {
                                var form = e.element;
                                var btn = form.parent().find("[aria-label='Cancel']");
                                btn.dxButton("instance").option("onClick", function() {
                                    //alert("Cancel");
                                    isEditOrgchart = false;
                                    isEditRole = false;
                                    that.Component.cancelEditData();
                                });
                            }, 0);
                        }
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
                onInitNewRow: function (info) {
                    //info.data.Roles = defaultRole;
                    info.data._orc_sync ='I';
                    isNew = true;
                    that.key = null;
                    info.data.sex = true;
                },
                onEditingStart: function (e) {
                    // provinceId = e.data.province_id;
                    // e.data.Orgcharts = "";
                    // selectedRole = [];
                    // selectedOrgchart = [];
                    // selectedRole = getSelectedRole(e.data.id);
                    // selectedOrgchart = getSelectedOrgchart(e.data.id);
                    // e.data.Roles = selectedRole;
                    // e.component.__isEdit = true;
                    e.data._orc_sync ='U';
                    that.Key = e.data.id;
                    setTimeout(function () {
                        loadRole(that.Key);
                        loadOrgchart(that.Key);
                    },500);                    
                    isNew = false;

                },
                onRowUpdating:function(e){
                    e.newData._orc_sync = 'U';
                    //if(e.newData.password)
                    //    e.newData._orc_pass = e.newData.password;
                },
                onRowInserting:function(e){
                    e.data._orc_sync = 'I';
                    //if(e.data.password)
                     //   e.data._orc_pass = e.data.password;

                },
                onRowInserted:function(e){
                    if(!changeEmployee)
                        return;
                    var dat = e.data;
                    dat.full_name = (dat.firstname || '')  +' '+ (dat.lastname ||'');
                    dat.user_id = e.key;
                    dat.address = dat.fulladdress;
                    dat._orc_partner_name = dat.full_name;
                    dat._orc_partner_code = e.key;
                    dat._orc_sync = 'I';                    
                    $.ajax({
                        url: getURL("api/master/Employee"),
                        method: "POST",
                        data: dat,
                        success: function (result) {
                            
                        }
                    })
                },
                onRowUpdated:function(e){

                },
                // onEditorPreparing: function (options) {
                    
                //     if (options.dataField == "province") {
                //         provinceId = options.value;
                //     }
                    
                // },
                selection: {
                    mode: "single"
                },
                
                onSelectionChanged: function (e) {
                    that.Key = e.currentSelectedRowKeys[0];      
                            
                },
            });
    
            that.Component = $find.dxDataGrid("instance");
        };

        this.Init();
    }

    User.prototype

    return User;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = User;
else
    window.User = User;