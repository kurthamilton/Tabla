(function(rivets) {
    'use strict';

    define(['utils.dom', 'services.tablature.dom', 'services.storage', 'models.note', 'models.tune'], TablatureController);

    function TablatureController(domUtils, tablatureDomService, storageService, Note, Tune) {
        return {
            load: function() {
                let scope = new Scope();
                render(scope);
                tablatureDomService.bind(scope);
            }
        };

        function render(scope) {
            let view = document.getElementById('tablature');
            rivets.bind(view, scope);
        }

        function bind() {
            bindClick(scope);
            bindKeys(scope);
        }

        function Scope() {
            let scope = this;

            let tune = loadTune();
            this.data = {
                selectedNote: null
            };
            this.model = {
                bars: getBars(20),
                tune: tune
            };
            this.save = function() {
                saveTune(storageService, scope);
            };
            this.select = function(target) {
                if (scope.selected) {
                    scope.selected.classList.remove('selected');
                    scope.selected = null;
                }

                if (!target) {
                    scope.data.selectedNote = null;
                    return;
                }

                target.classList.add('selected');
                scope.selected = target;

                let stringElement = domUtils.closestClass(target, 'string');
                let quaverElement = domUtils.closestClass(target, 'quaver');
                let barElement = domUtils.closestClass(quaverElement, 'bar');

                let quavers = domUtils.indexInParent(quaverElement, 'quaver');
                let quaver = quavers % 4;

                scope.data.selectedNote = new Note({
                    bar: domUtils.indexInParent(barElement, 'bar'),
                    beat: (quavers - quaver) / 4,
                    fret: null,
                    quaver: quaver,
                    string: domUtils.indexInParent(stringElement, 'strings')
                });
            };
            this.selected = null;
        }

        function getBars(numberOfBars) {
            let bars = [];
            for (let i = 0; i < numberOfBars; i++) {
                let bar = {
                    quavers: getQuavers(16)
                };
                bars.push(bar);
            }
            return bars;
        }

        function getQuavers(numberOfQuavers) {
            let quavers = [];
            for (let i = 0; i < numberOfQuavers; i++) {
                let quaver = {
                    strings: getStrings(5)
                };
                quavers.push(quaver);
            }
            return quavers;
        }

        function getStrings(numberOfStrings) {
            let strings = [];
            for (let i = 0; i < numberOfStrings; i++) {
                strings.push(i);
            }
            return strings;
        }

        function loadTune() {
            return new Tune();
        }

        function saveTune() {
            storageService.set('tune', scope.model.tune);
        }
    }
})(rivets);