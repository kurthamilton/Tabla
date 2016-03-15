(function() {
    'use strict';

    define(['services/instrument-factory'], InstrumentService);

    function InstrumentService(instrumentFactory) {
        let model = getModel();

        return {
            model: model,
            selectInstrument: function(name) {
                model.selectedInstrument = name;
                model.instrument = instrumentFactory.get(name);
            }
        };

        function getModel() {
            return {
                instrument: null,
                names: instrumentFactory.available(),
                selectedInstrument: ''
            };
        }
    }
})();