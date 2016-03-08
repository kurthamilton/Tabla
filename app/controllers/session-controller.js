(function(rivets) {
    'use strict';

    define(['services/session-service'], SessionController);

    function SessionController(sessionService) {
        return {
            load: function() {
                render();
            }
        };

        function render() {
            let scope = {
                actions: {
                    changeSession: changeSession,
                    createSession: createSession
                },
                model: sessionService.model
            }

            let view = document.getElementById('sessions');
            rivets.bind(view, scope.model);
        }

        function changeSession(e, scope) {

        }

        function createSession(e, scope) {

        }
    }
})(rivets);