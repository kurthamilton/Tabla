(function() {
    'use strict';

    define(['utils', 'models/note', 'models/tune', 'services/storage-service'], TuneService);

    function TuneService(utils, Note, Tune, storageService) {
        let eventListeners = {};

        let model = {
            tune: null,
            tunes: null
        };

        loadTunes();

        return {
            actions: {
                create: createTune,
                delete: deleteTune,
                load: loadTune,
                save: saveTune
            },
            model: model,
            on: onEvent
        };

        // event handling
        function onEvent(event, callback) {
            if (typeof callback !== 'function') {
                return;
            }

            if (!eventListeners.hasOwnProperty(event)) {
                eventListeners[event] = [];
            }

            eventListeners[event].push(callback);
        }

        function trigger(event) {
            if (!eventListeners.hasOwnProperty(event)) {
                return;
            }

            let callbacks = eventListeners[event];
            for (let i = 0; i < callbacks.length; i++) {
                callbacks[i]();
            }
        }

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

            if (model.tune && model.tune.id === id) {
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
            model.tune = getTune(id);
            trigger('load');
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

        function saveTune() {
            if (!model.tune) {
                return;
            }

            let arrayIndex = getTuneIndex(model.tune.id);
            model.tunes[arrayIndex] = model.tune;
            saveTunes();
        }

        function saveTunes() {
            storageService.set('tunes', {
                activeId: model.tune ? model.tune.id : null,
                values: model.tunes
            });
        }
    }
})();