(function() {
    'use strict';

    define(['services/tablature-service', 'services/tune-service'], PlayService);

    function PlayService(tablatureService, tuneService) {
        let model = {
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

        let context = {
            bar: 0,
            crotchet: 0,
            quaver: 0,
            handle: null,
            playing: false
        };

        return {
            actions: {
                resume: resume,
                start: start,
                stop: stop
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
        }

        function play() {
            if (!context.playing) {
                return;
            }

            incrementQuaver();

            context.handle = setTimeout(play, quaverInterval());
        }

        function quaverInterval() {
            return 1000 * (model.bpm / 60 / 4);
        }

        function start() {
            if (context.playing) {
                return;
            }
            context.bar = 0;
            context.crotchet = 0;
            context.playing = true;
            context.quaver = 0;
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
    }
})();