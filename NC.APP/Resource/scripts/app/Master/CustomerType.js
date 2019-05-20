"use strict";


var CustomerType = (function () {

    var CustomerType = function(options){
        var options = options || {};
        this.Name = "Customer";
        this.Type = "dxDataGrid";
        this.id = options.id || (this.Name + (new Date()).getTime());
        this.Component = null;
        this.permit = getACL(this.Name) || {add:false, edit:false, delete:false, addRoot:false};
        this.Data = new NCStore({url:'api/master/customertype',key:"id",permit: this.permit});        
        this.Key = null; 
        this.Init = function(){
            var that = this;
            var $find = $(that.id);
            
            
            if(!$find.length){
                var scriptTag = document.scripts[document.scripts.length - 1];
                var parentTag = scriptTag.parentNode;
                $find = $("<div id='"+that.Id+"'>").appendTo(parentTag);
            }

            
    
            $find.dxDataGrid({
                dataSource: that.Data.Store(),
                editing: {
                    mode: "form",
                    form: {
                      colCount:1,
                    }   ,
                    allowUpdating: that.permit.edit || false,
                    allowDeleting: that.permit.delete || false,
                    allowAdding: that.permit.add || false,
                },                
                showRowLines: true,
                showBorders: true,
                keyExpr: "id",                
                columnAutoWidth: true,
                wordWrapEnabled: true,   
                autoExpandAll: false,             
                searchPanel: {
                    visible: true,   
                    width:'100px',             
                },
                        
                onSelectionChanged: function (e) {
                    that.Key = e.currentSelectedRowKeys[0];                                
                }, 
                onInitNewRow:function(e){
                    //e.data._orc_sync='I';
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
                
                headerFilter: {
                    visible: true
                },
                selection: {
                    mode: "single"
                },
                columns: [
                    {
                        dataField: "name",                                  
                        validationRules: [{
                            type: "required",
                        }],
                    },                     
                    {
                        dataField:"_active",
                        visible:false,
                    }

                ]
    
            });
    
            that.Component = $find.dxDataGrid("instance");
    
        };
        this.Init();
    };

        
    return CustomerType;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = CustomerType;
else
    window.CustomerType = CustomerType;