(function() {
    'use strict';

    define(['services/tune-service'], TablatureService);

    function TablatureService(tuneService) {
        const orientations = {
            horizontal: 1,
            vertical: 2
        };

        let model = {
            activeNote: null,
            bars: null,
            ready: false
        };

        tuneService.addEventListener('part.selected', onPartSelected);

        return {
            actions: {
                moveSelectedNote: moveSelectedNote,
                selectNote: selectNote,
                setNote: setNote
            },
            model: model,
            orientations: orientations
        };

        function onPartSelected(part) {
            model.ready = false;

            model.bars = getBars(part);
            model.ready = model.bars.length > 0;
        }

        // model methods
        function cancelSelectedNote() {
            if (!model.activeNote) {
                return;
            }

            let string = getString(model.activeNote);
            if (!string) {
                return;
            }

            string.active = false;
        }

        function getBars(part) {
            let bars = [];

            if (!part) {
                return bars;
            }

            for (let i = 0; i < part.tune.bars; i++) {
                bars.push({
                    crotchets: getCrotchets(part, i),
                    index: i
                });
            }
            return bars;
        }

        function getCrotchets(part, bar) {
            let crotchets = [];
            for (let i = 0; i < part.tune.beatsPerBar; i++) {
                crotchets.push({
                    index: i,
                    quavers: getQuavers(part, bar, i, 4)
                });

            }
            return crotchets;
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
            return model.bars[note.bar].crotchets[note.crotchet].quavers[note.quaver].strings[note.string];
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

        function moveSelectedNote(orientation, direction) {
            if (!model.activeNote) {
                return;
            }

            let note = model.activeNote;

            cancelSelectedNote();

            if (orientation === orientations.vertical) {
                if (Math.abs(direction) === 1) {
                    note.string += direction;
                }
                if (Math.abs(direction) > 1 || note.string < 0 || note.string >= tuneService.model.part.instrument.strings.length) {
                    note.string = direction < 0 ? 0 : tuneService.model.part.instrument.strings.length - 1;
                }
            } else if (orientation === orientations.horizontal) {
                if (Math.abs(direction) === 1) {
                    note.quaver += direction;
                } else if (Math.abs(direction) === 2) {
                    note.bar += (direction > 0 ? 1 : -1);
                }

                if (note.quaver < 0) {
                    note.crotchet--;
                    note.quaver = 3;
                } else if (note.quaver > 3) {
                    note.crotchet++;
                    note.quaver = 0;
                }
                if (note.crotchet < 0) {
                    note.bar--;
                    note.crotchet = tuneService.model.tune.beatsPerBar - 1;
                } else if (note.crotchet >= tuneService.model.tune.beatsPerBar) {
                    note.bar++;
                    note.crotchet = 0;
                }
                if (note.bar < 0) {
                    note.bar = tuneService.model.tune.bars - 1;
                } else if (note.bar >= tuneService.model.tune.bars) {
                    note.bar = 0;
                }
            }

            selectNote(note);
        }

        function selectNote(note) {
            cancelSelectedNote();

            model.activeNote = note;

            if (!note) {
                return false;
            }

            getString(note).active = true;
            return true;
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