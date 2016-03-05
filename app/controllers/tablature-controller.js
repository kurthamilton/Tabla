(function(rivets) {
    'use strict';

    define(() => new TablatureController());

    function TablatureController() {
        this.index = function() {
            let view = document.getElementById('tablature.index');
            let scope = new Scope();
            rivets.bind(view, scope);

            bindClick(scope);
            bindKeys(scope);
        };
    }

    function Scope() {
        this.model = {
            bars: getBars(20)
        };
    }

    // event handlers
    function bindClick(scope) {
        document.addEventListener('click', function(e) {
            cancelStringSelect(scope);

            let target = e.target;
            if (!hasClass(target, 'string')) {
                return;
            }

            selectString(scope, target);
        });
    }

    function bindKeys(scope) {
        document.addEventListener('keypress', function(e) {
            if (!scope.selected || e.shiftKey === true) {
                return;
            }

            // 0 - 9
            if (e.keyCode >= 48 && e.keyCode <= 57) {
                // Append the typed number to the current content. Set the fret to the current number if not successful.
                let keyNumber = e.keyCode - 48;
                let fret = parseInt(`${scope.selected.textContent}${keyNumber}`);
                if (!setFret(scope, fret)) {
                    setFret(scope, keyNumber);
                }
            }
        });

        document.addEventListener('keydown', function(e) {
            if (!scope.selected) {
                return;
            }

            if (e.keyCode === 46) {
                // delete
                setFret(scope, null);
            }
            else if (e.keyCode === 8) {
                // backspace
                if (isNaN(parseInt(scope.selected.textContent)) === false) {
                    let fret = parseInt(scope.selected.textContent.substring(0, scope.selected.textContent.length - 1));
                    setFret(scope, fret);
                }
                e.preventDefault();
            }
            else if (e.keyCode === 37) {
                // left arrow
                moveHorizontally(scope, -1);
            }
            else if (e.keyCode === 38) {
                // up arrow
                moveVertically(scope, -1);
            }
            else if (e.keyCode === 40) {
                // down arrow
                moveVertically(scope, 1);
            }
            else if (e.keyCode === 39) {
                // right arrow
                moveHorizontally(scope, 1);
            } else if (e.keyCode === 9) {
                // tab forwards and backwards through beats
                // todo: beats
                if (e.shiftKey === true) {
                    moveHorizontally(scope, -1);
                } else {
                    moveHorizontally(scope, 1);
                }
                e.preventDefault();
            }

            console.log(e.keyCode);
        });
    }

    // dom functions
    function moveVertically(scope, direction) {
        let target = null;
        if (direction > 0) {
            target = scope.selected.nextSibling;
        } else {
            target = scope.selected.previousSibling;
        }

        moveToString(scope, target);
    }

    function moveHorizontally(scope, direction) {
        let siblingQuaver = getSiblingQuaver(scope.selected, direction);
        if (!siblingQuaver) {
            return;
        }
        let index = indexInParent(scope.selected, 'string');
        let target = siblingQuaver.querySelector(`.string:nth-child(${index + 1})`);
        moveToString(scope, target);
    }

    function moveToString(scope, target) {
        if (!hasClass(target, 'string')) {
            return;
        }

        cancelStringSelect(scope);
        selectString(scope, target);
    }

    function selectString(scope, target) {
        target.classList.add('selected');
        scope.selected = target;
    }

    function cancelStringSelect(scope) {
        if (scope.selected) {
            scope.selected.classList.remove('selected');
            scope.selected = null;
        }
    }

    function setFret(scope, fret) {
        if (fret === null || isNaN(fret) === true) {
            scope.selected.innerHTML = '&nbsp;';
            return true;
        }

        // todo: configurable bounds
        if (fret >= 0 && fret <= 24) {
            scope.selected.innerHTML = fret;
            return true;
        }
        return false;
    }

    function getSiblingQuaver(element, direction) {
        let quaver = closestClass(element, 'quaver');
        if (direction > 0) {
            quaver = quaver.nextSibling;
        } else {
            quaver = quaver.previousSibling;
        }

        if (hasClass(quaver, 'quaver')) {
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
        let bar = closestClass(element, 'bar');
        if (direction > 0) {
            bar = bar.nextSibling;
        } else {
            bar = bar.previousSibling;
        }

        if (hasClass(bar, 'bar')) {
            return bar;
        }

        return null;
    }

    // model functions
    function getBars(numberOfBars) {
        var bars = [];
        for (let i = 0; i < numberOfBars; i++) {
            let bar = {
                quavers: getQuavers(16)
            };
            bars.push(bar);
        }
        return bars;
    }

    function getQuavers(numberOfQuavers) {
        var quavers = [];
        for (let i = 0; i < numberOfQuavers; i++) {
            let quaver = {
                strings: getStrings(5)
            };
            quavers.push(quaver);
        }
        return quavers;
    }

    function getStrings(numberOfStrings) {
        var strings = [];
        for (let i = 0; i < numberOfStrings; i++) {
            strings.push(i);
        }
        return strings;
    }


    // todo: utility functions that should be moved somewhere good
    function closestClass(element, className) {
        while (element) {
            if (hasClass(element, className)) {
                break;
            }
            element = element.parentElement;
        }

        return element;
    }
    function hasClass(element, className) {
        return element && element.classList && element.classList.contains(className);
    }
    function indexInParent(element, className) {
        let index = -1;
        while (element) {
            if (!hasClass(element, className)) {
                break;
            }
            index++;
            element = element.previousSibling;
        }
        return index;
    }
})(rivets);