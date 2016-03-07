(function() {
    'use strict';

    define(['services/instrument-factory'], InstrumentService);

    function InstrumentService(instrumentFactory) {
        let model = {
            instrument: null,
            names: instrumentFactory.available(),
            selectedInstrument: ''
        };

        return {
            model: model,
            selectInstrument: function(name) {
                model.instrument = instrumentFactory.get(name);
            }
        };
    }
})();