(function() {
    'use strict';

    define(Utils);

    function Utils() {
        let utils = {
            arrayCopy: function(a) {
                let b = new Array(a.length);
                let i = b.length;
                while(i--) {
                    b[i] = a[i];
                }
                return b;
            },
            async: function(method, callback) {
                setTimeout(function() {
                    executeFunction(method);
                    executeFunction(callback);
                }, 0);
            },
            // lightweight function returning a value looking like a GUID. Uses Math.random, so can't be fully trusted.
            guid: function() {
                function S4() {
                    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
                }

                return (S4() + S4() + "-" + S4() + S4() + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
            },
            loadScript: function(url, callback) {
                if (utils.scriptLoaded(url)) {
                    executeFunction(callback);
                    return;
                }

                // Adding the script tag to the head as suggested before
                var head = document.getElementsByTagName('head')[0];
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = url;

                // Then bind the event to the callback function.
                // There are several events for cross browser compatibility.
                script.onreadystatechange = callback;
                script.onload = callback;

                // Fire the loading
                head.appendChild(script);
            },
            scriptLoaded: function(url) {
                return document.querySelector(`script[src="${url}"]`) !== null;
            }
        };

        return utils;

        function executeFunction(callback) {
            if (typeof callback !== 'function') {
                return;
            }
            callback();
        }
    }
})();