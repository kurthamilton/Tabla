(function() {
    'use strict';

    define(EventService);

    function EventService() {
        return {
            addEventListener: addEventListener,
            trigger: trigger
        };

        /**
         * Associates a callback with an event name on the target. The callback will be called when the event is triggered.
         * Event can be a single string or an array of strings.
         */
        function addEventListener(target, event, callback) {
            if (!event || typeof callback !== 'function') {
                return;
            }

            if (Array.isArray(event)) {
                event.forEach(e => addEventListener(target, e, callback));
                return;
            }

            if (typeof event !== 'string') {
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