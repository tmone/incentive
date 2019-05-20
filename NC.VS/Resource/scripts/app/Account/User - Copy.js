"use strict";

var User = (function () {

    var User = function (options) {
        this.id = options.id || "User" + (new Date()).getTime();
        this.Component = null;
        this.permit = options.permit || { add: false, edit: false, delete: false, 
            orgchart:false,
            role:false,
        };
        this.Data = new NCStore({ url: 'api/core/user', key: "id",permit:this.permit });
        this.Key = 0;

    }

    User.prototype.Init = function () {
        var that = this;
        var arrayStore;
        var provinceStore;
        var districStore;
        var gridId;
        var orgchartId;
        var roleId;
        var orgchartStore;
        var roleStore;
        var selectRole;
        var defaultRole;

        //get default role for new user
        $.ajax({
            url: getURL('api/core/defaultrole'),
            method: "GET"
        }).done(function (data) {
            if (data) {
                if (data.length > 0) {
                    defaultRole = data[0].id;
                    selectedRole.push(defaultRole);
                }
            }
            defaultRole = null;
        });


        //load all orgchart
        $.ajax({
            url: getURL('api/core/orgchart'),
            method: "GET"
        }).done(function (data) {
            orgchartStore = data;
        });


        //load all role
        $.ajax({
            url: getURL('api/core/role'),
            method: "GET"
        }).done(function (data) {
            roleStore = data;
        });

        $.ajax({
            url: getURL('api/master/province'),
            method: "GET"
        }).done(function (data) {
            provinceStore = data;
            
        });

        $.ajax({
            url: getURL('api/master/distric'),
            method: "GET"
        }).done(function (data) {
            districStore = data;
            
        });

        var isLoadOrgchart = false;
        var isLoadRole = false;
        var provinceId = null;
        var selectedOrgchart = [];
        var selectedRole = [];

        function getSelectedOrgchart(id) {
            var rs = [];

            $.ajax({
                url: getURL('api/core/userorgchart?$select=orgchart_id&$filter=user_id eq ' + id),
                method: "GET"
            }).done(function (data) {
                selectedOrgchart = [];
                isLoadOrgchart = true;
                //load selected

                var exp = [];
                var or = orgchartId.dxTreeList("instance");
                or.beginUpdate();
                for (var i = 0; i < data.length; i++) {
                    var k = data[i].orgchart_id;
                    if (k) {
                        selectedOrgchart.push(k);
                        exp.push(k);
                    }
                }

                //load select

                or.selectRows(selectedOrgchart, false);


                var ex = expandOrgchart(exp);
                for (var j = 0; j < ex.length; j++) {
                    or.expandRow(ex[j]);
                }

                or.endUpdate();

                isLoadOrgchart = false;
            });

            return rs;
        }

        function findRole(id) {
            if (roleStore)
                for (var i = 0; i < roleStore.length; i++) {
                    var tmp = roleStore[i];
                    if (tmp.id == id)
                        return tmp;
                }
            return null;
        }
        function findOrgchart(id) {
            if (orgchartStore)
                for (var i = 0; i < orgchartStore.length; i++) {
                    var tmp = orgchartStore[i];
                    if (tmp.id == id)
                        return tmp;
                }
            return null;
        }

        function expandRole(ro) {
            var rs = [];
            var r = ro;

            while (r.length > 0) {
                var id = r.shift();
                var me = findRole(id);
                if (me && me.parent_id) {
                    r.push(me.parent_id);
                }
                rs.push(id);

            }
            return rs;
        }

        function expandOrgchart(ro) {
            var rs = [];
            var r = ro;

            while (r.length > 0) {
                var id = r.shift();
                var me = findOrgchart(id);
                if (me && me.parent_id) {
                    r.push(me.parent_id);
                }
                rs.push(id);

            }
            return rs;
        }

        function getSelectedRole(id) {
            var rs = [];

            $.ajax({
                url: getURL('api/core/userrole?$select=role_id&$filter=user_id eq ' + id),
                method: "GET"
            }).done(function (data) {
                selectedRole = [];
                if (defaultRole && defaultRole != null) {
                    selectedRole.push(defaultRole);
                }
                //selectedRole = data;
                if(roleId){
                    isLoadRole = true;
                    var exp = [];
                    var ro = roleId.dxTreeList("instance");
                    ro.beginUpdate();
                    for (var i = 0; i < data.length; i++) {
                        var k = data[i].role_id;
                        if (k) {
                            selectedRole.push(k);
                            exp.push(k);
                        }
                    }

                    //load select

                    ro.selectRows(selectedRole, false);


                    var ex = expandRole(exp);
                    for (var j = 0; j < ex.length; j++) {
                        ro.expandRow(ex[j]);
                    }

                    ro.endUpdate();
                    isLoadRole = false;
                }
            });

            return rs;
        }

        var $find = $(that.id);
        var cten = $("section .content");
        if (!$find.length) {
            $find = $("<div id='" + that.Id + "'>").appendto(cten);
        }
        $find.dxDataGrid({
            paging: {
                pageSize: 10
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
                    caption: "User Name",
                    sortOrder: "asc",
                validationRules: [{
                    type: "required"
                }]
                }
                , {
                    dataField: "password",
                    caption: "Password",
                    visible:false,
                    editCellTemplate: function (cellElement, cellInfo) {
                        var div = document.createElement("div");
                        cellElement.get(0).appendChild(div);
                        $(div).dxTextBox({
                            mode:"password",
                            value: cellInfo.value,
                            onValueChanged: function (e) {
                                cellInfo.setValue(e.value);
                            }
                        });
                    }
                ,
                    validationRules: [{
                        type: "required"
                    }]
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
                    dataSource: function (options) {
                        return {
                            store: provinceStore,
                            sort:"province_name",
                        };
                    },
                    valueExpr: "id",
                    displayExpr:"province_name"
                },
                setCellValue: function (newData, value, currentRowData) {
                    newData.province = value;
                    provinceId = value;
                    newData.distric = null;
                }
            }
                , {
                    dataField: "district",
                visible: false,
                lookup: {
                    dataSource: function (options) {
                        return {
                            store: districStore,
                            filter: options.data ? ["province_id", "=", provinceId] : null,
                            sort: "district_name",
                        };
                    },
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
                , "fulladdress"
                , {
                    dataField: "Orgcharts",
                    visible: false,
                    editCellTemplate: function (cellElement, cellInfo) {
                        var div = document.createElement("div");
                        cellElement.get(0).appendChild(div);
                        orgchartId = $(div).dxTreeList({
                            dataSource: orgchartStore,
                            selectedRowKeys: selectedOrgchart,
                            keyExpr: "id",
                            parentIdExpr: "parent_id",
                            columnAutoWidth: true,
                            wordWrapEnabled: true,
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
                                    dataField: "org_name",
                                    caption: "Name"
                                }
                            ],
                            onSelectionChanged: function (e) {                                
                                if (!isLoadOrgchart)
                                    cellInfo.setValue(e.selectedRowKeys.join(','));
                            }
                        })                        
                    }
                }
                , {
                    dataField: "Roles",
                    visible: false,
                    editCellTemplate: function (cellElement, cellInfo) {
                        var div = document.createElement("div");
                        cellElement.get(0).appendChild(div);
                        roleId = $(div).dxTreeList({
                            dataSource: roleStore,
                            selectedRowKeys: selectedRole,
                            keyExpr: "id",
                            parentIdExpr: "parent_id",
                            columnAutoWidth: true,
                            wordWrapEnabled: true,
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
                                if (!isLoadRole)
                                    cellInfo.setValue(e.selectedRowKeys.join(','));
                            }
                        });
                    }
                    //
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
                                visible: that.permit.role || false,
                            }]
                        }, {
                                title: "Organization Units",
                                items: [{
                                    dataField: "Orgcharts",
                                    label: {
                                        visible:false
                                    },
                                    visible: that.permit.orgchart || false
                                }]
                        }, {
                                title: "Avata",
                                items: [{
                                    dataField: "avatar",
                                    template: function (data, itemElement) {
                                        var url = data.editorOptions.value;
                                        itemElement.append(
                                            "<img src='/Resource/images/Profiles/" + url?url:"default.png"+"'>"
                                        );
                                    }
                                }]
                        }]
                    }]
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
                info.data.Roles = defaultRole;
            },
            onEditingStart: function (e) {
                provinceId = e.data.province_id;
                e.data.Orgcharts = "";
                selectedRole = [];
                selectedOrgchart = [];
                selectedRole = getSelectedRole(e.data.id);
                selectedOrgchart = getSelectedOrgchart(e.data.id);
                e.data.Roles = selectedRole;
            },
            onEditorPreparing: function (options) {
                if (selectedRole)
                if (options.dataField == "province") {
                    provinceId = options.value;
                }
                if (options.dataField == "Roles") {

                }
            }
        });

        that.Component = $find.dxDataGrid("instance");
    }

    return User;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = User;
else
    window.User = User;