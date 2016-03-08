(function(rivets) {
    'use strict';

    configure();

    let dependencies = ['controllers/instrument-controller',
                        'controllers/session-controller',
                        'controllers/tablature-controller'];
    requirejs(dependencies, app);

    function app(instrumentController, sessionController, tablatureController) {
        sessionController.load();
        instrumentController.load();
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
                'utils.dom': '../js/dom-utils',
                'utils': '../js/utils'
            }
        });
    }

    function rivetsConfig() {
        rivets.formatters.default = function(value, args) {
            return (typeof value !== 'undefined' && value !== null) ? value : args;
        };
    }
})(rivets);