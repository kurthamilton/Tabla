(function() {
    'use strict';

    define(['utils', 'models/note', 'models/tune', 'services/storage-service'], TuneService);

    function TuneService(utils, Note, Tune, storageService) {
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

            let activeId = saved.activeId;
            let tunes = saved.values;
            for (let i = 0; i < tunes.length; i++) {
                let tune = deserializeTune(tunes[i]);
                model.tunes.push(tune);

                if (tune.id === activeId) {
                    setActiveTune(tune);
                }
            }
        }

        function saveTune() {
            let arrayIndex = getTuneIndex(model.tuneId);
            if (arrayIndex < 0) {
                return;
            }
            model.tunes[arrayIndex] = model.tune;
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