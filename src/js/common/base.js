var RedmineDecorator = {};

(function (ctx) {
    ctx.Misc = {
        "sendJson": function (url, method, data_str, headers) {
            return new Promise(function (resolved, rejected) {
                try {
                    var xhr = new XMLHttpRequest();
                    xhr.responseType = "json";
                    xhr.onload = function (event) {
                        if (xhr.readyState === 4) {
                            if (200 <= xhr.status && xhr.status < 300) {
                                try {
                                    resolved(xhr.response);
                                } catch (e) {
                                    rejected(`sendJson error: ${url} ${e}`);
                                }
                            } else {
                                rejected(`sendJson error: ${url}: ${xhr.statusText}`);
                            }
                        }
                    };
                    xhr.onerror = function (event) {
                        rejected(`sendJson error: ${url}: ${xhr.statusText}`);
                    };
                    xhr.onabort = function (event) {
                        rejected(`sendJson abort: ${url}: ${xhr.statusText}`);
                    };
                    xhr.ontimeout = function (event) {
                        rejected(`sendJson timeout: ${url}: ${xhr.statusText}`);
                    };
                    xhr.open(method, url, true);
                    for (var key in headers) {
                        xhr.setRequestHeader(key, headers[key]);
                    }
                    xhr.send(data_str);
                } catch (e) {
                    rejected(`sendJson unknown error: ${url} ${e}`)
                }
            });
        },

        "getJson": function (url, headers = {}) {
            return ctx.Misc.sendJson(url, "GET", null, headers);
        },

        "putJson": function (url, data, headers = {}) {
            var data_str = JSON.stringify(data);
            if (!("Content-Type" in headers)) {
                headers["Content-Type"] = "application/json";
            }
            return ctx.Misc.sendJson(url, "PUT", data_str, headers);
        },

        "postJson": function (url, data, headers = {}) {
            var data_str = JSON.stringify(data);
            if (!("Content-Type" in headers)) {
                headers["Content-Type"] = "application/json";
            }
            return ctx.Misc.sendJson(url, "POST", data_str, headers);
        }
    };
})(RedmineDecorator);
