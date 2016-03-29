(function(rivets) {
    'use strict';

    define(['utils.dom', 'utils', 'models/note', 'services/audio-service', 'services/tablature-service', 'services/tune-service'], TablatureController);

    function TablatureController(domUtils, utils, Note, audioService, tablatureService, tuneService) {
        let scope = {
            model: tablatureService.model
        };

        let shiftPressed = false;
        let viewBinding = null;

        tuneService.addEventListener('part.selected', onPartSelected);

        return {
            load: function() {
                bindEvents();
            }
        };

        function bind() {
            let view = document.getElementById('tablature');
            return rivets.bind(view, scope);
        }

        function bindEvents() {
            bindClick();
            bindKeys();
        }

        function bindClick() {
            document.addEventListener('click', function(e) {
                if (shiftPressed === true) {
                    selectRangeOffset(e.target);
                    e.preventDefault();
                } else {
                    selectString(e.target);
                }
            });
        }

        function bindKeys() {
            document.addEventListener('keypress', function(e) {
                let selectedNote = tablatureService.model.selectedNote;
                if (!selectedNote || shiftPressed === true) {
                    return;
                }

                // 0 - 9
                if (e.charCode >= 48 && e.charCode <= 57) {
                    // The typed number
                    let number = e.charCode - 48;
                    let active = selectedNote.selected;
                    // Append the typed number to the current content if it is active, else set the typed number
                    let fret = parseInt(`${active && selectedNote.fret ? selectedNote.fret : ''}${number}`);
                    if (!setFret(fret)) {
                        // Set the fret to the current number if not successful.
                        setFret(number);
                    }

                    // Manage active timer. Clear current timer and set a new one
                    if (active) {
                        // clear current active timer
                        clearTimeout(active);
                    }
                    selectedNote.active = setTimeout(function() {
                        clearTimeout(selectedNote.active);
                    }, 2000);
                }
            });

            document.addEventListener('keydown', function(e) {
                let selectedNote = tablatureService.model.selectedNote;
                if (!selectedNote) {
                    return;
                }

                if (e.shiftKey) {
                    shiftPressed = true;
                }

                if (e.keyCode === 46) {
                    // delete
                    setFret(null);
                }
                else if (e.keyCode === 8) {
                    // backspace
                    let existing = selectedNote.fret;
                    if (existing !== null) {
                        existing = existing.toString();
                        let fret = parseInt(existing.substring(0, existing.length - 1));
                        setFret(fret);
                    }
                    e.preventDefault();
                }
                else if (e.keyCode === 37) {
                    // left arrow
                    let offset = {};
                    offset[e.ctrlKey === true ? 'bar' : 'quaver'] = -1;
                    moveSelectedNoteHorizontally(offset);
                    e.preventDefault();
                }
                else if (e.keyCode === 38) {
                    // up arrow - move all the way to top if ctrl
                    moveSelectedNoteVertically(e.ctrlKey === true ? -2 : -1);
                    e.preventDefault();
                } else if (e.keyCode === 39) {
                    // right arrow
                    let offset = {};
                    offset[e.ctrlKey === true ? 'bar' : 'quaver'] = 1;
                    moveSelectedNoteHorizontally(offset);
                    e.preventDefault();
                } else if (e.keyCode === 40) {
                    // down arrow - move all the way to down if ctrl
                    moveSelectedNoteVertically(e.ctrlKey === true ? 2 : 1);
                    e.preventDefault();
                } else if (e.keyCode === 9) {
                    // tab forwards and backwards
                    moveSelectedNoteHorizontally({ crotchet: shiftPressed === true ? -1 : 1 });
                    e.preventDefault();
                }
            });

            document.addEventListener('keyup', function(e) {
                let selectedNote = tablatureService.model.selectedNote;
                if (!selectedNote) {
                    return;
                }

                if (!e.shiftKey) {
                    shiftPressed = false;
                }
            });
        }

        function moveSelectedNoteHorizontally(offset) {
            if (shiftPressed === true && offset.quaver) {
                tablatureService.actions.moveSelectedRangeNoteOffset(offset);
            } else {
                tablatureService.actions.moveSelectedNote(offset);
            }
        }

        function moveSelectedNoteVertically(amount) {
            let offset = {};
            if (Math.abs(amount) === 1) {
                offset.string = amount;
            } else {
                let string = tablatureService.model.selectedNote.string;
                offset.string = amount < 0 ? -1 * string : tuneService.model.part.instrument.strings.length - string;
            }

            if (shiftPressed === true) {
                tablatureService.actions.moveSelectedRangeNoteOffset(offset);
            } else {
                tablatureService.actions.moveSelectedNote(offset);
            }
        }

        function onPartSelected() {
            if (!viewBinding) {
                viewBinding = bind();
            }
        }

        function setFret(fret) {
            return tablatureService.actions.setFret(fret);
        }

        // dom functions
        function getNote(target) {
            if (!target) {
                return null;
            }

            let stringElement = domUtils.closestClass(target, 'string');
            let quaverElement = domUtils.closestClass(stringElement, 'quaver');
            let crotchetElement = domUtils.closestClass(quaverElement, 'crotchet');
            let barElement = domUtils.closestClass(crotchetElement, 'bar');
            let fret = parseInt(stringElement.textContent);
            if (isNaN(fret)) {
                fret = null;
            }

            return new Note({
                bar: domUtils.indexInParent(barElement, 'bar'),
                crotchet: domUtils.indexInParent(crotchetElement, 'crotchet'),
                fret: fret,
                quaver: domUtils.indexInParent(quaverElement, 'quaver'),
                string: domUtils.indexInParent(stringElement, 'string')
            });
        }

        function selectRangeOffset(target) {
            if (!target || !domUtils.hasClass(target, 'string')) {
                return;
            }

            let note = getNote(target);
            tablatureService.actions.selectRangeNoteOffset(note);
        }

        function selectString(target) {
            if (!target || !domUtils.hasClass(target, 'string')) {
                target = null;
            }

            let note = getNote(target);
            tablatureService.actions.selectNote(note);
        }
    }
})(rivets);