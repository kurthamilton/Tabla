(function() {
    'use strict';

    define(['utils', 'models/note', 'models/part', 'models/tune','services/event-service', 'services/instrument-factory', 'services/storage-service'], TuneService);

    function TuneService(utils, Note, Part, Tune, eventService, instrumentFactory, storageService) {
        let model = {
            part: null,         // the active part object
            tune: null,         // the active tune object
            tunes: []           // an array of simple tune info objects
        };

        return {
            actions: {
                addPart: addPart,
                create: createTune,
                delete: deleteTune,
                deletePart: deletePart,
                load: loadTune,
                save: saveTune,
                selectPart: selectPart,
                updatePart: updatePart
            },
            addEventListener: function(event, callback) {
                eventService.addEventListener(TuneService, event, callback);
            },
            load: loadTunes,
            model: model
        };

        // actions
        function addPart(options) {
            if (!model.tune) {
                return;
            }

            options.id = utils.guid();
            options.sound = options.sound || instrumentFactory.defaultSound(options.instrumentName);
            options.tune = model.tune;

            let part = new Part(options);
            model.tune.parts.push(part);

            setActivePart(part);

            trigger('part.added', { index: model.tune.parts.length - 1 });

            utils.async(() => saveTune());
        }

        function createTune(options) {
            options.id = utils.guid();

            let tune = new Tune(options);

            options.id = utils.guid();
            options.name = options.instrumentName;
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

        function deletePart(part) {
            let index = part.index();
            let tune = model.tune;
            tune.parts.splice(index, 1);

            if (part.id === model.part.id) {
                if (index >= tune.parts.length) {
                    index = tune.parts.length - 1;
                }
                setActivePart(tune.parts.length > 0 ? tune.parts[index] : null);
            }

            trigger('part.deleted', { index: index });

            utils.async(() => saveTune());
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

        function selectPart(index) {
            let part = model.tune.parts[index];
            setActivePart(part);
        }

        function setActivePart(part) {
            model.part = part;
            trigger('part.selected', part);
        }

        function setActiveTune(tune) {
            model.tune = tune;
            setActivePart(tune ? tune.parts[0] : null);
            trigger('load', tune);
        }

        function updatePart(index, options) {
            if (!model.tune) {
                return;
            }

            let part = model.tune.parts[index];
            if (!part) {
                return;
            }

            part.instrumentName = options.instrumentName || part.instrumentName;
            part.name = options.name || part.instrumentName;
            part.sound = options.sound || part.sound;

            trigger('part.updated', { index: index });
            saveTune();
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