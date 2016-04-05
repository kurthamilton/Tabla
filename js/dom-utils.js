(function() {
    'use strict';

    define(DomUtils);

    function DomUtils() {
        let utils = {
            cloneTemplate: function(id) {
                let template = document.getElementById(id);
                return document.importNode(template.content, true);
            },
            /**
             * Close an open modal by triggering a click on the close button within the open modal
             */
            closeModal: function() {
                let modal = utils.getOpenModal();
                if (!modal) {
                    return;
                }

                let closeButton = modal.querySelector('[data-dismiss="modal"]');
                if (!closeButton) {
                    return;
                }

                closeButton.click();
            },
            closestClass: function(element, className) {
                while (element) {
                    if (utils.hasClass(element, className)) {
                        break;
                    }
                    element = element.parentElement;
                }

                return element;
            },
            getOpenModal: function() {
                return document.querySelector('.modal.in');
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
            /**
             * Open a modal using the toggle with the given target selector.
             */
            openModal: function(targetSelector) {
                // Cannot open a modal if another modal is already open
                if (utils.getOpenModal()) {
                    return;
                }

                let toggle = document.querySelector(`[data-toggle="modal"][data-target="${targetSelector}"]`);
                if (!toggle) {
                    return;
                }

                toggle.click();
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