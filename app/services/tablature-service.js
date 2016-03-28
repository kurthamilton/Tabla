(function() {
    'use strict';

    define(['services/audio-service', 'services/tune-service'], TablatureService);

    function TablatureService(audioService, tuneService) {
        let model = {
            bars: null,
            playPosition: null,
            ready: false,
            selectedNote: null,
            selectedRange: null
        };

        audioService.addEventListener('play-position.changed', onPlayPositionChanged);
        tuneService.addEventListener('part.selected', onPartSelected);

        return {
            actions: {
                moveSelectedNote: moveSelectedNote,
                selectNote: selectNote,
                setFret: setFret
            },
            model: model
        };

        function onPartSelected(part) {
            model.ready = false;

            model.bars = getBars(part);
            model.ready = model.bars.length > 0;
        }

        function onPlayPositionChanged(position) {
            if (model.playPosition) {
                getQuaver(model.playPosition).playPosition = false;
            }

            getQuaver(position).playPosition = true;
            model.playPosition = position;
        }

        // model methods
        function cancelSelectedNote() {
            if (!model.selectedNote) {
                return;
            }

            let string = getString(model.selectedNote);
            if (!string) {
                return;
            }

            string.active = false;
        }

        function copyNote(options) {
            if (!options) {
                return null;
            }

            return {
                bar: options.bar,
                crotchet: options.crotchet,
                fret: options.fret,
                quaver: options.quaver,
                string: options.string
            };
        }

        function getBars(part) {
            let bars = [];

            if (!part) {
                return bars;
            }

            part.tune.bars.forEach(bar =>
                bars.push({
                    crotchets: getCrotchets(part, bar),
                    index: bar.index
                })
            );

            return bars;
        }

        function getCrotchets(part, bar) {
            let crotchets = [];
            for (let i = 0; i < bar.beats; i++) {
                crotchets.push({
                    index: i,
                    quavers: getQuavers(part, bar.index, i, 4)
                });

            }
            return crotchets;
        }

        function getQuaver(position) {
            return model.bars[position.bar].crotchets[position.crotchet].quavers[position.quaver];
        }

        function getQuavers(part, bar, crotchet, numberOfQuavers) {
            let quavers = [];
            for (let i = 0; i < numberOfQuavers; i++) {
                quavers.push({
                    index: i,
                    strings: getStrings(part, bar, crotchet, i)
                });
            }
            return quavers;
        }

        function getString(note) {
            return getQuaver(note).strings[note.string];
        }

        function getStrings(part, bar, crotchet, quaver) {
            let strings = [];
            let frets = part.getFrets({
                bar: bar,
                crotchet: crotchet,
                quaver: quaver
            }) || {};
            for (let i = 0; i < part.instrument.strings.length; i++) {
                strings.push({ index: i, fret: frets[i] });
            }
            return strings;
        }

        function moveSelectedNote(offset) {
            if (!model.selectedNote) {
                return;
            }

            let note = copyNote(model.selectedNote);
            tuneService.model.part.offsetNote(note, offset);
            selectNote(note);
        }

        function selectNote(note) {
            cancelSelectedNote();

            model.selectedNote = copyNote(note);

            if (!note) {
                return false;
            }

            getString(note).active = true;

            if (!audioService.model.playing) {
                audioService.actions.setPlayPosition(note);
            }

            return true;
        }

        function setFret(fret) {
            if (!model.selectedNote) {
                return;
            }

            if (fret === undefined || isNaN(fret) === true) {
                fret = null;
            }

            let note = copyNote(model.selectedNote);
            note.fret = fret;
            model.selectedNote.fret = fret;
            return setNote(note);
        }

        function setNote(note) {
            if (!tuneService.actions.setNote(note)) {
                return false;
            }
            getString(note).fret = note.fret;
            return true;
        }
    }
})();