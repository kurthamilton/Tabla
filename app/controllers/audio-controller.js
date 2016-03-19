(function(rivets) {
    'use strict';

    define(['services/audio-service', 'services/tune-service'], AudioController);

    function AudioController(audioService, tuneService) {
        let scope = {
            actions: audioService.actions,
            hasTune: false,
            model: audioService.model,
            notes: []
        };

        audioService.addEventListener('play', playNotes);
        tuneService.addEventListener('load', onTuneLoaded);

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
                if (!scope.hasTune) {
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
            scope.hasTune = ((tune || null) !== null);
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