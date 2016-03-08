(function(rivets) {
    'use strict';

    define(['services/instrument-factory', 'services/session-service'], SessionController);

    function SessionController(instrumentFactory, sessionService) {
        return {
            load: function() {
                render();
            }
        };

        function render() {
            let scope = {
                actions: {
                    changeSession: changeSession,
                    createSession: createSession,
                    deleteSession: deleteSession
                },
                instruments: instrumentFactory.available(),
                model: sessionService.model,
                newSession: {
                    instrument: '',
                    name: ''
                }
            };

            let view = document.getElementById('sessions');
            rivets.bind(view, scope);
        }

        function changeSession(e, scope) {

        }

        function createSession(e, scope) {
            sessionService.create({
                instrument: scope.newSession.instrument,
                name: scope.newSession.name
            });
        }

        function deleteSession(e, scope) {
            sessionService.delete(scope.session.id);
        }
    }
})(rivets);