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
            for (let i = 0; i < Math.max(tune.maxBar(), 16); i++) {
                bars.push({
                    crotchets: getCrotchets(tune, i)
                });
            }
            return bars;
        }

        function getCrotchets(tune, bar) {
            let crotchets = [];
            for (let i = 0; i < tune.beatsPerBar; i++) {
                crotchets.push({
                    quavers: getQuavers(tune, bar, i, 4)
                });

            }
            return crotchets;
        }

        function getQuavers(tune, bar, crotchet, numberOfQuavers) {
            let quavers = [];
            for (let i = 0; i < numberOfQuavers; i++) {
                quavers.push({
                    strings: getStrings(tune, bar, crotchet, i, 5)
                });
            }
            return quavers;
        }

        function getStrings(tune, bar, crotchet, quaver, numberOfStrings) {
            let strings = [];
            for (let i = 0; i < numberOfStrings; i++) {
                let fret = tune.getFret({
                    bar: bar,
                    crotchet: crotchet,
                    quaver: quaver,
                    string: i
                });
                strings.push({ index: i, fret: fret });
            }
            return strings;
        }

        // storage methods
        function load() {
            let saved = storageService.get('tune');
            let tune = new Tune();
            if (!saved) {
                return tune;
            }

            for (let i = 0; i < saved.notes.length; i++) {
                tune.addNote(new Note(saved.notes[i]));
            }
            return tune;
        }

        function save() {
            storageService.set('tune', {
                notes: model.tune.notes
            });
        }
    }
})();