var Ajax = function() {
    var Verbs = function() {
        var GET = "GET";
        var POST = "POST";

        return {
            "GET" : GET,
            "POST" : POST
        }
    }();

    function doRequest(verb, url, data, handler) {
        var request = createRequest();

        request.onreadystatechange = function() {
            if (request.readyState == 4 && request.status == 200) {
                handler(request.responseText);
            }
        };

        request.open(verb, url, true);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send(data);
    }

    function createRequest() {
        var request = null;

        try {
            request = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (ex) {
            try {
                request = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (ex2) {
                request = null;
            }
        }

        if (!request && typeof XMLHttpRequest != 'undefined') {
            request = new XMLHttpRequest();
        }

        return request;
    }

    return {
        "Verbs" : Verbs,
        "doRequest" : doRequest
    };
}();