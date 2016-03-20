(function(rivets) {
    'use strict';

    define(['services/audio-service', 'services/tune-service'], AudioController);

    function AudioController(audioService, tuneService) {
        let scope = {
            actions: audioService.actions,
            model: audioService.model,
            notes: []
        };

        tuneService.addEventListener('load', onTuneLoaded);
        audioService.addEventListener('play', playNotes);

        return {
            load: function() {
                bindEvents();
            }
        };

        function bind() {
            let view = document.getElementById('audio');
            rivets.bind(view, scope);
        }

        function bindEvents() {
            document.addEventListener('keydown', function(e) {
                // todo: the hash check is to prevent playing while the tune modal is open.
                // This is a flimsy check and should be improved
                if (!scope.model.ready || window.location.hash !== '') {
                    return;
                }

                if (e.keyCode === 32) {
                    // space
                    audioService.actions.toggle();
                } else if (e.keyCode === 36) {
                    // home
                    // todo: reset cursor.
                }
            });
        }

        function onTuneLoaded(tune) {
            bind();
        }

        function playNotes() {
            scope.notes.splice(0, scope.notes.length)
            for (let i in audioService.model.notes) {
                scope.notes.push(audioService.model.notes[i]);
            }
        }
    }
})(rivets);