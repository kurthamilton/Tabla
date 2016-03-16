(function() {
    'use strict';

    define(['utils', 'services/event-service', 'services/tablature-service', 'services/tune-service'], PlayService);

    function PlayService(utils, eventService, tablatureService, tuneService) {
        let context = {
            bar: 0,
            crotchet: 0,
            handle: null,
            notes: null,
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
            get tune() {
                return tuneService.model.active.tune;
            }
        };

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

        function play() {
            if (!context.playing) {
                return;
            }

            incrementQuaver();
            playNotes();

            context.handle = setTimeout(play, quaverInterval());
        }

        function playNotes() {
            let notes = [];
            while (context.notes.length > 0 && context.notes[0].bar === context.bar && context.notes[0].crotchet === context.crotchet && context.notes[0].quaver === context.quaver) {

            }
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
            context.notes = model.tune.orderedNotes();
            context.playing = true;
            context.quaver = 0;
            play();
        }

        function resume() {
            if (context.playing) {
                return;
            }
            context.notes = model.tune.orderedNotes();
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

        function trigger(event) {
            eventService.trigger(`play-service:${event}`);
        }
    }
})();