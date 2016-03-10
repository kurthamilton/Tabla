(function(rivets) {
    'use strict';

    define(['services/instrument-factory', 'services/tune-service'], TunesController);

    function TunesController(instrumentFactory, tuneService) {
        let scope = {
            actions: {
                create: createTune,
                delete: deleteTune,
                load: loadTune
            },
            instruments: instrumentFactory.available(),
            newTune: {
                instrument: '',
                name: ''
            },
            tunes: tuneService.model.tunes
        };

        return {
            load: function() {
                bind();
            }
        };

        function bind() {
            let view = document.getElementById('tunes');
            rivets.bind(view, scope);
        }

        function createTune(e, scope) {
            tuneService.actions.create({
                instrument: scope.newTune.instrument,
                name: scope.newTune.name
            });
        }

        function deleteTune(e, scope) {
            tuneService.actions.delete(scope.tune.id);
        }

        function loadTune(e, scope) {
            tuneService.actions.load(scope.tune.id);
        }
    }
})(rivets);