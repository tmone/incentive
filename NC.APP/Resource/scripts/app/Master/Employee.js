"use strict";


var Employee = (function () {

    var Employee = function (options) {
        var options = options || {};
        this.Name = "Employee";
        this.Type = "dxDataGrid";
        this.id = options.id || (this.Name + (new Date()).getTime());
        this.Component = null;
        this.permit = getACL(this.Name) || {add:false, edit:false, delete:false};
        //this.ProvinceId = options.provinceid || null;
        this.Data = new NCStore({
            url: 'api/master/Employee', key: "id",  permit: this.permit
        });
        this.Key = null;

        this.Init = function () {
            var that = this;
            var userStore = new NCData({
                url: 'api/core/user?$select=id,username,firstname,lastname', callback: function (a) {
                    that.Component.columnOption('user_id', 'lookup.dataSource', a);
                }
            });
    
            var $find = $(that.id);
            if(!$find.length){
                var scriptTag = document.scripts[document.scripts.length - 1];
                var parentTag = scriptTag.parentNode;
                $find = $("<div id='"+that.id+"'>").appendTo(parentTag);
            }

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
                onInitNewRow:function(e){
                    e.data._orc_sync='I';
                    that.Key = null;
                },
                onEditingStart:function(e){
                    e.data._orc_sync='U';
                    that.Key = e.data.key;
                },   
                onRowUpdating:function(e){
                    e.newData._orc_sync = 'U';
                },
                onRowInserting:function(e){
                    e.data._orc_sync = 'I';

                },   
                onSelectionChanged: function (e) {
                    that.Key = e.currentSelectedRowKeys[0];
                },
                columns: [{
                    dataField: "id",
                    allowEditing: false,
                    formItem: {
                        visible: false,
                    },
                    visibleIndex:0,
                }
                    , {
                    dataField: "full_name",
                    caption: "Name",
                    sortOrder: "asc",
                    validationRules: [{
                        type: "required"
                    }]
                }, 
                {
                    dataField: "description",                    
                    //visible: false,                    
                }, 
                {
                    dataField: "user_id",                    
                    //visible: false,  
                    lookup:{
                        dataSource:userStore,
                        valueExpr:"id",
                        displayExpr:function(o){
                            if(!o)
                                return;
                            return "["+o.username + "] "+o.lastname+" "+o.firstname;
                        }
                    }                  
                }, 
                {
                    dataField: "manager",                    
                    //visible: false,  
                    lookup:{
                        dataSource:that.Data.Store(),
                        valueExpr:"id",
                        displayExpr:"full_name"
                    }                  
                }, 
                {
                    dataField: "address",                    
                    //visible: false,                                      
                }, 
                {
                    dataField: "email",                    
                    visible: false,                                      
                }, 
                {
                    dataField: "phone",                    
                    visible: false,                                      
                }, 
                {
                    dataField: "_orc_partner_code",     
                    caption:"Oracle Code",               
                    //visible: false,   
                    visibleIndex:1,                                   
                }, 
                {
                    dataField: "_active",
                    caption: "Active",
                    formItem: {
                        visible: false,
                    },
                }],
    
            });
    
    
            that.Component = $find.dxDataGrid("instance");
    
        } 

        this.Init();
    }

    // Employee.prototype.UpdateProvince = function (provinceId) {
    //     this.ProvinceId = provinceId || null;
    //     this.Data.filter = this.ProvinceId ? ["province_id=" + this.ProvinceId] : [];
    //     this.Component.refresh();
    // }

    return Employee;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Employee;
else
    window.Employee = Employee;