"use strict";
var RoleUser = (function () {

    var RoleUser = function (options) {
        var options = options || {};
        this.Name = "Roles";
        this.Type = "dxDataGrid";
        this.id = options.id || (this.Name + (new Date()).getTime());
        this.Component = null;
        this.permit = getACL(this.Name) || { addUser: false,  deleteUser: false };

        this.selected = options.selected || [];
        this.RoleId = options.roleid || null;        
        this.UserData = new NCStore({ url: 'api/core/userrole',filter: ["role_id=" + this.RoleId],permit: this.permit});
        this.Init = function () {
            var that = this;
            var userStore = new NCData({
                url: 'api/core/user?$select=id,username,firstname,lastname', callback: function (a) {
                    that.Component.columnOption('user_id', 'lookup.dataSource', a);
                }
            });
            var userRoleStore;
            function getIn(dt) {
                var data = dt.data;
                var rs = [];
                for (var i = 0; i < data.length; i++) {
                    rs.push(data[i].id);
                }
                return rs.join(",");
            }
            function getUserRole(id) {
                if (id)
                    $.ajax({
                        url: getURL('api/core/userrole?$filter=role_id eq ' + id),
                        method: "GET"
                    }).done(function (data) {
                        userRoleStore = new DevExpress.data.ArrayStore({
                            key: "id",
                            data: data
                        });
                        //updateUser(userRoleStore);
                    });
            }
            var buildFilter = function(obj) {
                var dt =obj;
                var rs = [];
                if (dt) {
                    var data = dt._items;
                    for (var i = 0; i < data.length; i++) {
                        var n = ["id", "<>", parseInt(data[i].user_id)]
                        if (rs.length > 0) {
                            rs = [rs, "and", n];
                        } else {
                            rs = n;
                        }
                        //rs.push(data[i].id);
                    }
                }
                return rs;
            }
            var bFilter = [];
            var $find = $(that.id);
            if(!$find.length){
                    var scriptTag = document.scripts[document.scripts.length - 1];
                    var parentTag = scriptTag.parentNode;
                    $find = $("<div id='"+that.id+"'>").appendTo(parentTag);
                }
                
            $find.dxDataGrid({
                paging: {
                    pageSize: 10
                },
                dataSource: that.UserData.Store(),
                editing: {
                    mode: "popup",               
                    texts: {
                        deleteRow: "Remove",
                        confirmDeleteMessage: "Remove User out Role",
                        confirmDeleteTitle:"Remove User"
                    },
                    allowDeleting: that.permit.deleteUser || false,
                    allowAdding: that.permit.addUser || false,
                    form: {
                        colCount: 1,
                        items: [
                            {
                                dataField: "user_id",
                                label: {
                                    visible:false,
                                }
                            }
                        ]
                    },
                    popup: {
                        title: "Select user",
                        showTitle: true,
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
                onInitNewRow: function (e) {
                    e.data.role_id = that.RoleId;
                    bFilter = [];  
                },
                onSelectionChanged: function (e) {
                    that.selected = e.currentSelectedRowKeys;
                },
                columns: [
                    {
                        dataField: "user_id",
                        caption: "User",
                        lookup: {
                            dataSource: userStore.data,
                            valueExpr: "id",
                            displayExpr: function(o){return "["+o.username+"] "+ o.lastname+" "+o.firstname;}
                        },
    
                        editCellTemplate: function (cellElement, cellInfo) {
                            var isLoad = true;
                            var div = document.createElement("div");
                            cellElement.get(0).appendChild(div);
                            bFilter = buildFilter(cellInfo.component.getDataSource()); 
                            $(div).dxDataGrid({
                                dataSource: userStore.data,
                                filterValue:bFilter,
                                columns: ["id", "username", "firstname", "lastname"],
                                keyExpr: "id",
                                selection: {
                                    mode: "multiple"
                                },
                                paging: {
                                    pageSize: 10
                                }, searchPanel: {
                                    visible: true,
                                    placeholder: "Search..."
                                },
                                headerFilter: {
                                    visible: true
                                },
                                //onValueChanged: function (e) {
                                //    cellInfo.setValue(e.value);
                                //},
                                onSelectionChanged: function (e) {
                                    var data = e.selectedRowKeys;
                                    if (data.length > 0) {
                                        cellInfo.setValue(data.join(","));
                                    }
                                },
                                // onContentReady: function (e) {
                                //     var filt = buildFilter(userRoleStore);
                                //     e.component.filter(filt.length > 0 ? filt : []);
                                // }
                            });
                        }
                    },
                ],
    
            });
    
    
            that.Component = $find.dxDataGrid("instance");
    
        }
        this.Init();
    }

    RoleUser.prototype.UpdateRole = function (RoleId) {
        this.RoleId = RoleId || 0;        
        this.UserData.filter = ["role_id=" + this.RoleId];
        this.Component.refresh();
    }

    

    return RoleUser;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = RoleUser;
else
    window.RoleUser = RoleUser;