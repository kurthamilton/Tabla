(function() {
    'use strict';

    define(StorageService);

    function StorageService() {
        return {
            get: function(key) {
                if (!localStorage) {
                    return null;
                }
                let item = window.localStorage.getItem(`tabcreator.${key}`);
                if (!item) {
                    return null;
                }
                return JSON.parse(item);
            },
            set: function(key, item) {
                if (!localStorage) {
                    return;
                }
                let data = JSON.stringify(item);
                localStorage.setItem(`tabcreator.${key}`, data);
            }
        };
    }
})();