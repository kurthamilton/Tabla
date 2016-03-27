(function() {
    'use strict';

    define(DomUtils);

    function DomUtils() {
        let utils = {
            closestClass: function(element, className) {
                while (element) {
                    if (utils.hasClass(element, className)) {
                        break;
                    }
                    element = element.parentElement;
                }

                return element;
            },
            hasClass: function(element, className) {
                return element && element.classList && element.classList.contains(className);
            },
            indexInParent: function(element, className) {
                let index = -1;
                while (element) {
                    if (!utils.hasClass(element, className)) {
                        break;
                    }
                    index++;
                    element = element.previousSibling;
                }
                return index;
            },
            sibling: function(element, direction, className, parentClassName) {
                // todo: accept parentClassName as array or string

                element = utils.closestClass(element, className);

                let sibling = null;
                if (direction > 0) {
                    sibling = element.nextSibling;
                } else {
                    sibling = element.previousSibling;
                }

                if (utils.hasClass(sibling, className)) {
                    return sibling;
                }

                if (!parentClassName) {
                    return null;
                }

                let aunt = utils.sibling(element, direction, parentClassName);
                if (!aunt) {
                    return null;
                }

                let cousins = aunt.querySelectorAll(`.${className}`);
                if (direction > 0) {
                    return cousins[0];
                }
                return cousins[cousins.length - 1];
            }
        };

        return utils;
    }
})();