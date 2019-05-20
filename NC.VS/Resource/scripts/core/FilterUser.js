"use strict";


var FilterUser = (function () {

    var FilterUser = function (options) {
        var options = options || {};
        this.Name = "Filter";
        this.Type = "dxDataGrid";
        this.id = options.id || (this.Name + (new Date()).getTime());
        this.Component = null;
        this.permit = getACL(this.Name) || {addDistrict:false, editDistrict:false, deleteDistrict:false};
        this.TableName = options.tablename || null;
        this.Data = new NCStore({
            url: 'api/core/filterUser', key: "id", filter: this.TableName ? ["table_name='" + this.TableName+"'"] : [], permit: this.permit
        });
        this.Key = null;

        this.Init = function () {
            var that = this;
            var userStore = new NCData({
                url: 'api/core/user', callback: function (a) {
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
                paging: {
                    pageSize: 10
                },
                dataSource: that.Data.Store(),                
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
                onSelectionChanged: function (e) {
                    that.Key = e.currentSelectedRowKeys[0];
                },
                onInitNewRow: function (e) {
                    e.data.table_name = that.TableName;
                    e.data._active = true;                    
                },
                columnAutoWidth: true,
                showBorders: true,
                showRowLines: true,
                wordWrapEnabled: true,
                
                editing: {
                    mode: "cell",
                    allowUpdating: that.permit.editRole || false,
                    allowDeleting: that.permit.deleteRole || false,
                    allowAdding: that.permit.addRole || false
                },                
                columns: [
                    {
                        dataField: "user_id",
                        caption: "User",
                        lookup: {
                            dataSource: userStore.data,
                            valueExpr: "id",
                            displayExpr: "username"
                        }

                    },
                    {
                        dataField: "_active",
                        caption:"Active",
                        dataType: "boolean",
                        
                    },
                    
                ],               
    
            });
    
    
            that.Component = $find.dxDataGrid("instance");
    
        } 

        this.Init();
    }

    FilterUser.prototype.UpdateKey = function (key) {
        this.TableName = key || null;
        this.Data.filter = this.TableName ? ["table_name='" + this.TableName+"'"] : [];
        this.Component.refresh();
    }

    return FilterUser;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = FilterUser;
else
    window.FilterUser = FilterUser;