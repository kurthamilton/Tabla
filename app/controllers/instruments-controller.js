(function(rivets) {
    'use strict';

    define(['services/instrument-service'], InstrumentsController);

    function InstrumentsController(instrumentService) {
        return {
            load: function() {
                render();
            }
        };

        function render() {
            let scope = {
                model: instrumentService.model,
                actions: {
                    selectInstrument: selectInstrument
                }
            };

            let view = document.getElementById('instruments');
            return rivets.bind(view, scope);
        }

        function selectInstrument(e, scope) {
            instrumentService.selectInstrument(scope.model.selectedInstrument);
        }
    }
})(rivets);