(function(rivets) {
    'use strict';

    define(['utils.dom', 'utils', 'models/note', 'services/audio-service', 'services/tablature-service', 'services/tune-service'], TablatureController);

    function TablatureController(domUtils, utils, Note, audioService, tablatureService, tuneService) {
        let scope = {
            model: tablatureService.model,
            part: null,
            playPosition: null,
            selectedNoteElement: null,
            selectedNote: null
        };

        tuneService.addEventListener('part.selected', onPartSelected);
        audioService.addEventListener('reset', resetPlayPosition);
        audioService.addEventListener('increment', incrementPlayPosition);

        return {
            load: function() {
                bindEvents();
            }
        };

        function bind() {
            let view = document.getElementById('tablature');
            rivets.bind(view, scope);
        }

        function bindEvents() {
            bindClick();
            bindKeys();
        }

        function bindClick() {
            document.addEventListener('click', function(e) {
                if (!selectString(e.target)) {
                    cancelStringSelect();
                }
            });
        }

        function bindKeys() {
            document.addEventListener('keypress', function(e) {
                if (!scope.selectedNoteElement || e.shiftKey === true) {
                    return;
                }

                // 0 - 9
                if (e.keyCode >= 48 && e.keyCode <= 57) {
                    // The typed number
                    let number = e.keyCode - 48;

                    // Append the typed number to the current content if it is active, else set the typed number
                    let fret = parseInt(`${domUtils.isActive(scope.selectedNoteElement) ? scope.selectedNoteElement.textContent : ''}${number}`);
                    if (!setFret(fret)) {
                        // Set the fret to the current number if not successful.
                        setFret(number);
                    }

                    // Set a timer on the note element to flag it as active
                    domUtils.setActive(scope.selectedNoteElement);
                }
            });

            document.addEventListener('keydown', function(e) {
                if (!scope.selectedNoteElement) {
                    return;
                }

                if (e.keyCode === 46) {
                    // delete
                    setFret(null);
                }
                else if (e.keyCode === 8) {
                    // backspace
                    let existing = scope.selectedNoteElement.textContent;
                    if (isNaN(parseInt(existing)) === false) {
                        let fret = parseInt(existing.substring(0, existing.length - 1));
                        setFret(fret);
                    }
                    e.preventDefault();
                }
                else if (e.keyCode === 37) {
                    // left arrow
                    moveHorizontally(-1);
                }
                else if (e.keyCode === 38) {
                    // up arrow - move all the way to top if ctrl
                    moveVertically(e.ctrlKey === true ? -2 : -1);
                    e.preventDefault();
                }
                else if (e.keyCode === 40) {
                    // down arrow - move all the way to down if ctrl
                    moveVertically(e.ctrlKey === true ? 2 : 1);
                    e.preventDefault();
                }
                else if (e.keyCode === 39) {
                    // right arrow
                    moveHorizontally(1);
                } else if (e.keyCode === 9) {
                    // tab forwards and backwards through crotchets
                    moveHorizontally(e.shiftKey === true ? -2 : 2);
                    e.preventDefault();
                }

                //console.log(e.keyCode);
            });
        }

        function onPartSelected(part) {
            scope.part = part;
            bind();
        }

        // dom functions
        function incrementPlayPosition() {
            if (scope.playPosition) {
                scope.playPosition.classList.remove('play-position');
                scope.playPosition = getSiblingQuaver(scope.playPosition, 1);
            }

            if (!scope.playPosition) {
                scope.playPosition = document.querySelector('.quaver');
            }

            scope.playPosition.classList.add('play-position');
        }

        function resetPlayPosition() {
            if (scope.playPosition) {
                scope.playPosition.classList.remove('play-position');
            }
            scope.playPosition = null;
        }

        function moveVertically(direction) {
            let target = null;
            if (Math.abs(direction) === 1) {
                // move by 1 string if direction is 1 or -1
                target = domUtils.sibling(scope.selectedNoteElement, direction, 'string');
            } else if (Math.abs(direction) === 2) {
                // move to top string if direction is -2, else to bottom string
                let strings = scope.selectedNoteElement.parentElement.querySelectorAll('.string');
                target = strings[direction === -2 ? 0 : strings.length - 1];
            }

            selectString(target);
        }

        function moveHorizontally(direction) {
            // todo: enum for direction
            let sibling = null;
            if (Math.abs(direction) === 1) {
                // move by 1 quaver if direction is 1 or -1
                sibling = getSiblingQuaver(scope.selectedNoteElement, direction);
            } else if (Math.abs(direction) === 2) {
                // move by 1 crotchet if direction is 2 or -2
                if (direction < 0 && scope.selectedNote.quaver > 0) {
                    // stay within same crotchet if tabbing backwards from an advanced position within a crotchet
                    sibling = domUtils.closestClass(scope.selectedNoteElement, 'crotchet');
                } else {
                    sibling = getSiblingCrotchet(scope.selectedNoteElement, direction);
                }
            }

            if (!sibling) {
                return;
            }

            let index = domUtils.indexInParent(scope.selectedNoteElement, 'string');
            let target = sibling.querySelectorAll('.string')[index];
            selectString(target);
        }

        function selectString(target) {
            if (!target || !domUtils.hasClass(target, 'string')) {
                return false;
            }

            cancelStringSelect();

            target.classList.add('selected');
            scope.selectedNoteElement = target;
            scope.selectedNote = getNote(target);

            return true;
        }

        function getNote(target) {
            let stringElement = domUtils.closestClass(target, 'string');
            let quaverElement = domUtils.closestClass(stringElement, 'quaver');
            let crotchetElement = domUtils.closestClass(quaverElement, 'crotchet');
            let barElement = domUtils.closestClass(crotchetElement, 'bar');

            return new Note({
                bar: domUtils.indexInParent(barElement, 'bar'),
                crotchet: domUtils.indexInParent(crotchetElement, 'crotchet'),
                fret: null,
                quaver: domUtils.indexInParent(quaverElement, 'quaver'),
                string: domUtils.indexInParent(stringElement, 'string')
            });
        }

        function cancelStringSelect() {
            if (!scope.selectedNoteElement) {
                return;
            }

            scope.selectedNoteElement.classList.remove('selected');
            scope.selectedNoteElement = null;
            scope.selectedNote = null;
        }

        function save() {
            utils.async(() => tuneService.actions.save());
        }

        function setFret(fret) {
            let n = scope.selectedNote;
            let modelNote = scope.model.bars[n.bar].crotchets[n.crotchet].quavers[n.quaver].strings[n.string];

            if (fret === null || isNaN(fret) === true) {
                scope.selectedNoteElement.innerHTML = '&nbsp;';
                scope.selectedNote.fret = null;
                scope.part.deleteNote(scope.selectedNote);
                modelNote.fret = null;
                save();
                return true;
            }

            // todo: configurable bounds
            if (fret >= 0 && fret <= 24) {
                scope.selectedNoteElement.innerHTML = fret;
                scope.selectedNote.fret = fret;
                scope.part.addNote(scope.selectedNote);
                modelNote.fret = fret;
                save();
                return true;
            }
            return false;
        }

        function getSiblingQuaver(element, direction) {
            let quaver = domUtils.sibling(element, direction, 'quaver', 'crotchet');
            if (quaver) {
                return quaver;
            }
            return domUtils.sibling(element, direction, 'quaver', 'bar');
        }

        function getSiblingCrotchet(element, direction) {
            return domUtils.sibling(element, direction, 'crotchet', 'bar');
        }
    }
})(rivets);