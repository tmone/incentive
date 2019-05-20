"use strict";


var Province = (function () {

    var Province = function(options){
        var options = options || {};
        this.Name = "Province";
        this.Type = "dxDataGrid";
        this.id = options.id || (this.Name + (new Date()).getTime());
        this.Component = null;
        this.permit = getACL(this.Name) || {add:false, edit:false, delete:false};
        this.Data = new NCStore({url:'api/master/province',key:"id",permit:this.permit});
        this.Key = null;
        
        this.Init = function(){
            var that = this;
            var $find = $(that.id);
            
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
                dataSource:that.Data.Store(),
                editing: {
                    mode: "form",
                    allowUpdating: that.permit.edit || false,
                    allowDeleting: that.permit.delete || false,
                    allowAdding: that.permit.add || false,
                    form: {
                        colCount:1
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
                onSelectionChanged: function (e) {
                    that.Key = e.currentSelectedRowKeys[0];    
                          
                },
                columns: [{
                    dataField: "id",
                    allowEditing: false,
                    formItem: {
                        visible: false
                    }
                }
                , {
                    dataField: "province_name",
                    caption: "Name",
                    sortOrder: "asc",
                    validationRules: [{
                        type: "required"
                    }]
                }
                , {
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
    
    return Province;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Province;
else
    window.Province = Province;