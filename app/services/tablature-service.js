(function() {
    'use strict';

    define(['services/storage-service', 'models/note', 'models/tune'], TablatureService);

    function TablatureService(storageService, Note, Tune) {
        let model = new Model();
        return {
            save: save,
            model: model
        };

        function Model() {
            this.tune = load();
            this.bars = getBars(this.tune);
        }

        // model methods
        function getBars(tune) {
            let bars = [];
            let numberOfBars = tune.maxBar();
            if (numberOfBars < 16) {
                numberOfBars = 16;
            }
            for (let i = 0; i < numberOfBars; i++) {
                let bar = {
                    quavers: getQuavers(tune, i, 16)
                };
                bars.push(bar);
            }
            return bars;
        }

        function getQuavers(tune, bar, numberOfQuavers) {
            let quavers = [];
            for (let i = 0; i < numberOfQuavers; i++) {
                let quaver = {
                    strings: getStrings(tune, bar, i, 5)
                };
                quavers.push(quaver);
            }
            return quavers;
        }

        function getStrings(tune, bar, quaver, numberOfStrings) {
            let strings = [];
            for (let i = 0; i < numberOfStrings; i++) {
                let fret = tune.getFret(bar, quaver, i);
                strings.push({ index: i, fret: fret });
            }
            return strings;
        }

        // storage methods
        function load() {
            let savedNotes = storageService.get('notes');
            let tune = new Tune();
            if (!savedNotes) {
                return tune;
            }

            for (let i = 0; i < savedNotes.length; i++) {
                tune.addNote(new Note(savedNotes[i]));
            }
            return tune;
        }

        function save() {
            storageService.set('notes', model.tune.notes);
        }
    }
})();