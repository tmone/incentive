"use strict";


var Depting = (function () {

    var Depting = function(options){
        var options = options || {};
        this.Name = "Depting";
        this.Type = "dxDataGrid";
        this.id = options.id || (this.Name + (new Date()).getTime());
        this.Component = null;
        this.permit = getACL(this.Name) || {add:false, edit:false, delete:false};
        this.Data = null;//new NCStore({url:'api/Accounting/Report/Depting?org=50',key:"FPT_CONG_NO_KH_ID",permit:this.permit});
        this.Key = [];
        
        this.Init = function(){
            var that = this;
            var $find = $(that.id);
            
            var $find = $(that.id);

            if(!$find.length){
                var scriptTag = document.scripts[document.scripts.length - 1];
                var parentTag = scriptTag.parentNode;
                $find = $("<div id='"+that.id+"'>").appendTo(parentTag);
                $("<div id='popup'>").appendTo(parentTag);
            }
            var localSource = [];
            var popup = null,
                popupOptions = {
                    width: 600,
                    height: 500,
                    contentTemplate: function() {
                        localSource = [];
                        var dat;
                        var tmp = that.Component.getSelectedRowsData();
                        if(tmp && tmp.length>0){
                            dat = tmp[0];
                        }
                        $.ajax({
                            type: "GET",
                            url: getURL("api/core/userconfig/GetByType?type=layout.report.accounting"),
                            async:false,
                            data: {                                
        
                            },
                            success: function (result) { 
                                var found;                               
                                if(result && result.length>0){
                                    var empty;
                                    for(var i =0; i< result.length; i++){
                                        if(result[i].name == dat.MA_KH){
                                            found = JSON.parse(result[i].config);
                                            break;
                                        }
                                        if(!empty && (!result[i].name || result[i].name == "")){
                                            empty = JSON.parse(result[i].config);
                                        }
                                    }
                                    if(found){
                                        localSource = found;
                                    }else if(empty){
                                        localSource = empty;
                                    }
                                }
                                if(!found){
                                    $.ajax({
                                        type: "GET",
                                        url: getURL("api/Accounting/ColumnDefault"),
                                        async:false,
                                        success: function (rs) { 
                                            localSource = rs;
                                        }
                                    });
                                }
                            },
                        });
                        var dlist = $("<div id='selectNV'>").dxDataGrid({
                            height:342,
                            paging:{
                                enabled:false,
                            },
                            dataSource:localSource,
                            showBorders:true,  
                            editing:{
                                allowUpdating: true,
                                mode:"cell",
                            },     
                            showRowLines:true,                                             
                            columns:[
                                {
                                    dataField:"name",
                                    caption:"Tên", 
                                    visible:false,                                   
                                },                                
                                {
                                    dataField:"description",
                                    caption:"Tiêu đề",                                    
                                },
                                {
                                    dataField:"width",
                                    caption:"Độ rộng cột",  
                                    width:75,                                  
                                },
                                {
                                    dataField:"format",
                                    caption:"Định dạng",
                                    width:150,                                    
                                },
                                {
                                    dataField:"order",
                                    caption:"Thứ tự", 
                                    sortOrder:"asc",  
                                    width:75,                                                                   
                                },
                                {
                                    dataField:"_active",
                                    caption:"Chọn", 
                                    width:50,                                   
                                },                                
                            ],
                        });
                        return dlist;
                    },
                    showTitle: true,
                    title: "Tùy chỉnh dữ liệu",
                    visible: false,
                    dragEnabled: true,
                    closeOnOutsideClick: true,
                    toolbarItems:[{
                        toolbar:'bottom',
                        widget:'dxButton',
                        location:'after',
                        options:{
                            icon:"download",
                            text:"Tải về",
                            onClick:function(e){
                                //DevExpress.ui.notify(that.selectedUser);
                                popup.hide();
                                that.Component.beginCustomLoading("Đang tải...");
                                var dat;
                                var tmp = that.Component.getSelectedRowsData();
                                if(tmp && tmp.length>0){
                                    dat = tmp[0];
                                }
                                var sname = "";
                                if(dat && dat.MA_KH){
                                    sname = dat.MA_KH;
                                }
                                $.ajax({
                                    type: "PUT",
                                    url: getURL("api/core/userconfig/addConfig"),
                                    async:false,
                                    data: {
                                        key:sname,     
                                        config:JSON.stringify(localSource),  
                                        type:"layout.report.accounting",                                                                                                          
                                    },
                                    success: function (result) {
                                        //DevExpress.ui.notify("Đã lưu","success",2000);                                           
                                    },
                                });
                                
                                
   
                                window.open(getURL('api/accounting/report/getExcelCusomsize?c='+sname+'&t=layout.report.accounting&id='+that.Key.join(',')));

                                // }else{
                                //     DevExpress.ui.notify("No select or Data very larger...Selected: "+that.Key.length,"warning",2000);
                                
                                // }
                                that.Component.endCustomLoading();
                                
                            }
                        },
                        
                    },{
                        toolbar:'bottom',                        
                        location:'before',
                        widget:'dxButton',
                        options:{
                            elementAttr:{style:"min-width: 0;"},
                            icon:"revert",
                            hind:"Khôi phục",
                            onClick:function(e){
                                $.ajax({
                                    type: "GET",
                                    url: getURL("api/Accounting/ColumnDefault"),
                                    async:false,
                                    success: function (rs) { 
                                        localSource = rs;
                                        var grid = $("#selectNV").dxDataGrid("instance");
                                        grid.option("dataSource",rs);
                                        grid.refresh();
                                    }
                                });
                            }
                        }
                    }, {
                        toolbar: 'bottom',
                        location: 'before',
                        widget: 'dxCheckBox',
                        options: {
                            elementAttr: { style: "min-width: 0;" },
                            //icon:"revert",
                            text: "Chọn",
                            onValueChanged: function (e) {
                                $.ajax({
                                    type: "GET",
                                    url: getURL("api/Accounting/ColumnDefault"),
                                    async: false,
                                    success: function (rs) {
                                        rs.map(a => a._active = e.value);
                                        localSource = rs;
                                        var grid = $("#selectNV").dxDataGrid("instance");
                                        grid.option("dataSource", rs);
                                        grid.refresh();
                                    }
                                });
                            }
                        }
                    }],
            };
            
            var showInfo = function() {                
                if(popup) { 
                    $(".popup").remove();
                }
                var $popupContainer = $("<div />")
                                        .addClass("popup")
                                        .appendTo($("#popup"));
                popup = $popupContainer.dxPopup(popupOptions).dxPopup("instance");
                popup.show();
            };

            var isLoad = true;
            var DAT = [];
            
                
            var khStore = new NCData({
                url: 'api/Accounting/Report/Depting',
                callback: function (a) {
                    DAT = a;

                    that.Component.option("dataSource", DAT);
                    isLoad = false;
                    that.Component.endCustomLoading();

                }
            });                       //if(OL && OL.length){
                                   //     var C = OL.length;
                                   //     for(var i = 0; i< OL.length;i++)
                                   //         var khStore = new NCData({
                                   //             url: 'api/Accounting/Report/Depting?org=' + OL[i],
                                   //             callback:function(a){
                                   //                 DAT = DAT.concat(a);
                                   //                 if(--C<=0){
                                   //                     that.Component.option("dataSource",DAT);
                                   //                     isLoad = false;
                                   //                     that.Component.endCustomLoading();
                                   //                 }
                                   //             }
                                   //         });
                                   // }

            
            var onAFile = false;
            
            $find.dxDataGrid({
                // stateStoring: {
                //     enabled: true,
                //     type: "localStorage",
                //     storageKey: "lc_"+that.Name
                // },
                paging: {
                    pageSize: 50
                },
				pager: {
					showPageSizeSelector: true,
					allowedPageSizes: [10, 20, 50, 100, 200],
					showInfo: true
				},
                // scrolling: {
                //     mode: "virtual",
                //     rowRenderingMode: "virtual"
                // },
                dataSource:DAT || [], 
                keyExpr:"FPT_CONG_NO_KH_ID",               
                selection: {
                    mode: "multiple",
                    selectAllMode:"allPages",
                    //showCheckBoxesMode:"always",
                },
                searchPanel: {
                    visible: true,                
                    placeholder: "Search..."
                },
                sorting: {
                    mode: "multiple"
                },
                filterRow: {
                    visible: true,
                    applyFilter: "auto"
                },
                filterPanel: { visible: true },
                headerFilter: {
                    visible: true
                },
                grouping: {
                    autoExpandAll: true,
                },
                groupPanel: {
                    visible: true
                },                                           
                filterBuilderPopup: {
                    position: { of: window, at: "top", my: "top", offset: { y: 10 } },
                },
                showRowLines: true,
                showBorders: true,
                onSelectionChanged: function (e) {
                    that.Key = e.selectedRowKeys;   
                    if(that.Key.length>1){
						onAFile = true;
						$("#chAFile").show();
					}else{
						onAFile = false;
						$("#chAFile").hide();
					}
                },
                //beginCustomLoading(messageText)
                //endCustomLoading()
                onContentReady:function(e){
                    if(isLoad){
                        e.component.beginCustomLoading("Loading...");
                    }
                },
                onToolbarPreparing: function (e) {
                    var toolbarItems = e.toolbarOptions.items;
                    toolbarItems.push({
                        widget: 'dxButton',
                        location: 'before',                        
                        options: {
                            icon: 'refresh',                            
                            hind: "Refresh",                            
                            onClick: function () {
                                that.Component.refresh();
                            }
                        },
                        
                    },
                    {
                        widget: 'dxButton',
                        location: 'before',                        
                        options: {
                            icon: 'toolbox',                            
                            hind: "Customize", 
                            text: "Xuất Excel",                           
                            onClick: function () {
                                if(that.Key.length>0 ){
                                    showInfo();
                                }else{
                                    DevExpress.ui.notify("Phải chọn một bảng kê...","warning",2000);
                                }
                            }
                        },
                        
                    },
                    {
                        widget: 'dxButton',
                        location: 'before',                        
                        options: {
                            //icon: 'refresh',                            
                            //hind: "Refresh", 
                            text:"Bảng kê công nợ Excel",                           
                            onClick: function () {
                                //download excel
                                if(that.Key.length>0 && that.Key.length<1000){
   
                                    window.open(getURL('api/accounting/report/getDepting?t=xlsx&c=false&id='+that.Key.join(',')));

                                }else{
                                    DevExpress.ui.notify("No select or Data very larger...Selected: "+that.Key.length,"warning",2000);
                                
                                }
                            }
                        },
                        
                    },
                    {
                        widget: 'dxButton',
                        location: 'before',                        
                        options: {
                            //icon: 'refresh',                            
                            //hind: "Refresh", 
                            text:"In bảng kê công nợ PDF",                           
                            onClick: function () {
                                //open PDF
                                if(that.Key.length>0 && that.Key.length<1000){
                                    window.open(getURL('api/accounting/report/getDepting?t=pdf&c=false&id='+that.Key.join(',')));

                                }else{
                                    DevExpress.ui.notify("No select or Data very larger...Selected: "+that.Key.length,"warning",2000);
                                }
                            }
                        },
                        
                    },
                    {
                        widget: 'dxCheckBox',
                        location: 'before',  
						visible:false,						
                        options: {
							elementAttr:{id:"chAFile"},
                            //icon: 'refresh',                            
                            //hind: "Refresh", 
                            text:"One File",  
                            value:onAFile,                         
                            onValueChanged: function (e) {
                                onAFile = e.value;
                            }
                        },
                        
                    },
                );
                },
                allowColumnResizing: true,
                columnResizingMode: "nextColumn",
                // columnMinWidth: 50,
                //columnAutoWidth: true,
                columns: [
                    {
                        dataField: "FPT_CONG_NO_KH_ID",
                        caption: "Mã công nợ",
                        sortOrder: "asc",
                        sortIndex:1,
                        
                    },
                    {
                        dataField:"ORG_VALUE",
                        caption:"Mã CN",
                        groupIndex:0,
                        
                    },
                    {
                        dataField:"TEN_KH",
                        caption:"Tên KH",
                        // lookup:{
                        //     dataSource:[],//customerStore.data,
                        //     valueExpr:"id",
                        //     displayExpr:"customer_name"
                        // }
                    },
                    {
                        dataField:"MA_KH",
                        caption:"Mã KH",
                        
                    },
                    {
                        dataField:"SL_VD",   
                        caption:"SL VĐ",
                        dataType:"number",
                        format:"###,##0"                     
                    },
                    {
                        dataField:"SL_VD_CHOT",
                        caption:"SL VĐ Chốt",   
                        dataType:"number",
                        format:"###,##0"                   
                    },
                    {
                        dataField:"TRANG_THAI",
                        caption:"Trạng thái",   
                                         
                    },
                    {
                        dataField:"THANG",
                        caption:"Tháng",
                        //format:"MM/yyyy",
                    },                    
                    {
                        dataField:"NV_KIEM_SOAT",
                        caption:"NV kiểm soát",                        
                    }
            
                ],
                
            });
    
    
            that.Component = $find.dxDataGrid("instance");
			$("#chAFile").hide();
    
        }

        this.Init();
    }
    
    return Depting;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Depting;
else
    window.Depting = Depting;