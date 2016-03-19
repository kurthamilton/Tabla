(function(rivets) {
    'use strict';

    define(['services/instrument-factory', 'services/tune-service'], TunesController);

    function TunesController(instrumentFactory, tuneService) {
        let scope = {
            actions: {
                create: createTune,
                delete: deleteTune,
                load: loadTune,
                selectInstrument: selectInstrument
            },
            instruments: instrumentFactory.available(),
            model: tuneService.model,
            newTune: {
                instrumentName: '',
                name: '',
                sound: ''
            },
            sounds: []
        };

        return {
            load: function() {
                tuneService.load();
                bind();
            }
        };

        function bind() {
            let view = document.getElementById('tunes');
            rivets.bind(view, scope);
        }

        function createTune(e, scope) {
            tuneService.actions.create(scope.newTune);
        }

        function deleteTune(e, scope) {
            tuneService.actions.delete(scope.tune.id);
        }

        function loadTune(e, scope) {
            tuneService.actions.load(scope.tune.id);
        }

        function selectInstrument(e, scope) {
            scope.sounds.splice(0, scope.sounds.length);
            scope.sounds.push(...instrumentFactory.sounds(scope.newTune.instrumentName));
        }
    }
})(rivets);