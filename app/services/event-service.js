(function() {
    'use strict';

    define(EventService);

    function EventService() {
        return {
            addEventListener: addEventListener,
            trigger: trigger
        };

        function addEventListener(target, event, callback) {
            if (!event || typeof callback !== 'function') {
                return;
            }
            let eventListeners = (target._events || (target._events = {}));
            if (!eventListeners.hasOwnProperty(event)) {
                eventListeners[event] = [];
            }
            eventListeners[event].push(callback);
        }

        function trigger(target, event, ...args) {
            let eventListeners = target._events;
            if (!eventListeners) {
                return;
            }
            let callbacks = eventListeners[event];
            if (!callbacks) {
                return;
            }
            callbacks.forEach(callback => callback(...args));
        }
    }
})();