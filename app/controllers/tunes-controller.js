(function(rivets) {
    'use strict';

    define(['services/instrument-factory', 'services/tune-service'], TunesController);

    function TunesController(instrumentFactory, tuneService) {
        let scope = {
            actions: {
                addPart: addPart,
                closeModal: function() {
                    window.location.hash = '#';
                },
                create: createTune,
                delete: deleteTune,
                deletePart: deletePart,
                load: loadTune,
                onPartEditing: function() {
                    // populate sounds
                    selectInstrument(scope.editPart.sounds, scope.model.part.instrumentName);
                    scope.model.part.sound = scope.editPart.sounds;
                },
                save: tuneService.actions.save,
                selectPart: selectPart
            },
            editPart: {
                instrumentName: '',
                name: '',
                selectInstrument: function() {
                    selectInstrument(scope.editPart.sounds, scope.model.part.instrumentName);
                },
                sounds: []
            },
            instruments: instrumentFactory.available(),
            model: tuneService.model,
            newPart: {
                instrumentName: '',
                name: '',
                selectInstrument: function() {
                    selectInstrument(scope.newPart.sounds, scope.newPart.instrumentName);
                },
                sound: '',
                sounds: []
            },
            newTune: {
                instrumentName: '',
                name: ''
            }
        };

        return {
            load: function() {
                tuneService.load();
                if (tuneService.model.tunes.length === 0) {
                    window.location.hash = 'tunes-manager';
                }
                bind();
            }
        };

        function bind() {
            let view = document.getElementById('tunes');
            rivets.bind(view, scope);
        }

        // actions
        function addPart() {
            tuneService.actions.addPart(scope.newPart);
        }

        function createTune() {
            tuneService.actions.create(scope.newTune);
        }

        function deletePart() {
            tuneService.actions.deletePart(getPartIndex());
        }

        function deleteTune() {
            tuneService.actions.delete(scope.tune.id);
        }

        function getPartIndex() {
            let model = tuneService.model;
            return model.tune.parts.findIndex(p => p.id === model.part.id);
        }

        function loadTune() {
            tuneService.actions.load(scope.tune.id);
        }

        function selectInstrument(sounds, instrumentName) {
            sounds.splice(0, sounds.length);
            sounds.push(...instrumentFactory.sounds(instrumentName));
        }

        function selectPart(e, scope) {
            tuneService.actions.selectPart(scope.index);
        }
    }
})(rivets);