(function() {
    'use strict';

    define(['services/instrument-service', 'services/storage-service', 'models/note', 'models/tune'], TablatureService);

    function TablatureService(instrumentService, storageService, Note, Tune) {
        let model = getModel();

        instrumentService.onInstrumentChanged(selectInstrument);

        return {
            save: save,
            model: model
        };

        // model methods
        function getModel() {
            let tune = load();
            instrumentService.selectInstrument(tune.instrumentName);

            return {
                tune: tune,
                bars: getBars(tune)
            };
        }

        function selectInstrument(name) {
            model.tune = new Tune();
            model.tune.instrumentName = name;
            model.bars = getBars(model.tune);
            save();
        }

        function getBars(tune) {
            if (!instrumentService.model.instrument) {
                return null;
            }

            let bars = [];
            for (let i = 0; i < Math.max(tune.maxBar(), 16); i++) {
                bars.push({
                    crotchets: getCrotchets(tune, instrumentService.model.instrument, i)
                });
            }
            return bars;
        }

        function getCrotchets(tune, instrument, bar) {
            let crotchets = [];
            for (let i = 0; i < tune.beatsPerBar; i++) {
                crotchets.push({
                    quavers: getQuavers(tune, instrument, bar, i, 4)
                });

            }
            return crotchets;
        }

        function getQuavers(tune, instrument, bar, crotchet, numberOfQuavers) {
            let quavers = [];
            for (let i = 0; i < numberOfQuavers; i++) {
                quavers.push({
                    strings: getStrings(tune, instrument, bar, crotchet, i)
                });
            }
            return quavers;
        }

        function getStrings(tune, instrument, bar, crotchet, quaver) {
            let strings = [];
            for (let i = 0; i < instrument.strings.length; i++) {
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

            tune.instrumentName = saved.instrumentName;
            for (let i = 0; i < saved.notes.length; i++) {
                tune.addNote(new Note(saved.notes[i]));
            }
            return tune;
        }

        function save() {
            storageService.set('tune', {
                instrumentName: model.tune.instrumentName,
                notes: model.tune.notes
            });
        }
    }
})();