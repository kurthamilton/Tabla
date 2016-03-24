(function() {
    'use strict';

    define(['services/instrument-factory', 'services/tune-service'], TablatureService);

    function TablatureService(instrumentFactory, tuneService) {
        let model = {
            bars: null,
            ready: false
        };

        tuneService.addEventListener('part.selected', onPartSelected);

        return {
            actions: {
                setNote: setNote
            },
            model: model
        };

        function onPartSelected(part) {
            model.ready = false;

            model.bars = getBars(part);
            model.ready = model.bars.length > 0;
        }

        // model methods
        function getBars(part) {
            let bars = [];

            if (!part) {
                return bars;
            }

            let instrument = instrumentFactory.get(part.instrumentName);
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

        function setNote(note) {
            if (!tuneService.actions.setNote(note)) {
                return false;
            }
            let modelNote = model.bars[note.bar].crotchets[note.crotchet].quavers[note.quaver].strings[note.string];
            modelNote.fret = note.fret;
            return true;
        }
    }
})();