(function() {
    'use strict';

    define(['services/audio-service', 'services/event-service', 'services/tune-service'], TablatureService);

    function TablatureService(audioService, eventService, tuneService) {
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
        tuneService.addEventListener('tune.bars.updated', onBarsUpdated);
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
                setFret: (fret) => setFretWithUndo(model.selectedNote, fret),
                toggleEffect: (effect) => toggleEffect(model.selectedNote, effect)
            },
            model: model
        };

        function onBarsUpdated() {
            model.bars = getBars(model.part);
        }

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

            existing.notes.forEach(note => {
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

            model.copiedRange = range.notes;

            range.notes.forEach(note => {
                let string = getString(note);
                string.copied.top = note.string === range.from.string;
                string.copied.bottom = note.string === range.to.string;
                string.copied.left = model.tune.positionCompare(note, range.from) === 0;
                string.copied.right = model.tune.positionCompare(note, range.to) === 0;
            });
        }

        function deleteRange(range) {
            if (!range) {
                return;
            }
            range.notes.forEach(note => setFret(note, null));
        }

        function deleteSelectedRange() {
            let range = getSelectedRange();
            if (!range) {
                return;
            }

            let undo = () => range.notes.forEach(note => setFret(note, note.fret));
            let redo = () => deleteRange(range);
            eventService.performAction(redo, undo);

            deleteRange(range);
        }

        function emptyClipboard() {
            if (!model.copiedRange) {
                return;
            }

            model.copiedRange.forEach(note => {
                let string = getString(note);
                string.copied.top = false;
                string.copied.bottom = false;
                string.copied.left = false;
                string.copied.right = false;
            });
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

        function getRange(startNote, endNote) {
            if (!startNote || !endNote) {
                return null;
            }

            let minString = Math.min(startNote.string, endNote.string);
            let maxString = Math.max(startNote.string, endNote.string);

            // compare the start and end positions
            let compare = model.tune.positionCompare(startNote, endNote);
            if (compare === 0 && startNote.string !== endNote.string) {
                compare = startNote.string < endNote.string ? -1 : 1;
            }

            let range = {
                from: cloneNote(compare < 0 ? startNote : endNote),
                to: cloneNote(compare < 0 ? endNote : startNote),
                notes: []
            };

            // set the start position
            let position = cloneNote(range.from);

            // advance the start position until it is after the end position
            while (model.tune.positionCompare(position, range.to) <= 0) {
                // move through the strings in the current position
                for (let string = minString; string <= maxString; string++) {
                    position.string = string;
                    position.fret = getString(position).fret;
                    range.notes.push(cloneNote(position));
                }
                // advance the position by 1 quaver
                model.tune.offsetPosition(position, { quaver: 1 }, true);
            }

            return range;
        }

        function getSelectedRange() {
            if (!model.selectedNote) {
                return null;
            }

            return getRange(model.selectedNote, model.selectedRangeNoteOffset || model.selectedNote);
        }

        function getString(note) {
            return getQuaver(note).strings[note.string];
        }

        function getStrings(part, position) {
            let strings = [];
            let notes = part.getNotes(position) || {};
            for (let i = 0; i < part.instrument.strings.length; i++) {
                let note = notes[i];

                let string = {
                    index: i,
                    copied: {
                        top: false,
                        bottom: false,
                        left: false,
                        right: false
                    },
                    effect: note ? note.effect : null,
                    fret: note ? note.fret : null
                };
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
            if (!model.copiedRange || !model.selectedNote) {
                return;
            }

            let copiedRange = model.copiedRange.slice();
            let note = cloneNote(model.selectedNote);

            let undo = () => {
                // todo
            };
            let redo = () => pasteRange(copiedRange, note);

            pasteRange(copiedRange, note);

            eventService.performAction(redo, undo);
        }

        function pasteRange(range, note) {
            if (!range || range.length === 0 || !note) {
                return;
            }

            let offsetNote = cloneNote(note);
            let prev = range[0];
            range.forEach(note => {
                let offset = model.part.getOffset(prev, note);
                model.part.offsetNote(offsetNote, offset, true);
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
            range.notes.forEach(note => getString(note).inRange = true);
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
            return setNote(note);
        }

        function setFretWithUndo(note, fret) {
            if (!note) {
                return;
            }

            let undo = () => setFret(note, note.fret);
            let redo = () => setFret(note, fret);

            let result = setFret(note, fret);
            if (result) {
                eventService.performAction(redo, undo);
            }
            return result;
        }

        function setNote(note) {
            if (!tuneService.actions.setNote(note)) {
                return false;
            }
            let string = getString(note);
            if (!string) {
                return false;
            }
            string.fret = note.fret;
            if (note.fret === null) {
                string.effect = '';
            }
            return true;
        }

        function toggleEffect(note, effect) {
            tuneService.actions.toggleEffect(note, effect);
            let string = getString(note);
            if (!string) {
                return;
            }

            string.effect = model.part.getNote(note).effect;
        }
    }
})();