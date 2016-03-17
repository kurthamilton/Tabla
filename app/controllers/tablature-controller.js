(function(rivets) {
    'use strict';

    define(['utils.dom', 'models/note', 'services/play-service', 'services/tablature-service', 'services/tune-service'], TablatureController);

    function TablatureController(domUtils, Note, playService, tablatureService, tuneService) {
        let scope = {
            get activeTune() {
                return tuneService.model.active.tune
            },
            model: tablatureService.model,
            playPosition: null,
            selected: null,
            selectedNote: null
        };

        playService.addEventListener('reset', resetPlayPosition);
        playService.addEventListener('increment', incrementPlayPosition);

        return {
            load: function() {
                bind();
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
                if (!scope.selected || e.shiftKey === true) {
                    return;
                }

                // 0 - 9
                if (e.keyCode >= 48 && e.keyCode <= 57) {
                    // Append the typed number to the current content
                    let number = e.keyCode - 48;
                    let fret = parseInt(`${scope.selected.textContent}${number}`);
                    if (!setFret(fret)) {
                        // Set the fret to the current number if not successful.
                        setFret(number);
                    }
                }
            });

            document.addEventListener('keydown', function(e) {
                if (!scope.selected) {
                    return;
                }

                if (e.keyCode === 46) {
                    // delete
                    setFret(null);
                }
                else if (e.keyCode === 8) {
                    // backspace
                    if (isNaN(parseInt(scope.selected.textContent)) === false) {
                        let fret = parseInt(scope.selected.textContent.substring(0, scope.selected.textContent.length - 1));
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
                }
                else if (e.keyCode === 40) {
                    // down arrow - move all the way to down if ctrl
                    moveVertically(e.ctrlKey === true ? 2 : 1);
                }
                else if (e.keyCode === 39) {
                    // right arrow
                    moveHorizontally(1);
                } else if (e.keyCode === 9) {
                    // tab forwards and backwards through crotchets
                    moveHorizontally(e.shiftKey === true ? -2 : 2);
                    e.preventDefault();
                }

                console.log(e.keyCode);
            });
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
                target = domUtils.sibling(scope.selected, direction, 'string');
            } else if (Math.abs(direction) === 2) {
                // move to top string if direction is -2, else to bottom string
                let strings = scope.selected.parentElement.querySelectorAll('.string');
                target = strings[direction === -2 ? 0 : strings.length - 1];
            }

            selectString(target);
        }

        function moveHorizontally(direction) {
            // todo: enum for direction
            let sibling = null;
            if (Math.abs(direction) === 1) {
                // move by 1 quaver if direction is 1 or -1
                sibling = getSiblingQuaver(scope.selected, direction);
            } else if (Math.abs(direction) === 2) {
                // move by 1 crotchet if direction is 2 or -2
                if (direction < 0 && scope.selectedNote.quaver > 0) {
                    // stay within same crotchet if tabbing backwards from an advanced position within a crotchet
                    sibling = domUtils.closestClass(scope.selected, 'crotchet');
                } else {
                    sibling = getSiblingCrotchet(scope.selected, direction);
                }
            }

            if (!sibling) {
                return;
            }

            let index = domUtils.indexInParent(scope.selected, 'string');
            let target = sibling.querySelectorAll('.string')[index];
            selectString(target);
        }

        function selectString(target) {
            if (!target || !domUtils.hasClass(target, 'string')) {
                return false;
            }

            cancelStringSelect();

            target.classList.add('selected');
            scope.selected = target;
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
            if (!scope.selected) {
                return;
            }

            scope.selected.classList.remove('selected');
            scope.selected = null;
            scope.selectedNote = null;
        }

        function save() {
            tuneService.actions.save();
        }

        function setFret(fret) {
            if (fret === null || isNaN(fret) === true) {
                scope.selected.innerHTML = '&nbsp;';
                scope.selectedNote.fret = null;
                scope.activeTune.deleteNote(scope.selectedNote);
                save();
                return true;
            }

            // todo: configurable bounds
            if (fret >= 0 && fret <= 24) {
                scope.selected.innerHTML = fret;
                scope.selectedNote.fret = fret;
                scope.activeTune.addNote(scope.selectedNote);
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