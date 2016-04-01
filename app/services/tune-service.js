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

        function setNote(note) {
            if (!model.part) {
                return false;
            }

            let fret = note.fret;
            if (fret === null || isNaN(fret) === true) {
                model.part.deleteNote(note);
                utils.async(() => saveTune());
                return true;
            }

            if (fret >= 0 && fret <= 24) {
                model.part.addNote(note);
                utils.async(() => saveTune());
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

            utils.async(() => saveTune());

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
            saveTune();
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

        function updateTune(options) {
            if (!model.tune) {
                return;
            }

            if (options.name && model.tune.name !== options.name) {
                model.tune.name = options.name;

                // update tunes object with updated name
                let i = model.tunes.findIndex(t => t.id === model.tune.id);
                model.tunes[i].name = options.name;
            }

            utils.async(() => {
                saveTune();
                saveTunes();
            });
        }

        // event handlers
        function trigger(event, ...args) {
            eventService.trigger(TuneService, event, ...args);
        }

        // storage functions
        function loadTune(id) {
            let saved = storageService.get(`tune.${id}`);
            let tune = null;
            if (saved) {
                tune = new Tune(saved);
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