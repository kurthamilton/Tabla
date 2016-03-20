(function(rivets) {
    'use strict';

    define(['services/instrument-factory', 'services/tune-service'], TunesController);

    function TunesController(instrumentFactory, tuneService) {
        let scope = {
            actions: {
                addPart: addPart,
                create: createTune,
                delete: deleteTune,
                deletePart: deletePart,
                load: loadTune,
                selectPart: selectPart
            },
            instruments: instrumentFactory.available(),
            model: tuneService.model,
            newPart: {
                instrumentName: '',
                name: '',
                selectInstrument: function() {
                    selectInstrument(scope.newPart.instrumentName);
                },
                sound: ''
            },
            newTune: {
                instrumentName: '',
                name: ''
            },
            sounds: []
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
            let model = tuneService.model;
            let index = model.tune.parts.findIndex(p => p.id === model.part.id);
            tuneService.actions.deletePart(index);
        }

        function deleteTune() {
            tuneService.actions.delete(scope.tune.id);
        }

        function loadTune() {
            tuneService.actions.load(scope.tune.id);
        }

        function selectInstrument(instrumentName) {
            scope.sounds.splice(0, scope.sounds.length);
            scope.sounds.push(...instrumentFactory.sounds(instrumentName));
        }

        function selectPart(e, scope) {
            tuneService.actions.selectPart(scope.index);
        }
    }
})(rivets);