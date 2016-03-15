(function() {
    'use strict';

    define(['utils', 'services/storage-service'], SessionService);

    function SessionService(utils, storageService) {
        let index = {};
        let sessions = [];

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
            create: createSession,
            delete: deleteSession,
            model: model
        };

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
        }

        function loadSessions() {
            let savedSessions = storageService.get('sessions');
            if (!savedSessions || !Array.isArray(savedSessions)) {
                return [];
            }

            savedSessions.forEach(savedSession => {
                if (savedSession.id && !index.hasOwnProperty(savedSession.id)) {
                    let session = {
                        id: savedSession.id,
                        instrument: savedSession.instrument,
                        name: savedSession.name
                    };
                    sessions.push(session);
                }
            });

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

        function save() {
            updateIndex();
            storageService.set('sessions', sessions);
        }

        function updateIndex() {
            index = {};
            sessions.forEach((session, i) => index[session.id] = i);
        }
    }
})();