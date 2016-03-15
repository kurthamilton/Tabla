(function() {
    'use strict';

    define(EventService);

    function EventService() {
        let eventListeners = {};

        return {
            addEventListener: addEventListener,
            trigger: trigger
        };

        function addEventListener(event, callback) {
            if (!event || typeof callback !== 'function') {
                return;
            }
            if (!eventListeners.hasOwnProperty(event)) {
                eventListeners[event] = [];
            }
            eventListeners[event].push(callback);
        }

        function trigger(event, ...args) {
            let callbacks = eventListeners[event];
            if (!callbacks) {
                return;
            }
            callbacks.forEach(callback => callback(...args));
        }
    }
})();