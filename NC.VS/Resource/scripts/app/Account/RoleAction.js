"use strict";
var RoleAction = (function () {

    var RoleAction = function (options) {
        var options = options || {};
        this.Name = "Roles";
        this.Type = "dxTreeList";
        this.id = options.id || (this.Name + (new Date()).getTime());
        this.Component = null;
        this.permit = getACL(this.Name) || { addUser: false,  deleteUser: false };

        this.selected = options.selected || [];
        this.RoleId = options.roleid || null;        
        this.UserData = [];//new NCStore({ url: 'api/core/userrole',filter: ["role_id=" + this.RoleId],permit: this.permit});
        this.UpdateMenuRole = function(id) {
            var that = this;
            if (id)
                $.ajax({
                    url: getURL('api/core/CraftPageActionRole/getActionByRole/' + id),
                    method: "GET"
                }).done(function (data) {
                    //that.selected = [];
                    //for(var i = 0; i< data.length; i++){
                    //    that.selected.push(data[i].menu_id);
                    //};
                    that.Component.option('dataSource',data);
                });
        }
        this.Init = function () {
            var that = this;
            var pageStore = new NCData({
                url: "api/core/page",
                callback: function (a) {
                    if (that.Component) {
                        that.Component.beginUpdate();
                        that.Component.columnOption('page_id', 'lookup.dataSource', a);
                        that.Component.endUpdate();
                    }
                }
            });
            
            var saveAction = function(){
                that.Component.getSelectedRowsData().then(function (rowData) {
                    var dat = [];
                    for(var i = 0; i< rowData.length; i++){
                        dat.push(rowData[i].id+'_'+rowData[i].page_id);
                    }
                    if(dat.length>0){
                        $.ajax({
                            url: getURL('api/core/CraftPageActionRole/updateActionByRole/' + that.RoleId+"?al="+dat.join(',')),
                            method: "PUT",                        
                        }).done(function (data) {
                            DevExpress.ui.notify("Saved Action");
                        });
                    }
                });                
            }
                
            var $find = $(that.id);
            if(!$find.length){
                var scriptTag = document.scripts[document.scripts.length - 1];
                var parentTag = scriptTag.parentNode;
                $find = $("<div id='"+that.Id+"'>").appendTo(parentTag);
            }

            // function selectChild(k){
            //     var rs = [];
            //     var d = menuStore.data;
            //     for(var i = 0; i< d.length;i++){
            //         if(d[i].parent_id == k)
            //             rs.push(d[i].id);
            //     }
            //     return rs;
            // }
            // function childChoice(k){
            //     var chid = selectChild(k);
            //     if(chid.length>0){
            //         //isLoadOrgchart = true;
            //         that.Component.beginUpdate();
            //         that.Component.selectRows(chid,true);
            //         that.Component.endUpdate();
            //         //isLoadOrgchart = false;
            //         for(var i = 0; i< chid.length;i++){
            //             childChoice(chid[i]);
            //         }
            //     }
            // }
                
            $find.dxDataGrid({
                autoExpandAll:true,
                dataSource: [], 
                keyExpr:'id',                        
                selection: {
                    mode: "multiple", 
                    deferred:true,   
                    selectAllMode:"allPages",               
                },
                selectionFilter:["allow","=",true],
                searchPanel: {
                    visible: true,
                    placeholder: "Search..."
                },
                headerFilter: {
                    visible: true
                },
                showRowLines: true,
                showBorders: true,
                onToolbarPreparing: function (e) {
                    var toolbarItems = e.toolbarOptions.items;
                    toolbarItems.push({
                        widget: 'dxButton',
                        location: 'before',                        
                        options: {
                            icon: 'save',
                            text: "Save",                            
                            onClick: function () {
                                saveAction();
                            }
                        },
                        
                    },
                    {
                        widget: 'dxButton',
                        location: 'before',                        
                        options: {
                            icon: 'revert',
                            text: "Clear",                                                            
                            onClick: function () {
                                //isLoadOrgchart = true;
                                that.Component.beginUpdate();
                                that.Component.selectRows([]);
                                that.Component.endUpdate();
                                //isLoadOrgchart = false;
                            }
                        },
                        
                    }
                    // {
                    //     widget: 'dxCheckBox',
                    //     location: 'before',                        
                    //     options: {                            
                    //         text: "Auto",
                    //         value:true,                            
                    //         onValueChanged: function (e) {
                    //             that.Component.option("selection.recursive",e.value);
                    //         }
                    //     },
                        
                    // }
                );
                },
                columns: [
                    {
                        dataField: "page_id",   
                        groupIndex:1,
                        caption: "Page",
                        lookup: {
                            dataSource: pageStore.data || [],
                            valueExpr: "id",
                            displayExpr: "page_name"
                        },                                       
                    },
                    {
                        dataField:"title",
                        sortOrder:"asc",
                    }
                ],
    
            });
    
    
            that.Component = $find.dxDataGrid("instance");
    
        }
        this.Init();
    }

    RoleAction.prototype.UpdateRole = function (RoleId) {
        this.RoleId = RoleId;
        this.UpdateMenuRole(RoleId);        
    }

    

    return RoleAction;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = RoleAction;
else
    window.RoleAction = RoleAction;