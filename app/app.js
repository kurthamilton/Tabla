(function(rivets) {
    'use strict';

    configure();
    requirejs(['controllers/instruments-controller', 'controllers/tablature-controller'], app);

    function app(instrumentsController, tablatureController) {
        instrumentsController.load();
        tablatureController.load();
    }

    function configure() {
        rivetsConfig();
        requireConfig();
    }

    function requireConfig() {
        require.config({
            baseUrl: 'app',
            paths: {
                'utils.dom': '../js/dom-utils'
            }
        });
    }

    function rivetsConfig() {
        rivets.formatters.default = function(value, args) {
            return (typeof value !== 'undefined' && value !== null) ? value : args;
        };
    }
})(rivets);