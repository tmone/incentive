"use strict";

var Page = (function () {

    var Page = function (options) {
        var options = options || {};
        this.Name = "Page";
        this.Type = "dxDataGrid";
        this.id = options.id || (this.Name + (new Date()).getTime());
        this.Component = null;
        this.permit = getACL(this.Name) || { add: false, edit: false, delete: false, build: false            
        };
        this.Data = new NCStore({ url: 'api/core/page', key: "id" ,permit: this.permit});
        this.Key = 0;

        this.Init = function () {
            var that = this;
    
            
            var $find = $(that.id);
                if(!$find.length){
                    var scriptTag = document.scripts[document.scripts.length - 1];
                    var parentTag = scriptTag.parentNode;
                    $find = $("<div id='"+that.Id+"'>").appendTo(parentTag);
                }
    
            var appStore = new NCData({url:'api/core/app',key:'id',callback:function(a){
                that.Component.columnOption('app_id', 'lookup.dataSource', a);
            }});
            var layoutStore = new NCData({url:'api/core/layout',key:'id',callback:function(a){
                that.Component.columnOption('layout_id', 'lookup.dataSource', a);
            }});
    
    
            $find.dxDataGrid({
                dataSource: that.Data.Store(),
                columns: [{
                    dataField: "id",
                    allowEditing: false,
                    formItem: {
                        visible: false
                    }
                },
                {
                    dataField: "page_name",
                    caption: "Page Name",
                    sortOrder: "asc",
                    validationRules: [{ type: "required" }],
                },
                {
                    dataField: "page_title",
                    caption: "Page Title",                
                    validationRules: [{type: "required"}],
                },
                {
                    dataField: "app_id",
                    caption:"App",                
                    lookup: {
                        dataSource: appStore.data,
                        valueExpr: "id",
                        displayExpr: "app_name"
                    },
                    groupIndex:0,
                },
                {
                    dataField: "layout_id",   
                    caption:"Master layout",
                    lookup: {
                        dataSource: layoutStore.data,
                        valueExpr: "id",
                        displayExpr: "name"
                    }
                }],
                editing: {
                    mode: "form",
                    allowUpdating: that.permit.edit || false,
                    allowDeleting: that.permit.delete || false,
                    allowAdding: that.permit.add || false,                
                },
                selection: {
                    mode: "single"
                },
                onSelectionChanged: function (selectedItems) {
                    var data = selectedItems.selectedRowsData[0];
                    if (data) {
                        that.Key = data.id;
                    }
                },
                onToolbarPreparing: function (e) {
                    var dataGrid = e.component;
    
                    e.toolbarOptions.items.unshift({
                        location: "after",
                        widget: "dxButton",
                        options: {
                            icon: "toolbox",
                            visible: that.permit.build || false,
                            onClick: function () {
                                if (that.Key)
                                    window.location = "/system/page/config/" + that.Key;
                            }
                        }
                    });
                },
                onEditingStart: function (e) {
                    that.Key = e.data.id;
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
                grouping: {
                    autoExpandAll: true,
                },
                groupPanel: {
                    visible: true
                },
            });
    
            that.Component = $find.dxDataGrid("instance");
    
        };
        this.Init();

    }

    return Page;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Page;
else
    window.Page = Page;