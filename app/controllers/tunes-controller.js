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
                    scope.editPart = new EditPartViewModel(scope.model.part);
                },
                selectPart: selectPart,
                updatePart: updatePart
            },
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

        function selectPart(e, scope) {
            tuneService.actions.selectPart(scope.index);
        }

        function updatePart() {
            let part = scope.model.part;
            let editPart = scope.editPart;
            part.instrumentName = editPart.instrumentName;
            part.name = editPart.name;
            part.sound = editPart.sound;
            tuneService.actions.save();
        }
    }
})(rivets);