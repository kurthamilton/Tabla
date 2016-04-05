(function() {
    'use strict';

    define(['utils.dom'], AlertService);

    function AlertService(domUtils) {
        let container = document.getElementById('alerts');

        return {
            addAlert: addAlert
        };

        function addAlert(options) {
            options.type = options.type || 'success';

            let clone = domUtils.cloneTemplate('alert-template');
            clone.querySelector('.alert-message').textContent = options.message;
            container.appendChild(clone);
            let alert = container.children[container.children.length - 1];
            alert.classList.add(`alert-${options.type}`);

            if (options.timeout > 0) {
                setTimeout(function() {
                    dismissAlert(alert);
                }, options.timeout);
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