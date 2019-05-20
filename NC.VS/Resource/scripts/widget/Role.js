"use strict";


var Role = (function () {

    var Role = function(options){
        var options = options || {};
        this.Name = "Roles";
        this.Type = "dxTreeList";
        this.id = options.id || (this.Name + (new Date()).getTime());
        this.Component = null;
        this.permit = getACL(this.Name) || {add:false, edit:false, delete:false, addRoot:false, setDefault:false};
        this.Data = new NCStore({url:'api/core/role',key:"id",permit: this.permit});
        this.selected = options.selected || [];
        this.expanded = options.expanded || [];        
        this.Key = null;
        
        this.Init = function(){
            var that = this;
            var $find = $(that.id);
             
            if(!$find.length){
                var scriptTag = document.scripts[document.scripts.length - 1];
                var parentTag = scriptTag.parentNode;
                $find = $("<div id='"+that.Id+"'>").appendTo(parentTag);
            }
            
            function updateDefault(k) {
                /* for (var i = 0; i < arrayStore._array.length; i++) {
                    var tmp = arrayStore._array[i];
                    if (tmp.id == k) {
                        tmp._default = true;
                    } else {
                        tmp._default = false;
                    }
                } */
            }
                
            $find.dxTreeList({
                dataSource: that.Data.Store(),
                editing: {
                    mode: "form",
                    form: {
                        colCount:1,
                    }   
                },
                keyExpr: "id",
                parentIdExpr: "parent_id",
                columnAutoWidth: true,
                wordWrapEnabled: true,
                expandedRowKeys: that.expanded,
                selectedRowKeys: that.selected,
                searchPanel: {
                    visible: true,                
                },
                onToolbarPreparing: function (e) {
                    var toolbarItems = e.toolbarOptions.items;
                    toolbarItems.push({
                        widget: 'dxButton',
                        location: 'before',                        
                        options: {
                            icon: 'add',
                            text: "Add Root",
                            visible: that.permit.addroot || false,
                            onClick: function () {
                                that.Component.addRow();
                            }
                        },
                        
                    });
                },
                onContextMenuPreparing: function (e) {
                    if (e.row.rowType === "data") {
                        var k = e.component.getKeyByRowIndex(e.row.rowIndex);
                        var numu = e.row.data.NumUser > 0 ? false : true;
                        var defau = e.row.data._default?false:true;
                        e.items = [{
                            text: "Add Child",
                            visible: that.permit.add || false,
                            onItemClick: function () {                           
                                if(k)
                                    that.Component.addRow(k);
                            }
                        },
                        {
                            text: "Edit",
                            visible: that.permit.edit || false,
                            onItemClick: function () {
                                that.Component.editRow(e.row.rowIndex);
                            }
                        },
                        {
                            text: "Delete",
                            visible: numu && (that.permit.delete || false),
                            onItemClick: function () {
                                that.Component.deleteRow(e.row.rowIndex);
                            }
                        },{
                            text: "Set Default",
                            beginGroup: true,
                            visible: defau && (that.permit.setDefault || false),
                            onItemClick: function () {                            
                                if (k && (that.permit.setDefault || false)) {
                                    $.ajax({
                                        url: getURL('api/core/roleDefault/setDefault/' + k),
                                        method: "PUT",
                                        data: k                                    
                                    }).done(function () {
                                        //updateDefault(k);
                                        e.component.refresh();                                    
                                    })
                                }
                            }
                        }];
                    }
                },            
                onSelectionChanged: function (e) {
                    that.selected = e.currentSelectedRowKeys; 
                    that.Key = e.currentSelectedRowKeys[0];                 
    
                },                    
                headerFilter: {
                    visible: true
                },
                selection: {
                    mode: "single"
                },
                columns: [
                    {
                        dataField: "role_name",
                        caption: "Name",
                        cellTemplate: function (container, options) {
                            var def = $("<span class='pull-right badge bg-green'>Default</span>");
                            var num = $("<span class='pull-right badge bg-red'>").text(options.data.NumUser);
                            var div = $("<div>").append($("<span>").text(options.value));
                            if (options.data.NumUser > 0) {
                                div.append(num);
                            }                            
                            if (options.data._default==true) {
                                div.append(def);
                            }
                            div.appendTo(container);
                        }
                    }, {
                        dataField: "description",
                        visible: false,
                    }, {
                        dataField: "weight",
                        dataType:"number"
                    }
                    , {
                        dataField: "_active",
                        caption: "Active",
                        width: 90,
                        formItem: {
                            visible: false
                        }
                    }
                ]
    
            });
    
            that.Component = $find.dxTreeList("instance");
    
        }
        this.Init();
        
    };
    
    return Role;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Role;
else
    window.Role = Role;