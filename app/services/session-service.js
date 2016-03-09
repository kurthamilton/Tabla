(function() {
    'use strict';

    define(['utils', 'services/storage-service'], SessionService);

    function SessionService(utils, storageService) {
        let index = {};
        let sessions = [];

        let eventListeners = {};

        let model = {
            activeSession: null,
            activeSessionId: null,
            sessions: sessions
        };

        loadSessions();

        if (sessions.length > 0) {
            setActiveSession(sessions[0]);
        }

        return {
            addEventListener: addEventListener,
            create: createSession,
            delete: deleteSession,
            model: model
        };

        function addEventListener(event, callback) {
            if (typeof callback !== 'function') {
                return;
            }

            if (!eventListeners.hasOwnProperty(event)) {
                eventListeners[event] = [];
            }

            eventListeners[event].push(callback);
        }

        function createSession(options) {
            let id = utils.guid();
            while (index.hasOwnProperty(id)) {
                id = utils.guid();
            }

            let session = {
                id: id,
                instrument: options.instrument,
                name: options.name
            };

            sessions.unshift(session);
            save();

            setActiveSession(session);
            trigger('load');
        }

        function deleteSession(id) {
            if (!index.hasOwnProperty(id)) {
                return;
            }

            sessions.splice(index[id], 1);
            save();

            if (id === model.activeSessionId) {
                setActiveSession(null);
            }
        }

        function loadSession(id) {
            if (!index.hasOwnProperty(id)) {
                return;
            }

            // move session to start of array
            let session = sessions.splice(index[id], 1);
            sessions.unshift(session);
            save();

            setActiveSession(session);

            trigger('load');
        }

        function loadSessions() {
            let savedSessions = storageService.get('sessions');
            if (!savedSessions || !Array.isArray(savedSessions)) {
                return [];
            }

            for (let i = 0; i < savedSessions.length; i++) {
                let savedSession = savedSessions[i];
                if (savedSession.id && !index.hasOwnProperty(savedSession.id)) {
                    let session = {
                        id: savedSession.id,
                        instrument: savedSession.instrument,
                        name: savedSession.name
                    };
                    sessions.push(session);
                }
            }

            updateIndex();
        }

        function setActiveSession(session) {
            if (!session) {
                model.activeSessionId = null;
                model.activeSession = null;
                return;
            }

            model.activeSessionId = session.id;
            model.activeSession = session;
        }

        function trigger(event, ...args) {
            if (!eventListeners.hasOwnProperty(event)) {
                return;
            }

            let callbacks = eventListeners[event];
            for (let i = 0; i < callbacks.length; i++) {
                callbacks[i](...args);
            }
        }

        function save() {
            updateIndex();
            storageService.set('sessions', sessions);
        }

        function updateIndex() {
            index = {};
            for (let i = 0; i < sessions.length; i++) {
                let session = sessions[i];
                index[session.id] = i;
            }
        }
    }
})();