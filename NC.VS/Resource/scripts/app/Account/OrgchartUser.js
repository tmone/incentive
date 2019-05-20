"use strict";
var OrgchartUser = (function () {

    var OrgchartUser = function (options) {
        var options = options || {};
        this.Name = "OrgchartTree";
        this.Type = "dxDataGrid";
        this.id = options.id || (this.Name + (new Date()).getTime());
        this.Component = null;
        this.permit = getACL(this.Name) || { addUser: false,  deleteUser: false };

        this.selected = options.selected || [];
        this.OrgchartId = options.orgchartid || 0;
        
        this.UserData = new NCStore({ url: 'api/core/userorgchart',filter: ["orgchart_id=" + this.OrgchartId],permit: this.permit});
        this.Init = function () {
            var that = this;
            var userStore = new NCData({
                url: 'api/core/user', callback: function (a) {
                    that.Component.columnOption('user_id', 'lookup.dataSource', a);
                }
            });
    
            var userOrgchartStore;
    
            function getUserOrgchart(id) {
                if(id)
                    $.ajax({
                        url: getURL('api/core/userorgchart?$filter=orgchart_id eq '+id),
                        method: "GET"
                    }).done(function (data) {
                        userOrgchartStore = new DevExpress.data.ArrayStore({
                            key: "id",
                            data: data
                        });
                        updateUser(userOrgchartStore);
                    });
            }
    
            function buildFilter(dt) {
                var rs = [];
                if (dt) {
                    var data = dt._array;
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
    
            var $find = $(that.id);
             
            if(!$find.length){
                var scriptTag = document.scripts[document.scripts.length - 1];
                var parentTag = scriptTag.parentNode;
                $find = $("<div id='"+that.Id+"'>").appendTo(parentTag);
            }
            $find.dxDataGrid({
                paging: {
                    pageSize: 10
                },
                dataSource: that.UserData.Store(),
                editing: {
                    mode: "popup",                
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
                    e.data.orgchart_id = that.OrgchartId;
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
                            displayExpr:function(o){return "["+o.username+"] "+o.lastname+" "+o.firstname;}
                        },                  
    
                        editCellTemplate: function (cellElement, cellInfo) {
                            var isLoad = true;
                            var div = document.createElement("div");
                            cellElement.get(0).appendChild(div);
                            $(div).dxDataGrid({
                                dataSource: userStore.data,
                                columns: ["id", "username", "lastname", "firstname"],
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
                                    //updateUserCount(orgchartId, data.length);
                                    if (data.length > 0) {
                                        cellInfo.setValue(data.join(","));
                                    }
                                },
                                onContentReady: function (e) {
                                    var filt = buildFilter(userOrgchartStore);
                                    //e.component.filter(filt.length > 0 ? filt : null);
                                }
                            });
                        }
                    },
                ],
    
            });
    
    
            that.Component = $find.dxDataGrid("instance");
    
        };
        this.Init();
    
    }

    OrgchartUser.prototype.UpdateOrgchart = function (OrgchartId) {
        this.OrgchartId = OrgchartId || 0;        
        this.UserData.filter = ["orgchart_id=" + this.OrgchartId];
        this.Component.refresh();
    }

    

    return OrgchartUser;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = OrgchartUser;
else
    window.OrgchartUser = OrgchartUser;