(function() {
    'use strict';

    define(['utils', 'services/storage-service'], SessionService);

    function SessionService(utils, storageService) {
        let index = {};
        let sessions = [];

        loadSessions();

        let model = {
            activeSessionId: sessions.length > 0 ? sessions[0].id : null,
            sessions: sessions
        };

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
                name: option.name
            };

            sessions.unshift(session);
            save();
        }

        function deleteSession(id) {
            if (!index.hasOwnProperty(id)) {
                return;
            }

            sessions.splice(index[id], 1);
            save();
        }

        function loadSession(id) {
            if (!index.hasOwnProperty(id)) {
                return;
            }

            // move session to start of array
            let session = sessions.splice(index[id], 1);
            sessions.unshift(session);
            save();

            model.activeSessionId = session.id;
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