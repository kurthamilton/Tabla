(function() {
    'use strict';

    define(['utils', 'models/part', 'models/tune','services/event-service', 'services/instrument-factory', 'services/storage-service'], TuneService);

    function TuneService(utils, Part, Tune, eventService, instrumentFactory, storageService) {
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
                getTuneForExport: function() {
                    return getSavedTuneObject(model.tune.id);
                },
                importTune: importTune,
                load: loadTune,
                save: saveTune,
                selectPart: selectPart,
                setNote: setNote,
                toggleEffect: toggleEffect,
                updateBars: updateBars,
                updatePart: updatePart,
                updateTune: updateTune
            },
            addEventListener: function(event, callback) {
                eventService.addEventListener(TuneService, event, callback);
            },
            load: loadTunes,
            model: model,
            tuneNameExists: function(name, id) {
                let index = getTuneIndexByName(name);
                if (index < 0) {
                    return false;
                }
                return getTuneIndex(id) !== index;
            }
        };

        // actions
        function addPart(options) {
            if (!model.tune) {
                return;
            }

            let part = createPart(model.tune, options);
            setActivePart(part);

            trigger('part.added', { index: model.tune.parts.length - 1 });

            utils.async(() => saveActiveTune());
        }

        function addTune(tune) {
            model.tunes.push({
                id: tune.id,
                name: tune.name
            });
        }

        function createPart(tune, options) {
            options.id = utils.guid();
            options.name = options.name || options.instrumentName;
            options.sound = options.sound || instrumentFactory.defaultSound(options.instrumentName);
            options.tune = tune;
            let part = new Part(options);
            tune.parts.push(part);
            return part;
        }

        function createTune(options) {
            options.id = utils.guid();

            let tune = new Tune(options);
            createPart(tune, options);

            addTune(tune);
            setActiveTune(tune);

            utils.async(() => {
                saveActiveTune();
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

            utils.async(() => saveActiveTune());
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

        function getTuneIndexByName(name) {
            if (!name) {
                return -1;
            }
            name = name.toLowerCase();
            return model.tunes.findIndex(i => i.name.toLowerCase() === name);
        }

        function importTune(tuneObject) {
            let tune = parseTune(tuneObject);

            if (getTuneIndex(tune.id) > 0 && !confirm('Tune id already exists. Do you want to overwrite the existing tune?')) {
                tune.id = utils.guid();
            }

            let name = tune.name;
            let i = 2;
            while (getTuneIndexByName(tune.name) > 0) {
                tune.name = `${name} (${i++})`;
            }

            if (getTuneIndex(tune.id) < 0) {
                addTune(tune);
            }

            utils.async(() => {
                saveTunes();
                saveTune(tune);
            });
        }

        function loadTune(id) {
            let stored = getSavedTuneObject(id);
            let tune = stored ? parseTune(stored) : null;
            setActiveTune(tune);
            utils.async(() => saveTunes());
        }

        function parseTune(options) {
            if (!options) {
                options = {};
            }

            options.id = options.id || utils.guid();
            return new Tune(options);
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

        function setNote(note) {
            if (!model.part) {
                return false;
            }

            let fret = note.fret;
            if (fret === null || isNaN(fret) === true) {
                model.part.deleteNote(note);
                utils.async(() => saveActiveTune());
                return true;
            }

            if (fret >= 0 && fret <= model.part.instrument.frets) {
                model.part.addNote(note);
                utils.async(() => saveActiveTune());
                return true;
            }

            return false;
        }

        function toggleEffect(note, effect) {
            if (!model.part) {
                return false;
            }

            let partNote = model.part.getNote(note);
            if (!partNote) {
                return;
            }

            let on = partNote.toggleEffect(effect);

            utils.async(() => saveActiveTune());

            return on;
        }

        function updateBars(options) {
             if (!options || !options.number) {
                 return;
             }
             if (options.number < model.tune.bars.length && !confirm('You are about to delete some bars. Are you sure?')) {
                return;
            }

            model.tune.setNumberOfBars(options.number);
            trigger('tune.bars.updated');
            saveActiveTune();
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
            saveActiveTune();
        }

        function updateTune(tune) {
            if (!tune) {
                return;
            }

            // ensure tunes object has current tune name
            let i = model.tunes.findIndex(t => t.id === tune.id);
            model.tunes[i].name = tune.name;

            utils.async(() => {
                saveTune(tune);
                saveTunes();
            });
        }

        // event handlers
        function trigger(event, ...args) {
            eventService.trigger(TuneService, event, ...args);
        }

        // storage functions
        function getSavedTuneObject(id) {
            return storageService.get(`tune.${id}`);
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

        function saveActiveTune() {
            saveTune(model.tune);
        }

        function saveTune(tune) {
            if (!tune) {
                return;
            }
            storageService.set(`tune.${tune.id}`, tune.serialize());
        }

        function saveTunes() {
            storageService.set('tunes', {
                activeId: model.tune ? model.tune.id : null,
                values: model.tunes
            });
        }
    }
})();