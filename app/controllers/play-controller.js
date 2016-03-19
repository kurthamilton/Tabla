(function(rivets) {
    'use strict';

    define(['services/audio-service'], PlayController);

    function PlayController(audioService) {
        let scope = {
            actions: audioService.actions,
            model: audioService.model,
            notes: []
        };

        audioService.addEventListener('play', playNotes);

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
            for (let i in audioService.model.notes) {
                scope.notes.push(audioService.model.notes[i]);
            }
        }
    }
})(rivets);