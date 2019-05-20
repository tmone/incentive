//$.ajaxSetup({
//    "error":function(a,b,c) { 
//        console.log(a,b,c);
//        if (c != "Not Found" || a.status == 500){
//            if(DevExpress){

//                var result = DevExpress.ui.dialog.confirm("Có thể do hết thời gian sử dụng. Đăng nhập lại?", "Opp! Lỗi rồi.");
//                result.done(function (dialogResult) {
//                    if(dialogResult){
//                        var lastAccess = window.location.href;
//                        $.cookie("lastAccess", lastAccess, { expires: 7, path: '/' });
//                        window.location.href = '/Account/Account/Logout';
//                    }else{
//                        DevExpress.ui.notify("Nếu lỗi xảy ra liên tục. Vui lòng thông báo đến IT","error",3000);
//                    }
//                });
//            }else if (confirm("Opp! Lỗi rồi. Có thể do hết thời gian sử dụng. Đăng nhập lại?")) {
//                var lastAccess = window.location.href;
//                $.cookie("lastAccess", lastAccess, { expires: 7, path: '/' });
//                window.location.href = '/Account/Account/Logout';
//            } else {
//                alert("Nếu lỗi xảy ra liên tục. Vui lòng thông báo đến IT");
//            }
//        }

//    }
//});

//add Key=Value to URL
function updateQueryStringParameter(uri, key, value) {
    var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    var separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (uri.match(re)) {
        return uri.replace(re, '$1' + key + "=" + value + '$2');
    }
    else {
        return uri + separator + key + "=" + value;
    }
}
//generate full URL
function getURL(url) {
    var full_url = $("#base_url").val() + url.replace(/[\r\n\t]/g, "").replace(/[%]/g,"%25");
    return updateQueryStringParameter(full_url, 'token', $("#token").val());
}
function getACL(wg) {
    var tmp = {};
    if (typeof acl === 'undefined')
        return false;
    if (acl) {
        for (var i = 0; i < acl.length; i++) {
            var ac = acl[i];
            if (ac.widget == wg) {
                for (var j = 0; j < ac.acl.length; j++) {
                    var ad = ac.acl[j];
                    for (k in ad) {
                        if (ad[k] == 1) {
                            tmp[k] = true;
                        }
                    }
                }

                break;
            }
        }
    }
    return tmp;
}

function showFile(blob) {
    // It is necessary to create a new blob object with mime-type explicitly set
    // otherwise only Chrome works like it should
    var newBlob = new Blob([blob], { type: "application/pdf" })

    // IE doesn't allow using a blob object directly as link href
    // instead it is necessary to use msSaveOrOpenBlob
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(newBlob);
        return;
    }

    // For other browsers: 
    // Create a link pointing to the ObjectURL containing the blob.
    const data = window.URL.createObjectURL(newBlob);
    var link = document.createElement('a');
    link.href = data;
    link.download = "file.pdf";
    link.click();
    setTimeout(function () {
        // For Firefox it is necessary to delay revoking the ObjectURL
        window.URL.revokeObjectURL(data);
    }, 100);
}

function previewPDF(url) {
    fetch(url, {})
        .then(r => r.blob())
        .then(showFile);
}

var __USERID__;
var __ORGID__;
var __USERNAME__;
var __ORGCODE__;
var __ORGNEWCODE__;
var __ORGLIST__;
var __ORGNEWLIST__;
function setCurrentId() {
    $.ajax({
        url: getURL('api/core/user/getCurrentId'),
        method: "GET",
        async: false,
    }).done(function (data) {
        __USERID__ = data;
        setOrgList();
    });
}
function setOrgList() {
    $.ajax({
        url: getURL('api/core/orgchart/getUserOrgchart/' + __USERID__),
        method: "GET",
        async: false,
    }).done(function (data) {
        __ORGLIST__ = [];
        __ORGNEWLIST__ = [];
        for (var i = 0; i < data.length; i++) {
            __ORGLIST__.push(data[i].id);
            __ORGNEWLIST__.push(data[i].code);
        }
    });
}
function setOrgId() {
    $.ajax({
        url: getURL('api/core/user/getOrgId'),
        method: "GET",
        async: false,
    }).done(function (data) {
        __ORGID__ = data;
        setOrgCode();
        setOrgNewCode();
    });
}
function setUserName() {
    $.ajax({
        url: getURL('api/core/user/getUserName'),
        method: "GET",
        async: false,
    }).done(function (data) {
        __USERNAME__ = data;
    });
}

function setOrgCode() {
    $.ajax({
        url: getURL('api/core/orgchart/getOrgchartCode/' + __ORGID__),
        method: "GET",
        async: false,
    }).done(function (data) {
        __ORGCODE__ = data;
    });
}

function setOrgNewCode() {
    $.ajax({
        url: getURL('api/core/orgchart/getOrgchartNewCode/' + __ORGID__),
        method: "GET",
        async: false,
    }).done(function (data) {
        __ORGNEWCODE__ = data;
    });
}

$(function () {

    var lastAccess = $.cookie("lastAccess");
    if (lastAccess) {
        if (lastAccess != window.location.href) {
            window.location.href = lastAccess;
        } else {
            $.removeCookie("lastAccess", { path: '/' });
        }
    }
    setCurrentId();
    setOrgId();
    setUserName();
});

function CVDate(obj) {
    for (var x in obj) {
        if (obj[x].constructor == Date) {
            var b = new Date(a.getTime());
            b.setHours(b.getHours() - b.getTimezoneOffset() / 60);
            obj[x] = b.toJSON();
        }
    }
    return obj;
}