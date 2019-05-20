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
    var full_url = $("#base_url").val() + url;
    return updateQueryStringParameter(full_url, 'token', $("#token").val());
}
function getACL(wg) {
    var tmp = {};
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