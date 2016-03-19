(function() {
    'use strict';

    define(['utils', 'models/note', 'models/part', 'models/tune','services/event-service', 'services/instrument-factory', 'services/storage-service'], TuneService);

    function TuneService(utils, Note, Part, Tune, eventService, instrumentFactory, storageService) {
        let model = {
            instrument: null,   // the active instrument object
            tune: null,         // the active tune object
            tunes: []           // an array of simple tune info objects
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

        // actions
        function createTune(options) {
            options.id = utils.guid();

            let tune = new Tune(options);

            options.id = utils.guid();
            options.sound = instrumentFactory.defaultSound(options.instrumentName);
            options.tune = tune;
            tune.parts.push(new Part(options));

            model.tunes.push({
                id: tune.id,
                name: tune.name
            });
            setActiveTune(tune);

            utils.async(() => {
                saveTune();
                saveTunes();
            });
        }

        function deleteTune(id) {
            let index = getTuneIndex(id);
            if (index < 0) {
                return;
            }

            model.tunes.splice(index, 1);

            if (model.tune && model.tune.id === id) {
                setActiveTune(null);
            }

            utils.async(() => {
                removeTune(id);
                saveTunes();
            });
        }

        function getTuneIndex(id) {
            return model.tunes.findIndex(i => i.id === id);
        }

        function setActiveTune(tune) {
            model.instrument = instrumentFactory.get(tune ? tune.parts[0].instrumentName : null);
            model.tune = tune;
            trigger('load', tune);
        }

        // event handlers
        function trigger(event, ...args) {
            eventService.trigger(TuneService, event, ...args);
        }

        // storage functions
        function deserializePart(object, tune) {
            let part = new Part(object);
            part.tune = tune;
            object.notes.forEach(note => part.addNote(new Note(note)));
            return part;
        }

        function deserializeTune(object) {
            let tune = new Tune(object);
            object.parts.forEach(part => tune.parts.push(deserializePart(part, tune)));
            return tune;
        }

        function loadTune(id) {
            let saved = storageService.get(`tune.${id}`);
            let tune = null;
            if (saved) {
                tune = deserializeTune(saved);
            }
            setActiveTune(tune);
            utils.async(() => saveTunes());
        }

        function loadTunes() {
            let saved = storageService.get('tunes') || {
                activeId: '',
                values: []
            };

            model.tunes.push(...saved.values);
            loadTune(saved.activeId);
        }

        function removeTune(id) {
            storageService.remove(`tune.${id}`);
        }

        function saveTune() {
            if (!model.tune) {
                return;
            }
            storageService.set(`tune.${model.tune.id}`, model.tune.serialize());
        }

        function saveTunes() {
            storageService.set('tunes', {
                activeId: model.tune ? model.tune.id : null,
                values: model.tunes
            });
        }
    }
})();