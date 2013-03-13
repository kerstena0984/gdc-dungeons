var Ajax = function() {
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

    function callRPC(action, args, handler) {
        if (action.length < 1) {
            throw new Exception("Incorrect arguments to callRPC");
        }

        if (!args) {
            args = new Array();
        }

        var request = createRequest();

        request.onreadystatechange = function() {
            if (request.readyState == 4 && request.status == 200) {
                handler(request.responseText);
            }
        };

        var data = "action=" + action.toString();
        for (var i = 0; i < args.length; i++) {
            data += "&arg" + i.toString() + "=" + args[i].toString();
        }

        request.open("POST", "rpc", true);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send(data);
    }

    return {
        "callRPC" : callRPC
    };
}();