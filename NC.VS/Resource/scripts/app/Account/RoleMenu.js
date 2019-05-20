"use strict";
var RoleMenu = (function () {

    var RoleMenu = function (options) {
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
                    url: getURL('api/core/menurole?$filter=allow eq 1 and role_id eq ' + id),
                    method: "GET"
                }).done(function (data) {
                    that.selected = [];
                    for(var i = 0; i< data.length; i++){
                        that.selected.push(data[i].menu_id);
                    };
                    that.Component.selectRows(that.selected);
                });
        }
        this.Init = function () {
            var that = this;
            var menuStore = new NCData({
                url: 'api/core/menu', callback: function (a) {
                    that.Component.option('dataSource',  a);
                }
            });
            
            var saveMenu = function(){
                var slt = that.Component.getSelectedRowKeys();
                if(slt.length>0){
                    $.ajax({
                        url: getURL('api/core/MenuRole/updateMenuByRole/' + that.RoleId+"?ml="+slt.join(',')),
                        method: "PUT",                        
                    }).done(function (data) {
                        DevExpress.ui.notify("Saved menu");
                    });
                }
            }
                
            var $find = $(that.id);
            if(!$find.length){
                var scriptTag = document.scripts[document.scripts.length - 1];
                var parentTag = scriptTag.parentNode;
                $find = $("<div id='"+that.Id+"'>").appendTo(parentTag);
            }

            function selectChild(k){
                var rs = [];
                var d = menuStore.data;
                for(var i = 0; i< d.length;i++){
                    if(d[i].parent_id == k)
                        rs.push(d[i].id);
                }
                return rs;
            }
            function childChoice(k){
                var chid = selectChild(k);
                if(chid.length>0){
                    //isLoadOrgchart = true;
                    that.Component.beginUpdate();
                    that.Component.selectRows(chid,true);
                    that.Component.endUpdate();
                    //isLoadOrgchart = false;
                    for(var i = 0; i< chid.length;i++){
                        childChoice(chid[i]);
                    }
                }
            }
                
            $find.dxTreeList({
                autoExpandAll:true,
                dataSource: menuStore.data || [],  
                keyExpr: "id",
                parentIdExpr: "parent_id",              
                selection: {
                    mode: "multiple",
                    recursive:false,
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
                onToolbarPreparing: function (e) {
                    var toolbarItems = e.toolbarOptions.items;
                    toolbarItems.push({
                        widget: 'dxButton',
                        location: 'before',                        
                        options: {
                            icon: 'save',
                            text: "Save",                            
                            onClick: function () {
                                saveMenu();
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
                        dataField: "title",                                            
                    },
                    {
                        dataField:"order",
                        sortOrder:"asc",
                    }
                ],
    
            });
    
    
            that.Component = $find.dxTreeList("instance");
    
        }
        this.Init();
    }

    RoleMenu.prototype.UpdateRole = function (RoleId) {
        this.RoleId = RoleId;
        this.UpdateMenuRole(RoleId);        
    }

    

    return RoleMenu;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = RoleMenu;
else
    window.RoleMenu = RoleMenu;