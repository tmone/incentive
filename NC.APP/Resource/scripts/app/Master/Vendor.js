"use strict";


var Vendor = (function () {

    var Vendor = function (options) {
        var options = options || {};
        this.Name = "Vendor";
        this.Type = "dxDataGrid";
        this.id = options.id || (this.Name + (new Date()).getTime());
        this.Component = null;
        this.permit = getACL(this.Name) || {add:false, edit:false, delete:false};
        this.GroupId = options.groupid || null;
        this.Data = new NCStore({
            url: 'api/master/Vendor', key: "id",  permit: this.permit
        });
        this.Key = null;

        this.Init = function () {
            var that = this;
            
    
            var $find = $(that.id);
            if(!$find.length){
                var scriptTag = document.scripts[document.scripts.length - 1];
                var parentTag = scriptTag.parentNode;
                $find = $("<div id='"+that.id+"'>").appendTo(parentTag);
            }
            var userStore = new NCData({
                url: 'api/master/employee', callback: function (a) {
                    that.Component.columnOption('employee_id', 'lookup.dataSource', a);
                }
            });

            $find.dxDataGrid({
                stateStoring: {
                    enabled: true,
                    type: "localStorage",
                    storageKey: that.Name,
                },
                allowColumnResizing: true,
                columnResizingMode: "nextColumn",
                columnMinWidth: 50,
                //columnAutoWidth: true,
                paging: {
                    pageSize: 50
                },
                pager: {
                    showPageSizeSelector: true,
                    allowedPageSizes: [10, 20, 50, 100, 200],
                    showInfo: true
                },
                groupPanel: {
                    visible: true
                },
                dataSource: that.Data.Store(),
                editing: {
                    mode: "form",
                    allowUpdating: that.permit.edit || false,
                    allowDeleting: that.permit.delete || false,
                    allowAdding: that.permit.add || false,
                    // form: {
                    //     colCount: 1
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
                // onInitNewRow: function (e) {
                //     e.data.group_id = that.GroupId;
                // },
                onSelectionChanged: function (e) {
                    that.Key = e.currentSelectedRowKeys[0];
                },
                columns: [
                    // {
                    //     dataField: "id",
                    //     visible: false,
                    //     formItem: {
                    //         editorOptions: {
                    //             readOnly:true,
                    //         }
                    //     }
                    // },
                {
                    dataField: "vendor_name",
                    caption: "Name",
                    sortOrder: "asc",
                    validationRules: [{
                        type: "required"
                    }],
                    // setCellValue: function(newData, value, currentRowData) {
                    //     newData.customer_name = value;
                    //     newData._orc_partner_name = value;
                    // }
                }, 
                // {
                //     dataField: "group_id",
                //     caption: "Group",
                //     lookup: {
                //         dataSource: groupStore.Store(),
                //         valueExpr: "id",
                //         displayExpr: "group_name"
                //     },
                //     groupIndex:1,
                // }, 
                // {
                //     dataField: "type_id",
                //     caption: "Type",
                //     lookup: {
                //         dataSource: typeStore.Store(),
                //         valueExpr: "id",
                //         displayExpr: "name"
                //     },                    
                // }, 
                {
                    dataField: "description",                    
                }, 
                {
                    dataField: "tax_id",
                    caption: "MST",    
                    visible: false,                
                }, 
                {
                    dataField: "first_sale",
                    caption: "From",   
                    visible: false,                 
                }, 
                {
                    dataField: "payment_id",
                    caption: "Payment",
                    visible: false,
                },
                {
                    dataField: "pricelist_id",
                    caption: "Price list",
                    visible: false,
                },  
                {
                    dataField: "employee_id",
                    caption: "Employee",
                    lookup: {
                        dataSource: userStore.data,
                        valueExpr: "id",
                        displayExpr:function(o){return "["+o.id+"] "+o.full_name;}
                    },   
                    width:'100px',           

                
                 },
                {
                    dataField: "address",                  
                    visible: false,
                }, 
                {
                    dataField: "phone",                   
                    visible: false,
                }, 
                {
                    dataField: "fax",                   
                    visible: false,
                },  
                {
                    dataField: "_orc_partner_code",   
                    caption: "Code",                
                    //visible: false,
                    visibleIndex:0,
                    width:'70px',
                },  
                {
                    dataField: "_active",
                    caption: "Active",
                    dataType:"boolean",
                    visible: false,                    
                }],
                onInitNewRow:function(e){
                    e.data._active=true;
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
            });
    
    
            that.Component = $find.dxDataGrid("instance");
    
        } 

        this.Init();
    }

    // Vendor.prototype.UpdateGroup = function (GroupId) {
    //     this.GroupId = GroupId || null;
    //     this.Data.filter = this.GroupId ? ["province_id=" + this.GroupId] : [];
    //     this.Component.refresh();
    // }

    return Vendor;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Vendor;
else
    window.Vendor = Vendor;