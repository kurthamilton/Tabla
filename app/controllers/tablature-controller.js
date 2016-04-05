(function(rivets) {
    'use strict';

    define(['utils.dom', 'utils', 'models/note', 'services/audio-service', 'services/tablature-service', 'services/tune-service'], TablatureController);

    function TablatureController(domUtils, utils, Note, audioService, tablatureService, tuneService) {
        let scope = {
            model: tablatureService.model,
            tuneModel: tuneService.model
        };

        let shiftPressed = false;
        let mousePressed = false;
        let viewBinding = null;

        tuneService.addEventListener('part.selected', onPartSelected);

        return {
            load: function() {
                bindEvents();
            }
        };

        function bind() {
            let view = document.getElementById('tablature');
            let binding = rivets.bind(view, scope);
            view.classList.remove('binding');
            return binding;
        }

        function bindEvents() {
            bindClick();
            bindKeys();
        }

        function bindClick() {
            document.addEventListener('mousedown', function(e) {
                // Left mouse button. Not IE friendly
                if (e.which === 1) {
                    mousePressed = true;

                    if (shiftPressed === true) {
                        selectRangeOffset(e.target);
                        e.preventDefault();
                    } else {
                        selectString(e.target);
                    }
                }
            });
            document.addEventListener('mouseover', function(e) {
                if (mousePressed === true && tablatureService.model.selectedNote) {
                    selectRangeOffset(e.target);
                }
            });
            document.addEventListener('mouseup', function(e) {
                // Left mouse button. Not IE friendly
                if (e.which === 1) {
                    mousePressed = false;
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
                    let active = selectedNote.active;
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
                if (e.keyCode === 27) {
                    // escape
                    tablatureService.actions.emptyClipboard();
                }

                let selectedNote = tablatureService.model.selectedNote;
                if (!selectedNote) {
                    return;
                }

                if (e.shiftKey) {
                    shiftPressed = true;
                }

                if (e.keyCode === 46) {
                    // delete
                    tablatureService.actions.deleteSelectedRange();
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
                    moveSelectedNoteHorizontally(offset, shiftPressed);
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
                    moveSelectedNoteHorizontally(offset, shiftPressed);
                    e.preventDefault();
                } else if (e.keyCode === 40) {
                    // down arrow - move all the way to down if ctrl
                    moveSelectedNoteVertically(e.ctrlKey === true ? 2 : 1);
                    e.preventDefault();
                } else if (e.keyCode === 9) {
                    // tab forwards and backwards
                    moveSelectedNoteHorizontally({ crotchet: shiftPressed === true ? -1 : 1 });
                    e.preventDefault();
                } else if (e.keyCode === 36) {
                    // home
                    moveSelectedNoteHorizontally({
                        bar: -1 * selectedNote.bar,
                        crotchet: -1 * selectedNote.crotchet,
                        quaver: -1 * selectedNote.quaver
                    }, shiftPressed);
                    e.preventDefault();
                } else if (e.keyCode === 67) {
                    // c
                    if (e.ctrlKey) {
                        tablatureService.actions.copySelectedRange();
                    }
                } else if (e.keyCode === 86) {
                    // v
                    if (e.ctrlKey) {
                        tablatureService.actions.pasteCopiedRange();
                    }
                } else if (e.keyCode === 72) {
                    // h
                    tablatureService.actions.toggleEffect('hammeron');
                } else if (e.keyCode === 80) {
                    // p
                    tablatureService.actions.toggleEffect('pulloff');
                } else if (e.keyCode === 220) {
                    // \
                    tablatureService.actions.toggleEffect('slidedown');
                } else if (e.keyCode === 191) {
                    // /
                    tablatureService.actions.toggleEffect('slideup');
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

        function moveSelectedNoteHorizontally(offset, range) {
            if (range === true) {
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
                let string = ((shiftPressed === true && tablatureService.model.selectedRangeNoteOffset) ? tablatureService.model.selectedRangeNoteOffset.string : tablatureService.model.selectedNote.string);
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

        function isString(target) {
            if (!target) {
                return false;
            }
            if (domUtils.hasClass(target, 'string') || domUtils.hasClass(target.parentNode, 'string')) {
                return true;
            }
            return false;
        }

        function selectRangeOffset(target) {
            if (!isString(target)) {
                return;
            }

            let note = getNote(target);
            tablatureService.actions.selectRangeNoteOffset(note);
        }

        function selectString(target) {
            if (!isString(target)) {
                target = null;
            }

            let note = getNote(target);
            tablatureService.actions.selectNote(note);
        }
    }
})(rivets);