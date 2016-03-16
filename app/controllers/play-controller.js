(function(rivets) {
    'use strict';

    define(['services/play-service'], PlayController);

    function PlayController(playService) {
        let scope = {
            actions: playService.actions,
            model: playService.model
        };

        return {
            load: function() {
                bind();
            }
        };

        function bind() {
            let view = document.getElementById('play');
            rivets.bind(view, scope);
        }
    }
})(rivets);