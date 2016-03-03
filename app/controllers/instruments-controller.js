(function() {
    'use strict';

    define(['services.instrumentFactory'], (instrumentFactory) => new InstrumentsController(instrumentFactory));

    function InstrumentsController(instrumentFactory) {
        const controller = 'instruments';

        this.index = function() {
            let scope = new Scope(instrumentFactory);
            bind(controller, 'index', scope);
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

    // todo: move out of this controller
    function bind(controller, action, model) {
        let view = document.getElementById(`${controller}.${action}`);
        return rivets.bind(view, model);
    }
})();