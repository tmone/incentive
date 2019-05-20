"use strict";


var Orgchart = (function () {

    var Orgchart = function(options){
        var options = options || {};
        this.Name = "OrgchartTree";
        this.Type = "dxTreeList";
        this.id = options.id || (this.Name + (new Date()).getTime());
        this.Component = null;
        this.permit = getACL(this.Name) || {add:false, edit:false, delete:false, addRoot:false};
        this.Data = new NCStore({url:'api/core/orgchart',key:"id",permit: this.permit});        
        this.Key = null; 
        this.Init = function(){
            var that = this;
            var $find = $(that.id);
            
            
            if(!$find.length){
                var scriptTag = document.scripts[document.scripts.length - 1];
                var parentTag = scriptTag.parentNode;
                $find = $("<div id='"+that.Id+"'>").appendTo(parentTag);
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
                        var numu = e.row.data.NumUser > 0 ? false : true;
                        e.items = [{
                            text: "Add Child",
                            visible: that.permit.add || false,
                            onItemClick: function () {
                                //DevExpress.ui.notify(e.row.rowIndex);
                                var k = e.component.getKeyByRowIndex(e.row.rowIndex);
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
                        }];
                    }
                },            
                onSelectionChanged: function (e) {
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
                        dataField: "org_name",
                        caption: "Name",
                        cellTemplate: function (container, options) {                            
                            var num = $("<span class='pull-right badge bg-red'>").text(options.data.NumUser);
                            var div = $("<div>").append($("<span>").text(options.value));
                            if (options.data.NumUser > 0) {
                                div.append(num);
                            }
                            if (options.data._default == true) {
                                div.append(def);
                            }
                            div.appendTo(container);
                        }
                    }, {
                        dataField: "description",                        
                        visible:false,
                    }, {
                        dataField: "_active",
                        caption: "Active",
                        width: 90,
                        formItem: {
                            visible:false
                        }
                    }
                ]
    
            });
    
            that.Component = $find.dxTreeList("instance");
    
        };
        this.Init();
    };

        
    return Orgchart;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Orgchart;
else
    window.Orgchart = Orgchart;