"use strict";


var Service = (function () {

    var Service = function(options){
        var options = options || {};
        this.Name = "Service";
        this.Type = "dxDataGrid";
        this.id = options.id || (this.Name + (new Date()).getTime());
        this.Component = null;
        this.permit = getACL(this.Name) || {add:false, edit:false, delete:false};
        this.Data = new NCStore({url:'api/master/service',key:"id",permit:this.permit});
        this.Key = null;
        
        this.Init = function(){
            var that = this;
            var $find = $(that.id);
            
            
            if(!$find.length){
                var scriptTag = document.scripts[document.scripts.length - 1];
                var parentTag = scriptTag.parentNode;
                $find = $("<div id='"+that.id+"'>").appendTo(parentTag);
            }
            function checkCode(e){
                //var dat = that.Data.Store().load();
                return true;
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
                dataSource:that.Data.Store(),
                editing: {
                    mode: "form",
                    allowUpdating: that.permit.edit || false,
                    allowDeleting: that.permit.delete || false,
                    allowAdding: that.permit.add || false,
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
                columns: [{
                    dataField: "id",
                    visible: false,
                    formItem: {
                        visible: false
                    }
                }
                , {
                    dataField: "service_name",
                    caption: "Name",
                    sortOrder: "asc",
                    validationRules: [{
                        type: "required"
                    }],
                    setCellValue: function(newData, value, currentRowData) {
                        newData.service_name = value;
                        newData._orc_name = value;
                    },
                },
                {
                    dataField: "service_code",
                    caption: "Code",
                    sortOrder: "asc",
                    validationRules: [{
                        type: "required"
                    },{
                        type:"pattern",
                        pattern: "0[234][0-9]+$",
                        message: "Code is begin 02, 03, 04"
                    },{
                        
                            type: 'custom',
                            validationCallback: checkCode,
                            message: "Duplicate value with another"
                       
                    }],
                    setCellValue: function(newData, value, currentRowData) {
                        newData.service_code = value;
                        newData._orc_code = value;
                    },  
                    visibleIndex:0,
                    width:"75px",
                },
                 {
                    dataField: "_active", 
                    caption: "Active",
                    formItem: {
                        visible: false,
                    },
                    width:"75px",
                }],
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
            });
    
    
            that.Component = $find.dxDataGrid("instance");
    
        }

        this.Init();
    }
    
    return Service;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Service;
else
    window.Service = Service;