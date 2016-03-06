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
            }
        };

        return utils;
    }
})();