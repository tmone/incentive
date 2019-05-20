"use strict";


var KPICustomerEdit = (function () {

    var KPICustomerEdit = function (options) {
        var options = options || {};
        this.Name = "KPICustomer";
        this.Type = "dxDataGrid";
        this.id = options.id || (this.Name + (new Date()).getTime());
        this.Component = null;
        this.permit = getACL(this.Name) || { add: false, edit: false, delete: false };
        this.Data = new NCStore({ url: 'api/Accounting/KPICustomer', key: "id", permit: this.permit });
        this.Key = null;

        this.Init = function () {
            var that = this;
            var $find = $(that.id);

            var userStore = new NCData({
                url: 'api/core/user?$select=id,username,lastname,firstname',
                callback: function (a) {
                    for (var i = 0; i < a.length; i++) {
                        a[i].code_name = "[" + a[i].username + "] " + a[i].lastname + " " + a[i].firstname;
                    }
                    that.Component.columnOption('user', 'lookup.dataSource', a);
                }
            });

            var customerStore = new NCData({
                url: 'api/master/customer',
                // options:{
                //     select:["id","_orc_partner_code","customer_name"],
                // },
                callback: function (a) {
                    for (var i = 0; i < a.length; i++) {
                        a[i].code_name = "[" + a[i]._orc_partner_code + "] " + a[i].customer_name;
                    }
                    that.Component.columnOption('name', 'lookup.dataSource', a);
                }
            });


            if (!$find.length) {
                var scriptTag = document.scripts[document.scripts.length - 1];
                var parentTag = scriptTag.parentNode;
                $find = $("<div id='" + that.id + "'>").appendTo(parentTag);
            }
            function checkCode(e) {
                //var dat = that.Data.Store().load();
                return true;
            }

            $find.dxDataGrid({
                // stateStoring: {
                //     enabled: true,
                //     type: "localStorage",
                //     storageKey: that.Name,
                // },
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
                    mode: "cell",
                    allowUpdating: that.permit.edit || false,
                    //allowDeleting: that.permit.delete || false,
                    //allowAdding: that.permit.add || false,
                    // form: {
                    //     colCount:1
                    // }
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
                onSelectionChanged: function (e) {
                    that.Key = e.currentSelectedRowKeys[0];

                },
                groupPanel: {
                    visible: true
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
                        dataField: "name",
                        caption: "Customer",
                        sortOrder: "asc",
                        validationRules: [{
                            type: "required"
                        }],
                        allowEditing: false,
                        lookup: {
                            dataSource: customerStore.data,
                            valueExpr: "_orc_partner_code",
                            displayExpr: "code_name",
                        },
                    },
                    {
                        dataField: "user",
                        caption: "Saler",
                        sortOrder: "asc",
                        lookup: {
                            dataSource: userStore.data,
                            valueExpr: "username",
                            displayExpr: "code_name",
                        },
                    },
                    {
                        dataField: "user",
                        allowEditing: false,
                        groupIndex: 0,
                    },
                    {
                        dataField: "_active",
                        caption: "Active",
                        formItem: {
                            visible: false,
                        },
                        width: "75px",
                    }],
            });


            that.Component = $find.dxDataGrid("instance");

        }

        this.Init();
    }

    return KPICustomerEdit;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = KPICustomerEdit;
else
    window.KPICustomerEdit = KPICustomerEdit;