(function() {
    'use strict';

    define(['services/tune-service'], TablatureService);

    function TablatureService(tuneService) {
        let model = {
            bars: null
        };

        tuneService.addEventListener('load', load);

        return {
            load: load,
            model: model
        };

        function load() {
            let tune = tuneService.model.active.tune;
            let instrument = tuneService.model.active.instrument;
            model.bars = getBars(tune, instrument);
        }

        // model methods
        function getBars(tune, instrument) {
            let bars = [];

            if (!tune) {
                return bars;
            }

            for (let i = 0; i < Math.max(tune.maxBar(), 16); i++) {
                bars.push({
                    crotchets: getCrotchets(tune, instrument, i),
                    index: i
                });
            }
            return bars;
        }

        function getCrotchets(tune, instrument, bar) {
            let crotchets = [];
            for (let i = 0; i < tune.beatsPerBar; i++) {
                crotchets.push({
                    index: i,
                    quavers: getQuavers(tune, instrument, bar, i, 4)
                });

            }
            return crotchets;
        }

        function getQuavers(tune, instrument, bar, crotchet, numberOfQuavers) {
            let quavers = [];
            for (let i = 0; i < numberOfQuavers; i++) {
                quavers.push({
                    index: i,
                    strings: getStrings(tune, instrument, bar, crotchet, i)
                });
            }
            return quavers;
        }

        function getStrings(tune, instrument, bar, crotchet, quaver) {
            let strings = [];
            let frets = tune.getFrets({
                bar: bar,
                crotchet: crotchet,
                quaver: quaver
            }) || {};
            for (let i = 0; i < instrument.strings.length; i++) {
                strings.push({ index: i, fret: frets[i] });
            }
            return strings;
        }
    }
})();