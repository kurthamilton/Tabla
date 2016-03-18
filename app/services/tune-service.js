(function() {
    'use strict';

    define(['utils', 'models/note', 'models/tune','services/event-service', 'services/instrument-factory', 'services/storage-service'], TuneService);

    function TuneService(utils, Note, Tune, eventService, instrumentFactory, storageService) {
        let instrument = null;

        let model = {
            active: {
                id: '',
                get instrument() {
                    return instrument;
                },
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
            addEventListener: function(event, callback) {
                eventService.addEventListener(TuneService, event, callback);
            },
            load: loadTunes,
            model: model
        };

        function trigger(event) {
            eventService.trigger(TuneService, event);
        }

        // actions
        function createTune(options) {
            options.id = utils.guid();
            let tune = new Tune(options);
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

            if (model.active.id === id) {
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
            instrument = tune ? instrumentFactory.get(tune.instrument) : null;
            trigger('load');
        }

        // storage functions
        function deserializeTune(object) {
            let tune = new Tune(object);
            object.notes.forEach(note => tune.addNote(new Note(note)));
            return tune;
        }

        function loadTunes() {
            model.tunes = [];

            let saved = storageService.get('tunes');
            if (!saved) {
                return null;
            }

            saved.values.forEach(savedTune => {
                let tune = deserializeTune(savedTune);
                model.tunes.push(tune);
            });

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
                values: model.tunes.map(tune => tune.serialize())
            });
        }
    }
})();