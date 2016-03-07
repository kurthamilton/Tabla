(function() {
    'use strict';

    configure();
    requirejs(['controllers/instruments-controller', 'controllers/tablature-controller'], app);

    function app(instrumentsController, tablatureController) {
        instrumentsController.load();
        tablatureController.load();
    }

    function configure() {
        rivets.formatters.default = function(value, args) {
            return (typeof value !== 'undefined' && value !== null) ? value : args;
        };

        require.config({
            baseUrl: 'app',
            paths: {
                'utils.dom': '../js/dom-utils'
            }
        });
    }
})();