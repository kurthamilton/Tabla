(function(rivets) {
    'use strict';

    define(['services/play-service'], PlayController);

    function PlayController(playService) {
        let scope = {
            actions: playService.actions,
            model: playService.model,
            notes: []
        };

        playService.addEventListener('play', playNotes);

        return {
            load: function() {
                bind();
            }
        };

        function bind() {
            let view = document.getElementById('play');
            rivets.bind(view, scope);
        }

        function playNotes() {
            scope.notes.splice(0, scope.notes.length)
            for (let i in playService.model.notes) {
                scope.notes.push(playService.model.notes[i]);
            }
        }
    }
})(rivets);