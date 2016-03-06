(function() {
    'use strict';

    define(['services.storage'], TablatureScope);

    function TablatureScope(storageService) {
        let scope = {};

        scope = {
            data: {
                selectedNote: null
            },
            model: {
                bars: getBars(20),
                tune: loadTune(storageService, Tune)
            },
            save: function() {
                saveTune(storageService, scope);
            },
            select: function(target) {
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
            },
            selected: null
        };
        return scope;
    }
})();