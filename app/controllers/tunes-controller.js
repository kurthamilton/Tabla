(function(rivets) {
    'use strict';

    define(['services/instrument-factory', 'services/audio-service', 'services/tune-service', 'services/validation-service'], TunesController);

    function TunesController(instrumentFactory, audioService, tuneService, validationService) {
        let scope = {
            actions: {
                addPart: addPart,
                blurOnEnter: blurOnEnter,
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
                save: saveTune,
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

            this.reset = reset;
            this.selectInstrument = selectInstrument;

            populateSounds();

            function reset() {
                this.instrumentName = '';
                this.name = '';
                this.sound = '';
            }

            function selectInstrument() {
                populateSounds();
                viewModel.sound = sounds.length > 0 ? sounds[0] : '';
            }

            function populateSounds() {
                sounds.splice(0, sounds.length);
                sounds.push(...instrumentFactory.sounds(viewModel.instrumentName));
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
            if (validateNewPart()) {
                tuneService.actions.addPart(scope.newPart);

                scope.newPart.reset();
            }
        }

        function blurOnEnter(e) {
            if (e.keyCode === 13) {
                e.target.blur();
                e.preventDefault();
            }
        }

        function createTune() {
            if (validationService.validateForm(document.getElementById('create-tune'))) {
                tuneService.actions.create(scope.newTune);

                scope.newTune.name = '';
                scope.newTune.instrumentName = '';
            }
        }

        function deletePart() {
            if (confirm('Are you sure you want to delete this part?')) {
                tuneService.actions.deletePart(scope.model.part);
            }
        }

        function deleteTune(e, scope) {
            if (confirm('Are you sure you want to delete this tune?')) {
                tuneService.actions.delete(scope.tune.id);
            }
        }

        function loadTune(e, scope) {
            tuneService.actions.load(scope.tune.id);
        }

        function saveTune() {
            if (validateTune()) {
                tuneService.actions.save();
            }
        }

        function selectPart(e, scope) {
            tuneService.actions.selectPart(scope.index);
            // don't let the click bubble so that tab selections are preserved
            e.stopPropagation();
        }

        function updatePart() {
            tuneService.actions.updatePart(scope.model.part.index(), scope.editPart);
            // close edit modal
            // todo: do this better
            window.location.hash = '#';
        }

        function validateNewPart() {
            return validationService.validateForm(document.getElementById('add-part'));
        }

        function validateTune() {
            let results = [];
            results.push(validationService.validateElement(document.getElementById('tune-name')));
            results.push(validationService.validateElement(document.getElementById('tune-bpm')));
            return results.filter(r => r === false).length === 0;
        }
    }
})(rivets);