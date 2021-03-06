(function(rivets) {
    'use strict';

    define(['utils.dom', 'services/audio-service', 'services/tune-service'], AudioController);

    function AudioController(domUtils, audioService, tuneService) {
        let scope = {
            actions: audioService.actions,
            model: audioService.model,
            notes: [],
            tune: null,
            saveTune: tuneService.actions.save
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
            view.classList.remove('binding');
        }

        function bindEvents() {
            document.addEventListener('keydown', function(e) {
                // The active element check is to prevent collision with input key behaviour
                if (!scope.model.ready || domUtils.getOpenModal() || document.activeElement !== document.body) {
                    return;
                }

                if (e.keyCode === 32) {
                    // space
                    audioService.actions.toggle();
                    e.preventDefault();
                }
            });
        }

        function onTuneLoaded(tune) {
            scope.tune = tune;
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