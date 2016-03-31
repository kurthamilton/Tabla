(function() {
    'use strict';

    define(ValidationService);

    function ValidationService() {
        return {
            validateElement: validateElement,
            validateForm: validateForm
        };

        function validateForm(form) {
            let elements = form.querySelectorAll('input,select,textarea');
            let valid = true;
            for (let i = 0; i < elements.length; i++) {
                let elementValid = validateElement(elements[i]);
                if (elementValid === false) {
                    valid = false;
                }
            }

            return valid;
        }

        function validateElement(element) {
            let valid = element.checkValidity();
            let action = valid ? 'remove' : 'add';
            element.parentNode.classList[action]('has-error');

            if (!element.dataset.validateOnInput) {
                element.addEventListener('input', () => validateElement(element));
                element.dataset.validateOnInput = true;
            }
            return valid;
        }
    }
})();