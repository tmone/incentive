"use strict";


var KPISetting = (function () {

    var KPISetting = function (options) {
        var options = options || {};
        this.Name = "KPISetting";
        this.Type = "dxTreeList";
        this.id = options.id || (this.Name + (new Date()).getTime());
        this.Component = null;
        this.permit = getACL(this.Name) || { add: false, edit: false, delete: false };
        this.Data = new NCStore({
            url: "api/Accounting/KPISetting",
            key: "id",
            //filter: ["(username eq '" + __USERNAME__ + "' or exists(select id from nc_core_user_role where role_id eq 1 and user_id eq " + __USERID__ + "))"],
            permit: this.permit
        });
        this.Key = null;

        this.Init = function () {
            var that = this;
            var $find = $(that.id);


            if (!$find.length) {
                var scriptTag = document.scripts[document.scripts.length - 1];
                var parentTag = scriptTag.parentNode;
                $find = $("<div id='" + that.id + "'>").appendTo(parentTag);
            }


            var syncTreeViewSelection = function (treeView, value) {
                if (!value) {
                    treeView.unselectAll();
                } else {
                    treeView.selectItem(value);
                }
            };

            var Scopes = {
                DEFAULT: 0,
                PARENT_VALUE: 0,
                PARENT_DEFAULT: 0,
                TYPE_DEFAULT: 0,
                ZONE_DEFAULT: 0,
                POSTION_DEFAULT: 0,
            };
            var updateScope = function (prop, vl) {
                if ($.isNumeric(vl) && Scopes.hasOwnProperty(prop)) {
                    Scopes[prop] = vl;
                    updateValue();
                }
            }
            
            var updateValue = function () {
                var editor;
                var vl;
                try {
                    editor = ace.edit("editor");
                    vl = editor.getValue();
                    editor.getSession().clearAnnotations();
                } catch (error) {

                }

                if (vl) {
                    var val = 0;
                    try {
                        vl = vl.replace(/%/g, "*0.01");
                        if(vl.includes('\n')){
                            vl.split('\n').map((x)=>{
                                val = math.eval(x, Scopes);
                            });
                        }else{
                            val = math.eval(vl, Scopes);
                        }                       

                    } catch (error) {
                        //console.log(error);
                        if (editor) {
                            editor.getSession().setAnnotations([{
                                row: 0,
                                column: 0,
                                text: error.message, // Or the Json reply from the parser 
                                type: 'error' // also warning and information
                            }]);
                        }

                    }

                    if ($.isNumeric(val)) {

                        $("#cValue").dxNumberBox("instance").option("value", val);
                    }else{
                        if (editor) {
                            editor.getSession().setAnnotations([{
                                row: 0,
                                column: 0,
                                text: 'Cannot caculating on this expression', // Or the Json reply from the parser 
                                type: 'error' // also warning and information
                            }]);
                        }
                    }
                }
            }
            var getCompletion = function () {
                var t = [];
                for (var i in Scopes) {
                    t.push({
                        name: i,
                        value: i,
                        scope: Scopes[i],
                        meta: 'KPI'
                    });
                }
                return t;
            }

            var postionStore = new NCData({
                url: 'api/Accounting/KPIPostion',
                callback: function (a) {
                    that.Component.columnOption('postion', 'lookup.dataSource', a);
                }
            });
            var zoneStore = new NCData({
                url: 'api/Accounting/KPIZone',
                callback: function (a) {
                    that.Component.columnOption('zone', 'lookup.dataSource', a);
                }
            });

            var getParent = function (pid, cb) {
                that.Data.Load().then((x) => {
                    var y = x.filter(m => m.id == pid);
                    if (y && y.length > 0) {
                        cb(y[0]);
                    }
                    //cb(x);
                });
            }

            var findUpdateDataSource = function (field, dat) {
                for (var i = 0; i < Columns.length; i++) {
                    var tmp = Columns[i] || {};
                    if (tmp.dataField == field) {
                        tmp.lookup.dataSource = dat;
                        break;
                    }
                }
            };
            var getTypeField = function (field) {
                for (var i = 0; i < Columns.length; i++) {
                    var tmp = Columns[i] || {};
                    if (tmp.dataField == field) {
                        if (tmp.dataType)
                            return tmp.dataType;
                        return "String";
                    }
                }
                if (typeof field === 'string' || field instanceof String)
                    return "String";
                if (typeof field === 'number')
                    return "Number";
                if (field instanceof Date)
                    return "Date";
                if (typeof field === 'boolean')
                    return "boolean";
                return "Object";
            }
            var FilterId;
            var FilterValue = [];
            var SqlBuilder = function (a, type = "Object") {
                if (a == null)
                    return null;
                if (Array.isArray(a) && a.length == 3) {
                    var type = getTypeField(a[0]);

                    if (a[1] == "anyof") {
                        return "(" + SqlBuilder(a[0]) + " in (" + a[2].join(',') + "))";
                    }
                    if (a[1] == "between") {
                        return "(" + SqlBuilder(a[0]) + " BETWEEN " + a[2].map(
                            x => ((x.getTime) || (/[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z/.test(x))) ? "convert(datetime,''" + x.toJSON() + "'',127')" : x
                        ).join(' AND ') + ")";
                    }
                    if (a[1] == 'contains') {
                        return "(" + SqlBuilder(a[0]) + " like N''%" + SqlBuilder(a[2]) + "%'')";
                    }
                    if (a[1] == 'notcontains') {
                        return " not (" + SqlBuilder(a[0]) + " like N''%" + SqlBuilder(a[2]) + "%'')";
                    }
                    if (a[1] == 'startswith') {
                        return " (" + SqlBuilder(a[0]) + " like N''" + SqlBuilder(a[2]) + "%'')";
                    }
                    if (a[1] == 'endswith') {
                        return " not (" + SqlBuilder(a[0]) + " like N''%" + SqlBuilder(a[2]) + "'')";
                    }
                    if (a[1] == 'startswith') {
                        return " (" + SqlBuilder(a[0]) + " like N''" + SqlBuilder(a[2]) + "%'')";
                    }


                    return "(" + SqlBuilder(a[0]) + " " + a[1] + " " + SqlBuilder(a[2], type) + ")";
                }

                if (Array.isArray(a) && a.length > 3) {
                    var rs = "";
                    for (var i = 0; i < a.length; i++) {
                        rs = rs + " " + SqlBuilder(a[i]);
                    }
                    return "(" + rs + ")";
                }
                if (Array.isArray(a) && a.length == 1) {
                    return SqlBuilder(a[0]);
                }

                if (type == "String") {
                    return "N''" + a + "''";
                }
                if (type == "Date" || type == "DateTime") {
                    var b = new Date(a.getTime());
                    b.setHours(b.getHours() - b.getTimezoneOffset() / 60);
                    return "convert(datetime,''" + b.toJSON() + "'',127)";
                }


                if (a.getTime) {
                    var b = new Date(a.getTime());
                    b.setHours(b.getHours() - b.getTimezoneOffset() / 60);
                    return "convert(datetime,''" + b.toJSON() + "'',127)";
                }

                if (/[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z/.test(a)) {
                    return "convert(datetime,''" + a + "'',127)";
                }

                return "" + a;

            }

            var exportToExcelfunction = function (e) {

                var tv = that.Component;// $("#Job_Progress_TreeList").dxTreeList("instance");
                var columns = tv.getVisibleColumns();
                var data = tv.getVisibleRows();
    
                var csvContent = "";
    
                for (var i = 0; i < columns.length; i++) {            
                    csvContent += columns[i].caption + ",";
                    }       
                csvContent += "\r\n";
    
                for (var i = 0; i < data.length; i++) { 
                    var row = data[i].values;
                    row.forEach(function (item, index) {
                        if (item === undefined || item === null) { csvContent += ","; }
                        else { csvContent += item + ","; };
                       }
                    );
                    csvContent += "\r\n";
                }            
    
                var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    
                if (navigator.msSaveBlob) {
                    navigator.msSaveBlob(blob, that.Name + '.csv')
                }
                else {
                    var link = document.createElement("a");
                    var url = URL.createObjectURL(blob);
                    link.setAttribute("href", url);
                    link.setAttribute("download",  that.Name + '.csv');
                    document.body.appendChild(link);
                    // link.addEventListener("click",function(e){                        
                    //     e.preventDefault();
                    // });
                    link.click();
                    document.body.removeChild(link);  
                };
            }

            $find.dxTreeList({
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
                keyExpr: "id",
                parentIdExpr: "parent",
                columnAutoWidth: true,
                wordWrapEnabled: true,
                autoExpandAll: false,
                searchPanel: {
                    visible: true,
                },
                showBorders: true,
                showRowLines: true,
                onRowInserted:function(e){
                    $.ajax({
                        type: "POST",
                        url: getURL("api/Accounting/KPISetting/update_kpi"),                        
                        success: function (result) {                                                        
                        },
                    });
                },
                onRowUpdated:function(e){
                    $.ajax({
                        type: "POST",
                        url: getURL("api/Accounting/KPISetting/update_kpi"),                        
                        success: function (result) {                                                        
                        },
                    });
                },
                onToolbarPreparing: function (e) {
                    var toolbarItems = e.toolbarOptions.items;
                    toolbarItems.push(                   
                        {
                            location: "before",
                            widget: "dxButton",
                            options: {
                                //elementAttr: { id: "btn-Upload" },
                                visible: true,
                                icon: "fa fa-download",
                                text:"Download",
                                onClick: function (e) {
                                    setTimeout(() => {
                                        exportToExcelfunction();
                                    }, 1000);                                   
                                   
                                }
                            },
                        },
                    );
                },
                onSelectionChanged: function (e) {
                    that.Key = e.currentSelectedRowKeys[0];

                },
                onInitNewRow: function (e) {
                    // updateScope("DEFAULT", 0);
                    // updateScope("PARENT_VALUE", 0);
                    // updateScope("PARENT_DEFAULT", 0);
                    // updateScope("POSTION_DEFAULT", 0);
                    // updateScope("ZONE_DEFAULT", 0);
                },
                onEditorPrepared: function (e) {
                    if (e.parentType == "dataRow") {
                        if (e.dataField == 'parent') {
                            //console.log(e.value);
                            getParent(e.value, function (dt) {
                                updateScope("PARENT_VALUE", dt.value);
                                updateScope("PARENT_DEFAULT", dt.default);
                            });
                        }
                        if (e.dataField == 'default') {
                            updateScope("DEFAULT", e.value);
                        }
                        if (e.dataField == 'postion') {
                            var sl = postionStore.data.filter(x => x.id == e.value);
                            if (sl && sl.length > 0) {
                                updateScope("POSTION_DEFAULT", sl[0].default);
                            }
                        }
                        if (e.dataField == 'zone') {
                            var sl = zoneStore.data.filter(x => x.id == e.value);
                            if (sl && sl.length > 0) {
                                updateScope("ZONE_DEFAULT", sl[0].default);
                            }
                        }
                    }
                },
                onEditorPreparing: function (e) {
                    if (e.parentType == 'dataRow') {
                        if (e.dataField == 'default') {
                            e.editorOptions.onValueChanged = function (args) {
                                e.setValue(args.value);
                                updateScope("DEFAULT", args.value);
                            }
                        }
                        if (e.dataField == 'postion') {

                            e.editorOptions.onValueChanged = function (args) {
                                e.setValue(args.value);
                                var sl = args.component.option("dataSource").store._array.filter(x => x.id == args.value);
                                if (sl && sl.length > 0) {
                                    updateScope("POSTION_DEFAULT", sl[0].default);
                                }
                            }

                        }
                        if (e.dataField == 'zone') {

                            e.editorOptions.onValueChanged = function (args) {
                                e.setValue(args.value);
                                var sl = args.component.option("dataSource").store._array.filter(x => x.id == args.value);
                                if (sl && sl.length > 0) {
                                    updateScope("ZONE_DEFAULT", sl[0].default);
                                }

                            }

                        }
                        if (e.dataField == 'parent') {

                            e.editorOptions.onValueChanged = function (args) {
                                e.setValue(args.value);
                                getParent(args.value, function (dt) {
                                    updateScope("PARENT_VALUE", dt.value);
                                    updateScope("PARENT_DEFAULT", dt.default);
                                });

                            }

                        }
                    }
                },
                columns: [
                    {
                        dataField: "id",
                        visible: false,
                        formItem: {
                            visible: false
                        }
                    },
                    {
                        dataField: "name",
                    },
                    {
                        dataField: "description",
                    },
                    {
                        dataField: "type",
                    },
                    {
                        dataField: "zone",
                        lookup: {
                            dataSource: zoneStore.data,
                            valueExpr: "id",
                            displayExpr: "name"
                        }
                    },
                    {
                        dataField: "postion",
                        lookup: {
                            dataSource: postionStore.data,
                            valueExpr: "id",
                            displayExpr: "name"
                        }
                    },
                    {
                        dataField: "default",
                        dataType: "number",
                        editorOptions: {
                            format: "###,##0",
                        },
                        format: "###,##0",
                        visible: false
                    },
                    {
                        dataField: "from_date",
                        format: "dd/MM/yyyy",
                        dataType: "date",
                        editorOptions: {
                            format: "dd/MM/yyyy",
                        }
                    },
                    {
                        dataField: "to_date",
                        format: "dd/MM/yyyy",
                        dataType: "date",
                        editorOptions: {
                            format: "dd/MM/yyyy",
                        }
                    },
                    {
                        dataField: "formula",
                        visible: false,
                        // editorOptions: {
                        //     elementAttr: {
                        //         id: "cFormula",
                        //     },
                        //     inputAttr: {
                        //         id: "iFormula"
                        //     },
                        // },
                        editCellTemplate: function (cellElement, cellInfo) {
                            var div = $("<div class='dx-texteditor dx-widget '><div class='dx-texteditor-container'><div id='editor' style='min-height: 33px; width: 100%'>").appendTo(cellElement);
                            $(cellElement).css("min-height", "33px");
                            var langTools = ace.require("ace/ext/language_tools");
                            var editor = ace.edit("editor");
                            var JavascriptMode = ace.require("ace/mode/javascript").Mode;
                            editor.session.setMode(new JavascriptMode());
                            //editor.renderer.setShowGutter(false);

                            editor.setOptions({
                                enableBasicAutocompletion: true,
                                enableSnippets: true,
                                enableLiveAutocompletion: true
                            });

                            var RevenueCompleter = {
                                getCompletions: function (editor, session, pos, prefix, callback) {
                                    if (prefix.length === 0) { callback(null, []); return }
                                    // var data = [
                                    //     {name:'MA_KH',value:'MA_KH',score:0,meta:'Revenue Data'},
                                    // ];
                                    var data = getCompletion();
                                    callback(null, data.filter(x => x.value.includes(prefix)));
                                }
                            }
                            langTools.addCompleter(RevenueCompleter);

                            editor.setValue(cellInfo.value || "");
                            editor.on("change", function (e) {
                                var vl = editor.getValue();
                                cellInfo.setValue(vl);
                                updateValue();
                            });
                        },
                    },
                    {
                        dataField: "value",
                        dataType: "number",
                        format: "###,##0",
                        editorOptions: {
                            elementAttr: {
                                id: "cValue",
                            },
                            inputAttr: {
                                id: "iValue"
                            },
                            format: "###,##0",
                            readOnly: true
                        },
                    },
                    {
                        dataField: "priority",
                        dataType: "number"
                    },
                    {
                        dataField: "parent",
                        visible: false,
                        lookup: {
                            dataSource: that.Data.Store(),
                            valueExpr: "id",
                            displayExpr: "name"
                        },
                    },

                ],
                onKeyDown: function (e) {
                    if (e.event.keyCode == 13)
                        e.handled = true;
                },
                onInitNewRow: function (e) {
                    e.data.from_date = new Date();
                    e.data.type = 0;
                    e.data._active = true;
                    that.Key = null;
                },


            });

            that.Component = $find.dxTreeList("instance");

        }

        this.Init();
    }

    return KPISetting;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = KPISetting;
else
    window.KPISetting = KPISetting;