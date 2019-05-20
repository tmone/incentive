"use strict";


var DistrictSingle = (function () {

    var DistrictSingle = function (options) {
        var options = options || {};
        this.Name = "District";
        this.Type = "dxDataGrid";
        this.id = options.id || (this.Name + (new Date()).getTime());
        this.Component = null;
        this.permit = getACL(this.Name) || {add:false, edit:false, delete:false};
        this.ProvinceId = options.provinceid || null;
        this.Data = new NCStore({
            url: 'api/master/district', key: "id", filter: this.ProvinceId ? ["province_id=" + this.ProvinceId] : [], permit: this.permit
        });
        this.Key = null;

        this.Init = function () {
            var that = this;
            var provinceStore = new NCData({
                url: 'api/master/province', callback: function (a) {
                    that.Component.columnOption('province_id', 'lookup.dataSource', a);
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
                groupPanel: {
                    visible: true
                },
                headerFilter: {
                    visible: true
                },
                showRowLines: true,
                showBorders: true,
                onInitNewRow: function (e) {
                    e.data.province_id = that.ProvinceId;
                },
                onSelectionChanged: function (e) {
                    that.Key = e.currentSelectedRowKeys[0];
                },
                columns: [{
                    dataField: "id",
                    visible: false,
                    formItem: {
                        visible: false,
                    }
                },
                {
                    dataField: "district_name",
                    caption: "Name",
                    sortOrder: "asc",
                    validationRules: [{
                        type: "required"
                    }]
                }, 
                {
                    dataField: "_orc_code",
                    caption: "Code",                    
                    validationRules: [{
                        type: "required"
                    }],
                    visibleIndex:0,
                    width:"75px",
                }, 
                {
                    dataField: "remote_area",                                       
                    width:"100px",
                }, 
                {
                    dataField: "province_id",
                    caption: "Province",
                    validationRules: [{
                        type: "required"
                    }],
                    //visible: false,
                    lookup: {
                        dataSource: provinceStore.data,
                        valueExpr: "id",
                        displayExpr: function(o){return "["+o.province_code+"] "+ o.province_name;}
                    },
                    groupIndex:0,
                }
                    , {
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

    DistrictSingle.prototype.UpdateProvince = function (provinceId) {
        this.ProvinceId = provinceId || null;
        this.Data.filter = this.ProvinceId ? ["province_id=" + this.ProvinceId] : [];
        this.Component.refresh();
    }

    return DistrictSingle;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = DistrictSingle;
else
    window.DistrictSingle = DistrictSingle;