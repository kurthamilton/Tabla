(function(rivets) {
    'use strict';

    define(['services/instrument-factory'], InstrumentsController);

    function InstrumentsController(instrumentFactory) {
        return {
            load: function() {
                render();
            }
        };

        function render() {
            let scope = new Scope(instrumentFactory);
            let view = document.getElementById('instruments');
            return rivets.bind(view, scope);
        }
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