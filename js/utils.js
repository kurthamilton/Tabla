var Tabla = window.Tabla = {
    Utils: {}
};

Tabla.Utils = (function() {
    'use strict';

    return {
        bindSelect: function(select, options, onChange) {
            while (select.lastChild) {
                select.removeChild(select.lastChild);
            }
            for (let i = 0; i < options.length; i++) {
                let option = document.createElement('option');
                option.value = options[i].value || options[i];
                option.text = options[i].text || options[i];
                select.appendChild(option);
            }
            if (typeof onChange === 'function') {
                select.addEventListener('change', onChange);
            }
        }
    };
})();