(function() {
    'use strict';

    define(EventService);

    function EventService() {
        let undoActions = [];
        let redoActions = [];

        return {
            addEventListener: addEventListener,
            clearUndoHistory: clearUndoHistory,
            performAction: performAction,
            redo: redoAction,
            trigger: trigger,
            undo: undoAction
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

        function clearUndoHistory() {
            undoActions.splice(0, undoActions.length - 1);
            redoActions.splice(0, redoActions.length - 1);
        }

        function performAction(redo, undo) {
            if (typeof redo === 'function' && typeof(undo) === 'function') {
                undoActions.push({
                   redo: redo,
                   undo: undo
                });
            }
        }

        function redoAction() {
            if (redoActions.length === 0) {
                return;
            }

            let action = redoActions.pop();
            action.redo();
            undoActions.push(action);
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

        function undoAction() {
            if (undoActions.length === 0) {
                return;
            }

            let action = undoActions.pop();
            action.undo();
            redoActions.push(action);
        }
    }
})();