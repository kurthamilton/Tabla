(function() {
    'use strict';

    define(StorageService);

    function StorageService() {
        const app = 'tabcreator';
        return {
            get: function(key) {
                if (!localStorage) {
                    return null;
                }
                let item = window.localStorage.getItem(`${app}.${key}`);
                if (!item) {
                    return null;
                }
                return JSON.parse(item);
            },
            remove: function(key) {
                if (!localStorage) {
                    return;
                }
                localStorage.removeItem(`${app}.${key}`);
            },
            set: function(key, item) {
                if (!localStorage) {
                    return;
                }
                let data = JSON.stringify(item);
                localStorage.setItem(`${app}.${key}`, data);
            }
        };
    }
})();