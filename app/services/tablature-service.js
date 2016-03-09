(function() {
    'use strict';

    define(['services/instrument-factory'], TablatureService);

    function TablatureService(instrumentFactory) {
        let model = {
            bars: null
        };

        return {
            load: load,
            model: model
        };

        function load(tune) {
            model.bars = getBars(tune);
        }

        // model methods
        function getBars(tune) {
            let bars = [];

            if (!tune) {
                return bars;
            }

            let instrument = instrumentFactory.get(tune.instrument);
            for (let i = 0; i < Math.max(tune.maxBar(), 16); i++) {
                bars.push({
                    crotchets: getCrotchets(tune, instrument, i)
                });
            }
            return bars;
        }

        function getCrotchets(tune, instrument, bar) {
            let crotchets = [];
            for (let i = 0; i < tune.beatsPerBar; i++) {
                crotchets.push({
                    quavers: getQuavers(tune, instrument, bar, i, 4)
                });

            }
            return crotchets;
        }

        function getQuavers(tune, instrument, bar, crotchet, numberOfQuavers) {
            let quavers = [];
            for (let i = 0; i < numberOfQuavers; i++) {
                quavers.push({
                    strings: getStrings(tune, instrument, bar, crotchet, i)
                });
            }
            return quavers;
        }

        function getStrings(tune, instrument, bar, crotchet, quaver) {
            let strings = [];
            for (let i = 0; i < instrument.strings.length; i++) {
                let fret = tune.getFret({
                    bar: bar,
                    crotchet: crotchet,
                    quaver: quaver,
                    string: i
                });
                strings.push({ index: i, fret: fret });
            }
            return strings;
        }
    }
})();