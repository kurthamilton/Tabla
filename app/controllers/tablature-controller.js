(function(rivets) {
    'use strict';

    define(['utils.dom', 'services/tablature-service', 'models/note'], TablatureController);

    function TablatureController(domUtils, tablatureService, Note) {
        let scope = {
            model: tablatureService.model,
            save: tablatureService.save,
            selected: null,
            selectedNote: null
        };

        return {
            load: function() {
                render();
                bindEvents();
            }
        };

        function render() {
            let view = document.getElementById('tablature');
            rivets.bind(view, scope.model);
        }

        function bindEvents() {
            bindClick();
            bindKeys();
        }

        function bindClick() {
            document.addEventListener('click', function(e) {
                let target = e.target;
                if (!domUtils.hasClass(target, 'string')) {
                    target = null;
                }

                selectString(target);
            });
        }

        function bindKeys() {
            document.addEventListener('keypress', function(e) {
                if (!scope.selected || e.shiftKey === true) {
                    return;
                }

                // 0 - 9
                if (e.keyCode >= 48 && e.keyCode <= 57) {
                    // Append the typed number to the current content. Set the fret to the current number if not successful.
                    let keyNumber = e.keyCode - 48;
                    let fret = parseInt(`${scope.selected.textContent}${keyNumber}`);
                    if (!setFret(fret)) {
                        setFret(keyNumber);
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
                    // up arrow
                    moveVertically(-1);
                }
                else if (e.keyCode === 40) {
                    // down arrow
                    moveVertically(1);
                }
                else if (e.keyCode === 39) {
                    // right arrow
                    moveHorizontally(1);
                } else if (e.keyCode === 9) {
                    // tab forwards and backwards through crotchets
                    // todo: crotchets
                    if (e.shiftKey === true) {
                        moveHorizontally(-1);
                    } else {
                        moveHorizontally(1);
                    }
                    e.preventDefault();
                }

                console.log(e.keyCode);
            });
        }

        // dom functions
        function moveVertically(direction) {
            let target = null;
            if (direction > 0) {
                target = scope.selected.nextSibling;
            } else {
                target = scope.selected.previousSibling;
            }

            moveToString(target);
        }

        function moveHorizontally(direction) {
            let siblingQuaver = getSiblingQuaver(scope.selected, direction);
            if (!siblingQuaver) {
                return;
            }
            let index = domUtils.indexInParent(scope.selected, 'string');
            let target = siblingQuaver.querySelector(`.string:nth-child(${index + 1})`);
            moveToString(target);
        }

        function moveToString(target) {
            if (!domUtils.hasClass(target, 'string')) {
                return;
            }

            selectString(target);
        }

        function selectString(target) {
            cancelStringSelect();

            if (!target) {
                scope.selectedNote = null;
                return;
            }

            target.classList.add('selected');
            scope.selected = target;
            scope.selectedNote = getNote(target);
        }

        function getNote(target) {
            let stringElement = domUtils.closestClass(target, 'string');
            let quaverElement = domUtils.closestClass(target, 'quaver');
            let barElement = domUtils.closestClass(quaverElement, 'bar');

            return new Note({
                bar: domUtils.indexInParent(barElement, 'bar'),
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

        function setFret(fret) {
            if (fret === null || isNaN(fret) === true) {
                scope.selected.innerHTML = '&nbsp;';
                scope.selectedNote.fret = null;
                scope.model.tune.addNote(scope.selectedNote);
                scope.save();
                return true;
            }

            // todo: configurable bounds
            if (fret >= 0 && fret <= 24) {
                scope.selected.innerHTML = fret;
                scope.selectedNote.fret = fret;
                scope.model.tune.addNote(scope.selectedNote);
                scope.save();
                return true;
            }
            return false;
        }

        function getSiblingQuaver(element, direction) {
            let quaver = domUtils.closestClass(element, 'quaver');
            if (direction > 0) {
                quaver = quaver.nextSibling;
            } else {
                quaver = quaver.previousSibling;
            }

            if (domUtils.hasClass(quaver, 'quaver')) {
                return quaver;
            }

            let bar = getSiblingBar(element, direction);
            if (!bar) {
                return null;
            }

            if (direction > 0) {
                return bar.querySelector('.quaver:first-child');
            } else {
                return bar.querySelector('.quaver:last-child');
            }
        }

        function getSiblingBar(element, direction) {
            let bar = domUtils.closestClass(element, 'bar');
            if (direction > 0) {
                bar = bar.nextSibling;
            } else {
                bar = bar.previousSibling;
            }

            if (domUtils.hasClass(bar, 'bar')) {
                return bar;
            }

            return null;
        }
    }
})(rivets);