(function(MIDI) {
    'use strict';

    define(['utils', 'services/event-service', 'services/instrument-factory', 'services/scale-service', 'services/tablature-service', 'services/tune-service'], AudioService);

    function AudioService(utils, eventService, instrumentFactory, scaleService, tablatureService, tuneService) {
        let context = {
            bar: 0,
            crotchet: 0,
            handle: null,
            quaver: 0
        };

        // todo - move this to somewhere more suitable
        // A dictionary of instruments, keyed by part index
        let instruments = {};

        let model = {
            get bar() {
                return context.bar;
            },
            loading: false,
            notes: {},
            playing: false,
            ready: false,
            get tune() {
                return tuneService.model.tune;
            }
        };

        tuneService.addEventListener('load', () => loadInstruments());
        tuneService.addEventListener('part.added', () => loadInstrument(model.tune.parts.length - 1));
        tuneService.addEventListener('part.updated', (e) => loadInstrument(e.index));
        tuneService.addEventListener('part.deleted', (e) => removeInstrument(e.index));

        return {
            actions: {
                pause: pause,
                resume: resume,
                reset: reset,
                start: start,
                toggle: toggle
            },
            addEventListener: function(event, callback) {
                eventService.addEventListener(AudioService, event, callback);
            },
            model: model
        };

        // instrument functions
        function loadInstrument(partIndex, callback) {
            model.loading = true;
            model.ready = false;

            let part = model.tune.parts[partIndex];
            let sound = part.sound;

            let load = MIDI.supports ? MIDI.loadResource : MIDI.loadPlugin;
            loadInstrumentScript(sound, () => {
                load({
                    instrument: sound,
                    onsuccess: function() {
                        setMidiChannel(partIndex);
                        onInstrumentLoaded(part, partIndex);
                        if (typeof callback === 'function') {
                            callback();
                        }
                    }
                });
            });
        }

        function loadInstruments(partIndexes) {
            model.ready = false;

            if (!model.tune) {
                return;
            }

            partIndexes = partIndexes || model.tune.parts.map((part, i) => i);

            if (!Array.isArray(partIndexes)) {
                partIndexes = [partIndexes];
            }

            if (!MIDI.supports) {
                // if midi isn't loaded, set up midi with first instrument, then load other instruments
                loadInstrument(0, () => partIndexes.filter(i => i > 0)
                                                   .forEach(partIndex => loadInstrument(partIndex))
                );
            } else {
                partIndexes.forEach(partIndex => loadInstrument(partIndex));
            }
        }

        function loadInstrumentScript(sound, callback) {
            utils.loadScript(`${MIDI.soundfontUrl}${sound}-ogg.js`, callback);
        }

        function onInstrumentLoaded(part, partIndex) {
            instruments[partIndex] = instrumentFactory.get(part.instrumentName);

            let ready = true;
            model.tune.parts.forEach((part, partIndex) => {
                if (!instruments.hasOwnProperty(partIndex)) {
                    return (ready = false);
                }
            });

            if (!ready) {
                return;
            }

            model.loading = false;
            model.ready = true;
            trigger('ready');
        }

        function removeInstrument(partIndex) {
            delete instruments[partIndex];

            // move subsequent instruments down one place
            while (instruments.hasOwnProperty(++partIndex)) {
                instruments[partIndex - 1] = instruments[partIndex];
                delete instruments[partIndex];
                setMidiChannel(partIndex - 1);
            }
        }

        function setMidiChannel(partIndex) {
            let sound = model.tune.parts[partIndex].sound;
            MIDI.programChange(partIndex, MIDI.GM.byName[sound].number);
        }

        // play functions
        function incrementQuaver() {
            context.quaver++;
            if (context.quaver > 3) {
                context.crotchet++;
                context.quaver = 0;
            }
            if (context.crotchet >= model.tune.beatsPerBar) {
                context.bar++;
                context.crotchet = 0;
            }
            if (context.bar >= tablatureService.model.bars.length) {
                context.bar = 0;
            }

            trigger('increment');
        }

        function pause() {
            if (!model.playing) {
                return;
            }
            stopNotes();
            clearTimeout(context.handle);
            model.playing = false;
        }

        function play() {
            if (!model.playing) {
                return;
            }

            // firstly, schedule next play to keep time to the best of our capabilities
            context.handle = setTimeout(play, quaverInterval());

            playNotes();
            incrementQuaver();
        }

        function playNote(note, channel, volume) {
            // volume is a percentage between 0 and 1
            let midiNote = scaleService.midiNote(note.note, note.octave);
            MIDI.noteOn(channel, midiNote, volume * 127);
        }

        function playNotes() {
            model.tune.parts.forEach((part, partIndex) => {
                let frets = part.getFrets(context);
                if (!frets) {
                    return;
                }

                let instrument = instruments[partIndex];
                for (let i in frets) {
                    let string = instrument.strings[i];
                    let note = scaleService.noteAtFret(string.note, string.octave, frets[i]);
                    if (!model.notes.hasOwnProperty(partIndex)) {
                        model.notes[partIndex] = {};
                    }

                    if (model.notes[partIndex].hasOwnProperty(i)) {
                        // stop note on current string
                        stopNote(model.notes[partIndex][i], partIndex);
                    }
                    model.notes[partIndex][i] = note;
                    playNote(note, partIndex, part.tune.volume * part.volume);
                }
            });

            trigger('play');
        }

        function quaverInterval() {
            let secondsPerBeat = 60 / model.tune.bpm;
            let secondsPerQuaver = secondsPerBeat / 4;
            return 1000 * secondsPerQuaver;
        }

        function reset() {
            context.bar = 0;
            context.crotchet = 0;
            context.quaver = 0;
            trigger('reset');
        }

        function resume() {
            if (model.playing) {
                return;
            }
            model.playing = true;
            play();
        }

        function start() {
            if (model.playing) {
                return;
            }
            reset();
            model.playing = true;
            play();
        }

        function stopNote(note, channel) {
            let midiNote = scaleService.midiNote(note.note, note.octave);
            MIDI.noteOff(channel, midiNote);
        }

        function stopNotes() {
            // todo: do this in a better way
            model.tune.parts.forEach((part, partIndex) => {
                if (model.notes.hasOwnProperty(partIndex)) {
                    for (let i in model.notes[partIndex]) {
                        let note = model.notes[partIndex][i];
                        if (note) {
                            stopNote(note, partIndex);
                        }
                    }
                }
            });
        }

        function toggle() {
            if (model.playing) {
                pause();
            } else {
                resume();
            }
        }

        function trigger(event, ...args) {
            eventService.trigger(AudioService, event, ...args);
        }
    }
})(MIDI);