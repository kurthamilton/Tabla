(function(MIDI) {
    'use strict';

    define(['utils', 'services/event-service', 'services/scale-service', 'services/tablature-service', 'services/tune-service'], PlayService);

    function PlayService(utils, eventService, scaleService, tablatureService, tuneService) {
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
                    min: 40,
                    max: 300
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
            notes: {},
            get tune() {
                return tuneService.model.active.tune;
            }
        };

        tuneService.addEventListener('load', loadInstrument);

        return {
            actions: {
                resume: resume,
                start: start,
                stop: stop
            },
            addEventListener: function(event, callback) {
                eventService.addEventListener(`play-service:${event}`, callback);
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

        function loadInstrument() {
            let instrumentName = tuneService.model.active.instrument.name;

            utils.loadScript(`./assets/midi/${instrumentName}-ogg.js`, function() {
                MIDI.loadPlugin({
                    instrument: instrumentName,
                    onprogress: function(state, progress) {
                        console.log(state, progress);
                    },
                    onsuccess: function() {
                        MIDI.programChange(0, MIDI.GM.byName[instrumentName].number);
                        trigger('ready');
                    }
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

        function playNote(note) {
            let midiNote = scaleService.midiNote(note.note, note.octave);
            MIDI.noteOn(0, midiNote, 127); // channel, note, velocity
        }

        function playNotes() {
            let frets = model.tune.getFrets(context);

            if (!frets) {
                return;
            }

            let instrument = tuneService.model.active.instrument;
            for (let i in frets) {
                let string = instrument.strings[i];
                let note = scaleService.noteAtFret(string.note, string.octave, frets[i]);
                if (model.notes.hasOwnProperty(i)) {
                    // stop note on current string
                    stopNote(note);
                }
                model.notes[i] = note;
                playNote(note);
            }
            trigger('play');
        }

        function quaverInterval() {
            let secondsPerBeat = 60 / model.bpm;
            let secondsPerQuaver = secondsPerBeat / 4;
            return 1000 * secondsPerQuaver;
        }

        function start() {
            if (context.playing) {
                return;
            }
            context.bar = 0;
            context.crotchet = 0;
            context.playing = true;
            context.quaver = 0;
            trigger('reset');
            play();
        }

        function resume() {
            if (context.playing) {
                return;
            }
            context.playing = true;
            play();
        }

        function stop() {
            if (!context.playing) {
                return;
            }
            clearTimeout(context.handle);
            context.playing = false;
        }

        function stopNote(note) {
            let midiNote = scaleService.midiNote(note.note, note.octave);
            MIDI.noteOff(0, midiNote, 0);
        }

        function trigger(event, ...args) {
            eventService.trigger(`play-service:${event}`, ...args);
        }
    }
})(MIDI);