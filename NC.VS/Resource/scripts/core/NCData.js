"use strict";
var NCData = (function () {
    var NCData = function (options) {
        this.name = options.name || "default";
        this.url = options.url || "http://localhost:8080/api/core/" + this.name;
        this.key = options.key || "id";
        this.data = null;
        this.callback = options.callback;
        this.ByRef = options.byref || {};
        var that =this;
        $.ajax({
            url: getURL(this.url),
            method: "GET"
        }).done(function (data) {
            that.data = data;
            if(typeof that.callback === 'function')
                that.callback(data,that.ByRef);            
        });
               
    }; 
        

    return NCData;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = NCData;
else
    window.NCData = NCData;