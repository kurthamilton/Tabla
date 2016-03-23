(function(rivets) {
    'use strict';

    define(['services/instrument-factory', 'services/audio-service', 'services/tune-service'], TunesController);

    function TunesController(instrumentFactory, audioService, tuneService) {
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
                    scope.editPart = new EditPartViewModel(scope.model.part);
                },
                save: tuneService.actions.save,
                selectPart: selectPart,
                updatePart: updatePart
            },
            audioActions: audioService.actions,
            audioModel: audioService.model,
            editPart: null,
            instruments: instrumentFactory.available(),
            model: tuneService.model,
            newPart: new EditPartViewModel({}),
            newTune: {
                instrumentName: '',
                name: ''
            }
        };

        function EditPartViewModel(options) {
            let viewModel = this;

            this.instrumentName = options.instrumentName || '';
            this.name = options.name || '';
            this.sound = options.sound || '';
            let sounds = (this.sounds = []);

            this.selectInstrument = selectInstrument;

            selectInstrument();

            function selectInstrument() {
                sounds.splice(0, sounds.length);
                sounds.push(...instrumentFactory.sounds(viewModel.instrumentName));
                viewModel.sound = sounds.length > 0 ? sounds[0] : '';
            }
        }

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
            if (confirm('Are you sure you want to delete this part?')) {
                tuneService.actions.deletePart(scope.model.part);
            }
        }

        function deleteTune() {
            tuneService.actions.delete(scope.tune.id);
        }

        function loadTune() {
            tuneService.actions.load(scope.tune.id);
        }

        function selectPart(e, scope) {
            tuneService.actions.selectPart(scope.index);
        }

        function updatePart() {
            tuneService.actions.updatePart(scope.model.part.index(), scope.editPart);
        }
    }
})(rivets);