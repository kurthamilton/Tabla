(function() {
    'use strict';

    define(Utils);

    function Utils() {
        let utils = {
            // lightweight function returning a value looking like a GUID. Uses Math.random, so can't be fully trusted.
            guid: function() {
                function S4() {
                    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
                }

                return (S4() + S4() + "-" + S4() + S4() + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
            }
        };

        return utils;
    }
})();