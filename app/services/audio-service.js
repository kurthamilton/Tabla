(function(MIDI) {
    'use strict';

    define(['utils', 'services/event-service', 'services/scale-service', 'services/tablature-service', 'services/tune-service'], AudioService);

    function AudioService(utils, eventService, scaleService, tablatureService, tuneService) {
        let context = {
            bar: 0,
            crotchet: 0,
            handle: null,
            playing: false,
            quaver: 0
        };

        let model = {
            get bar() {
                return context.bar;
            },
            bounds: {
                bpm: {
                    get min() { return 40; },
                    get max() { return 300; }
                }
            },
            get bpm() {
                return model.tune ? model.tune.bpm : null;
            },
            set bpm(value) {
                if (!model.tune) {
                    return;
                }
                if (value < model.bounds.bpm.min || value > model.bounds.bpm.max) {
                    return;
                }
                model.tune.bpm = value;
                tuneService.actions.save();
            },
            loading: false,
            notes: {},
            ready: false,
            get tune() {
                return tuneService.model.tune;
            }
        };

        tuneService.addEventListener(['load', 'part.added', 'part.deleted'], loadInstruments);

        return {
            actions: {
                resume: resume,
                reset: reset,
                start: start,
                stop: stop,
                toggle: toggle
            },
            addEventListener: function(event, callback) {
                eventService.addEventListener(AudioService, event, callback);
            },
            model: model
        };

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

        function loadInstruments() {
            model.ready = false;

            let tune = tuneService.model.tune;
            if (!tune) {
                return;
            }

            model.loading = true;
            let loadedParts = [];
            tune.parts.forEach((part, partIndex) => {
                let sound = part.sound;
                utils.loadScript(`./assets/midi/${sound}-ogg.js`, function() {
                    MIDI.loadPlugin({
                        instrument: sound,
                        onprogress: function(state, progress) {
                            console.log(state, progress);
                        },
                        onsuccess: function() {
                            MIDI.programChange(partIndex, MIDI.GM.byName[sound].number);
                            loadedParts.push(partIndex);
                            if (loadedParts.length === tune.parts.length) {
                                model.loading = false;
                                model.ready = true;
                                trigger('ready');
                            }
                        }
                    });
                });
            });
        }

        function play() {
            if (!context.playing) {
                return;
            }

            playNotes();
            incrementQuaver();

            context.handle = setTimeout(play, quaverInterval());
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

                let instrument = tuneService.model.instrument;
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
                    playNote(note, partIndex, part.volume);
                }
            });

            trigger('play');
        }

        function quaverInterval() {
            let secondsPerBeat = 60 / model.bpm;
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
            if (context.playing) {
                return;
            }
            context.playing = true;
            play();
        }

        function start() {
            if (context.playing) {
                return;
            }
            reset();
            context.playing = true;
            play();
        }

        function stop() {
            if (!context.playing) {
                return;
            }
            stopNotes();
            clearTimeout(context.handle);
            context.playing = false;
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
            if (context.playing) {
                stop();
            } else {
                resume();
            }
        }

        function trigger(event, ...args) {
            eventService.trigger(AudioService, event, ...args);
        }
    }
})(MIDI);