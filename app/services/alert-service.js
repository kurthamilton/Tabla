(function() {
    'use strict';

    define(['utils.dom'], AlertService);

    function AlertService(domUtils) {
        let container = document.getElementById('alerts');

        return {
            addAlert: addAlert
        };

        /* bootstrap.native doesn't do very good alert handling, so do all of the binding here */
        function addAlert(options) {
            options.type = options.type || 'success';

            let clone = domUtils.cloneTemplate('alert-template');
            clone.querySelector('.alert-message').textContent = options.message;
            container.appendChild(clone);

            let alert = container.children[container.children.length - 1];
            alert.classList.add('alert-dismissable');
            alert.classList.add(`alert-${options.type}`);

            let dismiss = alert.querySelector('[data-dismiss="alert"]');
            if (!dismiss) {
                return;
            }

            dismiss.addEventListener('click', function() {
                dismissAlert(alert);
            });

            if (options.timeout > 0) {
                setTimeout(function() {
                    dismissAlert(alert);
                }, options.timeout);
            }
        }

        function dismissAlert(alert) {
            container.removeChild(alert);
        }
    }
})();