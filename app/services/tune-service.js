(function() {
    'use strict';

    define(['utils', 'models/note', 'models/tune', 'services/storage-service', 'services/tablature-service'], TuneService);

    function TuneService(utils, Note, Tune, storageService, tablatureService) {
        let model = {
            active: {
                id: '',
                tune: null
            },
            tunes: null
        };

        return {
            actions: {
                create: createTune,
                delete: deleteTune,
                load: loadTune,
                save: saveTune
            },
            load: loadTunes,
            model: model
        };

        // actions
        function createTune(options) {
            let tune = new Tune({
                id: utils.guid(),
                instrument: options.instrument,
                name: options.name
            });
            model.tunes.unshift(tune);
            saveTunes();
            loadTune(tune.id);
        }

        function deleteTune(id) {
            let index = getTuneIndex(id);
            if (index < 0) {
                return;
            }
            model.tunes.splice(index, 1);
            saveTunes();

            if (model.tuneId === id) {
                loadTune(null);
            }
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
            setActiveTune(getTune(id));
            saveTunes();
        }

        function setActiveTune(tune) {
            model.active.tune = tune;
            model.active.id = tune ? tune.id : '';
            tablatureService.load(model.active.tune);
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

            let saved = storageService.get('tunes');
            if (!saved) {
                return null;
            }

            let tunes = saved.values;
            for (let i = 0; i < tunes.length; i++) {
                let tune = deserializeTune(tunes[i]);
                model.tunes.push(tune);
            }

            let activeId = saved.activeId;
            let tune = getTune(activeId);
            if (tune) {
                setActiveTune(tune);
            }
        }

        function saveTune() {
            let arrayIndex = getTuneIndex(model.active.id);
            if (arrayIndex < 0) {
                return;
            }
            model.tunes[arrayIndex] = model.active.tune;
            saveTunes();
        }

        function saveTunes() {
            storageService.set('tunes', {
                activeId: model.active.id,
                values: model.tunes
            });
        }
    }
})();