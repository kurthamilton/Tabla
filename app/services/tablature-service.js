(function() {
    'use strict';

    define(['services/audio-service', 'services/tune-service'], TablatureService);

    function TablatureService(audioService, tuneService) {
        let model = {
            bars: null,
            copiedRange: null,
            get part() {
                return tuneService.model.part;
            },
            playPosition: null,
            ready: false,
            selectedNote: null,
            selectedRangeNoteOffset: null,
            get tune() {
                return tuneService.model.tune;
            }
        };

        audioService.addEventListener('play-position.changed', onPlayPositionChanged);
        tuneService.addEventListener('part.selected', onPartSelected);

        return {
            actions: {
                copySelectedRange: copySelectedRange,
                deleteSelectedRange: deleteSelectedRange,
                emptyClipboard: emptyClipboard,
                moveSelectedNote: moveSelectedNote,
                moveSelectedRangeNoteOffset: moveSelectedRangeNoteOffset,
                pasteCopiedRange: pasteCopiedRange,
                selectNote: selectNote,
                selectRangeNoteOffset: selectRangeNoteOffset,
                setFret: (fret) => setFret(model.selectedNote, fret)
            },
            model: model
        };

        function onPartSelected(part) {
            model.ready = false;

            if (model.selectedNote && model.selectedNote.string >= part.instrument.strings.length) {
                model.selectedNote.string = part.instrument.strings.length - 1;
            }

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

            string.selected = false;

            cancelSelectedRange();
        }

        function cancelSelectedRange() {
            let existing = getSelectedRange();
            if (!existing) {
                return;
            }

            existing.forEach(note => {
                let string = getString(note);
                string.inRange = false;
            });

            model.selectedRangeNoteOffset = null;
        }

        function cloneNote(options) {
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

        function copySelectedRange() {
            emptyClipboard();

            let range = getSelectedRange();
            if (!range) {
                return;
            }

            model.copiedRange = range;

            range.forEach(note => getString(note).copied = true);
        }

        function deleteSelectedRange() {
            let range = getSelectedRange();
            if (!range) {
                return;
            }

            range.forEach(note => setFret(note, null));
        }

        function emptyClipboard() {
            let range = model.copiedRange;
            if (!range) {
                return;
            }

            range.forEach(note => getString(note).copied = false);
            model.copiedRange = null;
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
                    strings: getStrings(part, {
                        bar: bar,
                        crotchet: crotchet,
                        quaver: i
                    })
                });
            }
            return quavers;
        }

        function getSelectedRange() {
            if (!model.selectedNote) {
                return null;
            }

            let range = [];

            if (!model.selectedRangeNoteOffset) {
                range.push(model.selectedNote);
                return range;
            }

            let minString = Math.min(model.selectedNote.string, model.selectedRangeNoteOffset.string);
            let maxString = Math.max(model.selectedNote.string, model.selectedRangeNoteOffset.string);

            // compare the selected note position and the selected range note offset position
            let compare = model.tune.positionCompare(model.selectedNote, model.selectedRangeNoteOffset);
            // set the start note to whichever note comes before the other
            let start = compare < 0 ? model.selectedNote : model.selectedRangeNoteOffset;
            // set the end note to whichever note comes after the other
            let end = compare < 0 ? model.selectedRangeNoteOffset : model.selectedNote;

            // set the start position
            let position = cloneNote(start);

            // advance the start position until it is after the end position
            while (model.tune.positionCompare(position, end) <= 0) {
                // move through the strings in the current position
                for (let string = minString; string <= maxString; string++) {
                    position.string = string;
                    position.fret = getString(position).fret;
                    range.push(cloneNote(position));
                }
                // advance the position by 1 quaver
                model.tune.offsetPosition(position, { quaver: 1 }, false);
            }

            return range;
        }

        function getString(note) {
            return getQuaver(note).strings[note.string];
        }

        function getStrings(part, position) {
            let strings = [];
            let frets = part.getFrets(position) || {};
            for (let i = 0; i < part.instrument.strings.length; i++) {
                let string = { index: i, fret: frets[i] };
                if (model.selectedNote && model.tune.positionCompare(model.selectedNote, position) === 0 && model.selectedNote.string === i) {
                    string.selected = true;
                }
                strings.push(string);
            }
            return strings;
        }

        function moveSelectedNote(offset) {
            if (!model.selectedNote) {
                return;
            }

            let note = cloneNote(model.selectedNote);
            model.part.offsetNote(note, offset);
            selectNote(note);
        }

        function moveSelectedRangeNoteOffset(offset) {
            if (!model.selectedRangeNoteOffset) {
                model.selectedRangeNoteOffset = cloneNote(model.selectedNote);
            }

            let note = cloneNote(model.selectedRangeNoteOffset);
            model.part.offsetNote(note, offset);
            selectRangeNoteOffset(note);
        }

        function pasteCopiedRange() {
            if (!model.copiedRange) {
                return;
            }

            let offsetNote = cloneNote(model.selectedNote);
            let prev = model.copiedRange[0];
            model.copiedRange.forEach((note, i) => {
                let offset = model.part.getOffset(prev, note);
                model.part.offsetNote(offsetNote, offset);
                setFret(offsetNote, note.fret);
                prev = note;
            });
        }

        function selectNote(note) {
            cancelSelectedNote();

            model.selectedNote = cloneNote(note);

            if (!note) {
                return false;
            }

            getString(note).selected = true;

            if (!audioService.model.playing) {
                audioService.actions.setPlayPosition(note);
            }

            return true;
        }

        function selectRangeNoteOffset(note) {
            cancelSelectedRange();

            model.selectedRangeNoteOffset = note;
            let range = getSelectedRange();
            range.forEach(note => getString(note).inRange = true);
        }

        function setFret(note, fret) {
            if (!note) {
                return;
            }

            if (fret === undefined || isNaN(fret) === true) {
                fret = null;
            }

            note = cloneNote(note);
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