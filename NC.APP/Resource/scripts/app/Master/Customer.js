"use strict";


var Customer = (function () {

    var Customer = function (options) {
        var options = options || {};
        this.Name = "Customer";
        this.Type = "dxDataGrid";
        this.id = options.id || (this.Name + (new Date()).getTime());
        this.Component = null;
        this.permit = getACL(this.Name) || { add: false, edit: false, delete: false };
        this.GroupId = options.groupid || null;
        this.Data = new NCStore({
            url: 'api/master/customer', key: "id", filter: this.GroupId ? ["group_id=" + this.GroupId] : [], permit: this.permit
        });
        this.Key = null;
        this.editorTemplate;

        this.Init = function () {
            var that = this;
            var groupStore = new NCStore({
                url: 'api/master/customergroup',
                // callback: function (a) {
                //     that.Component.columnOption('group_id', 'lookup.dataSource', a);
                // }
                key: "id",
            });
            var typeStore = new NCStore({
                url: 'api/master/customertype',
                // callback: function (a) {
                //     that.Component.columnOption('group_id', 'lookup.dataSource', a);
                // }
                key: "id",
            });

            var $find = $(that.id);
            if (!$find.length) {
                var scriptTag = document.scripts[document.scripts.length - 1];
                var parentTag = scriptTag.parentNode;
                $find = $("<div id='" + that.id + "'>").appendTo(parentTag);
                $("<div id='popupTemplate'>").append($("<div class='popupTemplate>'")).appendTo(parentTag);
            }
            var dataTemplate = {},
                popup = null,
                popupOptions = {
                    width: "95%",
                    //height: "100%",
                    contentTemplate: function (container) {
                        var scrollView = $("<div id='scrollView'>");
                        var gjs = $("<div id='gjs' />");
                        scrollView.append(gjs);
                        //gjs.html(dataTemplate.bill_template);

                        scrollView.dxScrollView({
                            height: '100%',
                            width: '100%'

                        });


                        container.append(scrollView);

                        return container;
                    },
                    toolbarItems: [
                        {
                            toolbar: 'bottom',
                            widget: "dxButton",
                            options: {
                                icon: "save",
                                text: "Save",
                                onClick: function () {
                                    //DevExpress.ui.notify(choiceData);
                                    //$.ajax({
                                    //    url: "/api/PickUp/SendSMS",
                                    //    method: "POST",
                                    //    data: {values:JSON.stringify(choiceData)}
                                    //})
                                    //.done(function( data ) {
                                    //    DevExpress.ui.notify("Sended SMS","success",2000);
                                    //});
                                    if (popup) {
                                        popup.hide();
                                    }
                                }
                            },

                        }
                    ],
                    showTitle: true,
                    title: "Bill Template",
                    visible: false,
                    dragEnabled: false,
                    closeOnOutsideClick: true
                };

            var showInfo = function (data) {
                dataTemplate = data;
                if (popup) {
                    $(".popupTemplate").remove();
                }
                var $popupContainer = $("<div />")
                    .addClass("popupTemplate")
                    .appendTo($("#popupTemplate"));
                popup = $popupContainer.dxPopup(popupOptions).dxPopup("instance");
                popup.show();
                that.editorTemplate = grapesjs.init({
                    showOffsets: 1,
                    noticeOnUnload: 0,
                    storageManager: { autoload: 0 },
                    container: '#gjs',
                    //fromElement: true,
                    //showDevices: true,
                    components: dataTemplate.bill_template,
                    style: `.portrait {
            padding: 5px;
            margin: 0px 0px;
            width: 8.264in;
            height: 5.3in;
            font: 0.9em Arial, Helvetica, sans-serif;
        }

        .titlea {
            width: 0.22in;
            height: 0.194in;
            text-align: center;
            background-color: #ec6c00;
            font-weight: bold;
            font-size: 0.8em;
            color: #fff;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
        }

        @@supports (-moz-appearance:meterbar) {
            .titlea {
                width: 0.22in;
                height: 0.194in;
                text-align: center;
                background-color: #ec6c00;
                font-weight: bold;
                font-size: 0.8em;
                color: #fff;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
        }

        hr {
            width: 100%;
            height: 0.5px;
            border-top: 1px solid #000;
        }

        td {
            font-size: 11px;
            font-family: Arial, Helvetica, sans-serif;
            margin: 4px 0px;
        }

        .m-checkbox {
            display: block;
            padding: 7px;
            width: 20px;
            height: 20px;
            text-align: center;
            font-weight: bold;
            border: 1px solid #000;
            line-height: 24px;
        }

        .table-bordered {
            border-collapse: collapse;
        }

            .table-bordered tr td {
                border: 1px solid #333;
            }

        #goods-metadata tr td {
            padding: 3px 2px;
        }

        .label {
            font-weight: normal;
        }

        .block-center,
        .block-center-input,
        .block-center-input-black {
            padding: 5px 5px;
            border: 1px solid #ddd;
            text-align: center;
            margin: 2px 0px;
        }

        .block-center-input {
            border: 1px solid #999;
            color: #eee;
            padding: 4px 2px;
        }

        .block-center-input {
            color: #000;
        }



        .divBorder {
            border-right: thick solid #ff0000;
            border-left: thick solid #ff0000;
            border-right-color: black;
            border-left-color: black;
            border-left-width: 2px;
            border-right-width: 2px;
        }

        @font-face {
            font-family: 'Code 128';
            src: url('./font/WebCode128H3.eot');
            src: url('./font/WebCode128H3.otf') format('opentype'), url('./font/WebCode128H3.woff') format('woff');
        }

        .barcodeVal {
            font-weight: normal;
            font-style: normal;
            line-height: normal;
            font-family: 'Code 128', san-serif;
            font-size: 32px;
        }

        .barcodeVal {
            white-space: pre;
        }
        .page-break{
            page-break-before: always;
        }

        html, body { height: auto; }

        @media all{
            .page-break{
                display: none;
            }
        }

        @media print {
            html, body {
                /* border: 1px solid white;
                height: 99%;
                page-break-after: avoid;
                page-break-before: avoid;
                margin: 0 !important;
                padding: 0 !important; */
                /* overflow: hidden; */
            }
            footer {page-break-after: avoid;}
            .page-break{
                min-height: 14px;
                display:block;
            }
            .portrait{
                page-break-after: always;
                overflow: hidden;
            }
        }`,
                    //plugins: ['gjs-preset-webpage'],

                });
            };

            var userStore = new NCData({
                url: 'api/master/employee', callback: function (a) {
                    that.Component.columnOption('employee_id', 'lookup.dataSource', a);
                }
            });

            $find.dxDataGrid({
                stateStoring: {
                    enabled: true,
                    type: "localStorage",
                    storageKey: that.Name,
                },
                allowColumnResizing: true,
                columnResizingMode: "nextColumn",
                columnMinWidth: 50,
                //columnAutoWidth: true,
                paging: {
                    pageSize: 50
                },
                pager: {
                    showPageSizeSelector: true,
                    allowedPageSizes: [10, 20, 50, 100, 200],
                    showInfo: true
                },
                groupPanel: {
                    visible: true
                },
                dataSource: that.Data.Store(),
                onToolbarPreparing: function (e) {
                    var toolbarItems = e.toolbarOptions.items;
                    // Adds a new item
                    toolbarItems.unshift({
                        widget: "dxButton",
                        //visible:false,
                        options: {
                            icon: "favorites",
                            text: "Template",
                            onClick: function () {
                                var data = that.Component.getSelectedRowsData();
                                showInfo(data[0]);
                            },
                        },
                        location: "after"
                    });
                },
                editing: {
                    mode: "form",
                    allowUpdating: that.permit.edit || false,
                    allowDeleting: that.permit.delete || false,
                    allowAdding: that.permit.add || false,
                    form: {
                        colCount: 1,
                        items: [
                            {
                                itemType: "tabbed",
                                tabs: [
                                    {
                                        title: "Thông tin chung",
                                        colCount: 2,
                                        items: [
                                            "customer_name",
                                            "group_id",
                                            "type_id",
                                            "description",
                                            "tax_id",
                                            "first_sale",
                                            "payment_id",
                                            "pricelist_id",
                                            "employee_id",
                                            "address",
                                            "phone",
                                            "fax",
                                            "_orc_partner_code",
                                            "_active"
                                        ]
                                    }, {
                                        title: "Bill Template",
                                        items: [
                                            {
                                                dataField: "bill_template",
                                                label: {
                                                    visible: false,
                                                },
                                            }
                                        ]
                                    }, {
                                        title: "Config",
                                        items: [
                                            {
                                                dataField: "config",
                                                label: {
                                                    visible: false,
                                                },
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                },
                // onEditorPreparing: function (e) {
                //     if (e.dataField == "bill_template")
                //         e.editorName = "dxTextArea";
                // },
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
                onInitNewRow: function (e) {
                    e.data.group_id = that.GroupId;
                },
                onSelectionChanged: function (e) {
                    that.Key = e.currentSelectedRowKeys[0];
                },
                columns: [{
                    dataField: "id",
                    visible: false,
                    formItem: {
                        editorOptions: {
                            readOnly: true,
                        }
                    }
                }
                    , {
                    dataField: "customer_name",
                    caption: "Name",
                    sortOrder: "asc",
                    validationRules: [{
                        type: "required"
                    }],
                    setCellValue: function (newData, value, currentRowData) {
                        newData.customer_name = value;
                        newData._orc_partner_name = value;
                    }
                },
                {
                    dataField: "group_id",
                    caption: "Group",
                    lookup: {
                        dataSource: groupStore.Store(),
                        valueExpr: "id",
                        displayExpr: "group_name"
                    },
                    groupIndex: 1,
                },
                {
                    dataField: "type_id",
                    caption: "Type",
                    lookup: {
                        dataSource: typeStore.Store(),
                        valueExpr: "id",
                        displayExpr: "name"
                    },
                },
                {
                    dataField: "description",
                },
                {
                    dataField: "tax_id",
                    caption: "MST",
                    visible: false,
                },
                {
                    dataField: "first_sale",
                    caption: "From",
                    visible: false,
                },
                {
                    dataField: "payment_id",
                    caption: "Payment",
                    visible: false,
                },
                {
                    dataField: "pricelist_id",
                    caption: "Price list",
                    visible: false,
                },
                {
                    dataField: "employee_id",
                    caption: "Employee",
                    lookup: {
                        dataSource: userStore.data,
                        valueExpr: "id",
                        displayExpr: function (o) { return "[" + o.id + "] " + o.full_name; }
                    },
                    width: '100px',


                },
                {
                    dataField: "address",
                    visible: false,
                },
                {
                    dataField: "phone",
                    visible: false,
                },
                {
                    dataField: "fax",
                    visible: false,
                },
                {
                    dataField: "_orc_partner_code",
                    caption: "Code",
                    //visible: false,
                    visibleIndex: 0,
                    width: '70px',
                },
                {
                    dataField: "_active",
                    caption: "Active",
                    visible: false,
                }, {
                    dataField: "bill_template",
                    caption: "Bill Template",
                    visible: false,
                    editCellTemplate: function (cellElement, cellInfo) {
                        // var vl = cellInfo.value;
                        // var div = $("<div>").dxTextArea({
                        //     height: 305,
                        //     value: vl,
                        //     placeholder: "Bấm [Ctr]+[L] để load mẫu",
                        //     onKeyDown: function (e) {
                        //         //console.log(e.event.ctrlKey,e.event.key);
                        //         if (e.event.ctrlKey && (e.event.key == "l" || e.event.key == "L")) {
                        //             let str = billPrintTemplate;
                        //             e.component.option("value", str);
                        //         }
                        //     },
                        //     onValueChanged: function (e) {
                        //         cellInfo.setValue(e.value.replace(/'/g, "''"));
                        //     }
                        // });
                        // //var div = $("<div id='summernote'>");
                        // cellElement.append(div);
                        // //$('#summernote').summernote({                            
                        // //    callbacks: {
                        // //        onChange: function (contents, $editable) {
                        // //            console.log('onChange:', contents, $editable);
                        // //        }
                        // //    }
                        // //});
                        // //$('#summernote').summernote('code', vl);
                        var div = $("<div id='editor' style='min-height: 305px; width: 100%'>").appendTo(cellElement);
                        $(cellElement).css("min-height", "305px");

                        var langTools = ace.require("ace/ext/language_tools");
                        var editor = ace.edit("editor");
                        var HtmlMode = ace.require("ace/mode/html").Mode;
                        editor.session.setMode(new HtmlMode());

                        editor.setOptions({
                            enableBasicAutocompletion: true,
                            enableSnippets: true,
                            enableLiveAutocompletion: true
                        });
                        // add command to lazy-load keybinding_menu extension
                        editor.commands.addCommand({
                            name: "loadDefaultTemplate",
                            bindKey: { win: "Ctrl-Alt-l", mac: "Command-Alt-l" },
                            exec: function (editor) {
                                let str = billPrintTemplate;
                                editor.setValue(str);
                            }
                        })

                        editor.setValue(cellInfo.value || "");
                        editor.on("change", function (e) {
                            var vl = editor.getValue().replace(/'/g, "''");
                            if (vl) {
                                cellInfo.setValue(vl);
                            } else {
                                cellInfo.setValue(null);
                            }
                        });
                    }

                },
                {
                    dataField: "config",
                    caption: "Cài đặt",
                    editCellTemplate: function (cellElement, cellInfo) {
                        var div = $("<div>").dxForm({
                            colCount: 2,
                            formData: JSON.parse(cellInfo.value),
                            items: [

                                {
                                    dataField: "issokien",
                                    label: {
                                        text: "Ẩn số kiện",
                                    },
                                    editorType: "dxCheckBox",

                                },
                                {
                                    dataField: "iskhoiluong",
                                    label: {
                                        text: "Ẩn khối lượng",
                                    },
                                    editorType: "dxCheckBox",

                                },
                                {
                                    dataField: "isquidoi",
                                    label: {
                                        text: "Ẩn KL quy đổi",
                                    },
                                    editorType: "dxCheckBox",

                                },
                                {
                                    dataField: "ka_display",
                                    label: {
                                        text: "Ẩn K.A.",
                                    },
                                    //editorType: "dxSwitch",
                                    // onValueChanged:function(e){

                                    // }
                                    template: function (data, itemElement) {
                                        let vl = data.component.option('formData')[data.dataField];
                                        let vls = true;
                                        if (vl && vl.length > 7) {
                                            if (vl.indexOf("block") > 7) {
                                                vls = false;
                                            };
                                        }

                                        itemElement.append("<div id='ka_container'>")
                                            .dxCheckBox({
                                                value: vls,
                                                onValueChanged: function (e) {
                                                    let tmp = "display:" + (e.value ? "none" : "block");
                                                    data.component.updateData(data.dataField, tmp);
                                                }
                                            });
                                    }

                                },
                                {
                                    dataField: "copy",
                                    //colSpan:2,
                                    label: {
                                        text: "Số bản in",
                                    },
                                    editorType: "dxNumberBox",
                                    editorOptions: {
                                        min: 1,
                                        max: 5,
                                        showSpinButtons: true,
                                    }

                                },

                            ],
                            onFieldDataChanged: function (e) {
                                cellInfo.setValue(JSON.stringify(e.component.option("formData")));
                            },
                        });
                        cellElement.append(div);
                    }
                }
                ],
                onKeyDown: function (e) {
                    if (e.event.keyCode == 13)
                        e.handled = true;
                },
                onInitNewRow: function (e) {
                    e.data._orc_sync = 'I';
                    that.Key = null;
                },
                onEditingStart: function (e) {
                    e.data._orc_sync = 'U';
                    that.Key = e.data.key;
                },
                onRowUpdating: function (e) {
                    e.newData._orc_sync = 'U';
                },
                onRowInserting: function (e) {
                    e.data._orc_sync = 'I';

                },
            });


            that.Component = $find.dxDataGrid("instance");

        }

        this.Init();
    }

    Customer.prototype.UpdateGroup = function (GroupId) {
        this.GroupId = GroupId || null;
        this.Data.filter = this.GroupId ? ["province_id=" + this.GroupId] : [];
        this.Component.refresh();
    }

    return Customer;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Customer;
else
    window.Customer = Customer;