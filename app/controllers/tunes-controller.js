(function(rivets) {
    'use strict';

    let dependencies = ['utils.dom', 'services/instrument-factory', 'services/alert-service', 'services/audio-service',
        'services/tune-service', 'services/validation-service'];
    define(dependencies, TunesController);

    function TunesController(domUtils, instrumentFactory, alertService, audioService, tuneService, validationService) {
        let scope = {
            actions: {
                addPart: addPart,
                blurOnEnter: blurOnEnter,
                create: createTune,
                delete: deleteTune,
                deletePart: deletePart,
                load: loadTune,
                onBarsEditing: function() {
                    scope.editBars.number = scope.model.tune.bars.length
                },
                onPartEditing: function() {
                    scope.editPart = new EditPartViewModel(scope.model.part);
                },
                save: saveTune,
                selectPart: selectPart,
                updateBars: updateBars,
                updatePart: updatePart
            },
            audioActions: audioService.actions,
            audioModel: audioService.model,
            editBars: {
                number: 0
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
                    domUtils.openModal('#tunes-manager');
                }
                bind();
            }
        };

        function bind() {
            let view = document.getElementById('tunes');
            rivets.bind(view, scope);
            view.classList.remove('binding');
        }

        // actions
        function addPart() {
            if (validateNewPart()) {
                tuneService.actions.addPart(scope.newPart);
                scope.newPart.reset();

                domUtils.closeModal();
                alertService.addAlert({ message: 'Part added', timeout: 2000 });
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

                domUtils.closeModal();
            }
        }

        function deletePart() {
            if (confirm('Are you sure you want to delete this part?')) {
                tuneService.actions.deletePart(scope.model.part);
                alertService.addAlert({ message: 'Part deleted', timeout: 2000 });
            }
        }

        function deleteTune(e, scope) {
            if (confirm('Are you sure you want to delete this tune?')) {
                tuneService.actions.delete(scope.tune.id);
                alertService.addAlert({ message: 'Tune deleted', timeout: 2000 });
            }
        }

        function loadTune(e, scope) {
            tuneService.actions.load(scope.tune.id);
            domUtils.closeModal();
        }

        function saveTune() {
            if (validateTune()) {
                tuneService.actions.save();
                alertService.addAlert({ message: 'Tune updated', timeout: 2000 });
            }
        }

        function selectPart(e, scope) {
            tuneService.actions.selectPart(scope.index);
            // don't let the click bubble so that tab selections are preserved
            e.stopPropagation();
        }

        function updateBars(e, scope) {
            if (validationService.validateForm(document.getElementById('edit-bars'))) {
                tuneService.actions.updateBars({
                    number: scope.editBars.number
                });
                domUtils.closeModal();
                alertService.addAlert({ message: 'Bars updated', timeout: 2000 });
            }
        }

        function updatePart() {
            tuneService.actions.updatePart(scope.model.part.index(), scope.editPart);
            domUtils.closeModal();
            alertService.addAlert({ message: 'Part updated', timeout: 2000 });
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