"use strict";

var NCStore = (function () {
    var NCStore = function (options) {
        this.name = options.name || "default";
        this.url = options.url || "api/core/" + this.name;
        this.key = options.key || "id";
        this.filter = options.filter || [];
        this.select = options.select || [];
        this.permit = options.permit || {add: false, edit: false, delete: false}

        this.Cv = function(obj){            
            for(var x in obj){
                if(obj[x]==null){

                }else if(obj[x].constructor == Date){
                    obj[x] = obj[x].toJSON();
                }
            }
            return obj;
        }
        
        var that = this;
        this.store = new DevExpress.data.CustomStore({
            key: that.key,
            load: function(){
                return that.Load();
            },

            byKey: function (key) {
                return $.getJSON(getURL(that.url + "/" + encodeURIComponent(key)));
            },

            insert: function (values) {
                if(that.permit.add || false)
                    return $.post(getURL(that.url), that.Cv(values));
            },

            update: function (key, values) {
                if(that.permit.edit || false)
                return $.ajax({
                    url: getURL(that.url + "/" + encodeURIComponent(key)),
                    method: "PUT",
                    data: that.Cv(values)
                });
            },

            remove: function (key) {
                if(that.permit.delete || false)
                return $.ajax({
                    url: getURL(that.url + "/" + encodeURIComponent(key)),
                    method: "DELETE",
                });
            }
        });
    };

    NCStore.prototype.Store = function store() {
        return { store: this.store };
    };
    NCStore.prototype.Load = function(){
        
        var str = this.url;
        var expand = str.includes("?");
        if (this.select.length > 0) {
            if (expand) {
                str += "&";
            } else {
                str += "?";
                expand = true;
            }
            str += "$select=";
            str += this.select.join(",");
        }
        if (this.filter.length > 0) {
            if (expand) {
                str += "&";
            } else {
                str += "?";
                expand = true;
            }
            str += "$filter=";
            str += this.filter.join(" and ").replace("=", "eq");
        }
        return $.getJSON(getURL(str));
       
    }

    return NCStore;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = NCStore;
else
    window.NCStore = NCStore;