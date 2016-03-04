(function() {
    'use strict';

    define(['services.instrumentFactory'], instrumentFactory => new InstrumentsController(instrumentFactory));

    function InstrumentsController(instrumentFactory) {
        const controller = 'instruments';

        this.index = function() {
            let scope = new Scope(instrumentFactory);
            let view = getView(controller, 'index');
            bindInstruments(view, scope.model.names);
        };
    }

    function Scope(instrumentFactory) {
        let model = {
            instrument: null,
            names: instrumentFactory.available(),
            selectedInstrument: ''
        };

        let actions = {
            selectInstrument: function(e, scope) {
                scope.model.instrument = instrumentFactory.get(model.selectedInstrument);
            }
        };

        this.actions = actions;
        this.model = model;
    }

    function bindInstruments(view, instrumentNames) {
        let select = view.querySelector('.instruments');
        bindSelect(select, instrumentNames, onSelectInstrument);
    }
    function onSelectInstrument(e) {
        console.log(e.target.value);
    }

    // generic utility functions
    function getView(controller, action) {
        return document.getElementById(`${controller}.${action}`);
    }
    function bindSelect(select, options, onChange) {
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
    //
})();