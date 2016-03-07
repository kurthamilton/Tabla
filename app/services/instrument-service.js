(function() {
    'use strict';

    define(['services/instrument-factory'], InstrumentService);

    function InstrumentService(instrumentFactory) {
        let model = getModel();

        let instrumentChangeCallbacks = [];

        return {
            model: model,
            onInstrumentChanged: function(callback) {
                if (typeof callback === 'function') {
                    instrumentChangeCallbacks.push(callback);
                }
            },
            selectInstrument: function(name) {
                model.selectedInstrument = name;
                model.instrument = instrumentFactory.get(name);
                for (let i = 0; i < instrumentChangeCallbacks.length; i++) {
                    instrumentChangeCallbacks[i](name);
                }
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