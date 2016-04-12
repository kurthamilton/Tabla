(function() {
    'use strict';

    define(ValidationService);

    function ValidationService() {
        return {
            setElementValidity: setElementValidity,
            validateElement: validateElement,
            validateForm: validateForm
        };

        function setElementValidity(element, valid) {
            let action = valid ? 'remove' : 'add';
            element.parentNode.classList[action]('has-error');
        }

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
            setElementValidity(element, valid);

            if (!element.dataset.validateOnInput) {
                element.addEventListener('input', () => validateElement(element));
                element.dataset.validateOnInput = true;
            }
            return valid;
        }
    }
})();