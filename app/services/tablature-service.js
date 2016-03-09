(function() {
    'use strict';

    define(['utils', 'services/instrument-factory', 'services/storage-service', 'models/note', 'models/tune'], TablatureService);

    function TablatureService(utils, instrumentFactory, storageService, Note, Tune) {
        let model = {
            tune: null,
            tunes: null
        };

        loadTunes();

        return {
            actions: {
                create: createTune,
                delete: deleteTune,
                load: loadTune
            },
            model: model
        };

        // model methods
        function getBars(tune) {
            let bars = [];
            let instrument = instrumentFactory.get(tune.instrument);
            for (let i = 0; i < Math.max(tune.maxBar(), 16); i++) {
                bars.push({
                    crotchets: getCrotchets(tune, instrument, i)
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

        // actions
        function createTune(options) {
            let tune = new Tune({
                id: utils.guid(),
                instrument: options.instrument,
                name: options.name
            });
            model.tunes.unshift(tune);
            model.tune = tune;
            saveTunes();
        }

        function deleteTune(id) {
            let index = getTuneIndex(id);
            if (index < 0) {
                return;
            }
            model.tunes.splice(index, 1);
            saveTunes();
        }

        function getTuneIndex(id) {
            return model.tunes.findIndex(i => i.id === id);
        }

        function getTune(id) {
            let index = getTuneIndex(id);
            if (index < 0) {
                return null;
            }

            return model.tunes[index];
        }

        function loadTune(id) {
            model.tune = getTune(id);
        }

        // storage functions
        function deserializeTune(object) {
            let tune = new Tune(object);
            let notes = object.notes;
            for (let i = 0; i < notes.length; i++) {
                tune.addNote(new Note(notes[i]));
            }
            return tune;
        }

        function loadTunes() {
            model.tunes = [];
            model.tune = null;

            let saved = storageService.get('tunes');
            if (!saved) {
                return null;
            }

            let activeId = saved.activeId;
            let tunes = saved.values;
            for (let i = 0; i < tunes.length; i++) {
                let tune = deserializeTune(tunes[i]);
                if (tune.id === activeId) {
                    model.tune = tune;
                }
                model.tunes.push(tune);
            }
        }

        function saveTunes() {
            storageService.set('tunes', {
                activeId: model.tune ? model.tune.id : null,
                values: model.tunes
            });
        }
    }
})();