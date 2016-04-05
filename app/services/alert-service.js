(function() {
    'use strict';

    define(['utils.dom'], AlertService);

    function AlertService(domUtils) {
        let container = document.getElementById('alerts');

        return {
            addAlert: addAlert
        };

        function addAlert(message, timeout) {
            let clone = domUtils.cloneTemplate('alert-template');
            clone.querySelector('.alert-message').textContent = message;
            container.appendChild(clone);

            if (timeout > 0) {
                let alert = container.children[container.children.length - 1];
                setTimeout(function() {
                    dismissAlert(alert);
                }, timeout);
            }
        }

        function dismissAlert(alert) {
            let button = alert.querySelector('[data-dismiss="alert"]');
            if (!button) {
                return;
            }
            button.click();
        }
    }
})();