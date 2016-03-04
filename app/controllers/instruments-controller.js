(function(rivets) {
    'use strict';

    define(['services.instrumentFactory'], instrumentFactory => new InstrumentsController(instrumentFactory));

    function InstrumentsController(instrumentFactory) {
        this.index = function() {
            let scope = new Scope(instrumentFactory);
            let view = document.getElementById('instruments.index');
            rivets.bind(view, scope);
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
})(rivets);