(function() {
    'use strict';

    define(['services/tune-service'], TablatureService);

    function TablatureService(tuneService) {
        let model = {
            bars: null,
            ready: false
        };

        tuneService.addEventListener('load', onTuneLoaded);

        return {
            model: model
        };

        function onTuneLoaded(tune) {
            model.ready = false;

            let instrument = tuneService.model.instrument;
            model.bars = getBars(tune ? tune.parts[0] : null, instrument);
            model.ready = model.bars.length > 0;
        }

        // model methods
        function getBars(part, instrument) {
            let bars = [];

            if (!part) {
                return bars;
            }

            for (let i = 0; i < part.tune.bars; i++) {
                bars.push({
                    crotchets: getCrotchets(part, instrument, i),
                    index: i
                });
            }
            return bars;
        }

        function getCrotchets(part, instrument, bar) {
            let crotchets = [];
            for (let i = 0; i < part.tune.beatsPerBar; i++) {
                crotchets.push({
                    index: i,
                    quavers: getQuavers(part, instrument, bar, i, 4)
                });

            }
            return crotchets;
        }

        function getQuavers(part, instrument, bar, crotchet, numberOfQuavers) {
            let quavers = [];
            for (let i = 0; i < numberOfQuavers; i++) {
                quavers.push({
                    index: i,
                    strings: getStrings(part, instrument, bar, crotchet, i)
                });
            }
            return quavers;
        }

        function getStrings(part, instrument, bar, crotchet, quaver) {
            let strings = [];
            let frets = part.getFrets({
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