(function(rivets) {
    'use strict';

    configure();

    requirejs(['controllers/tablature-controller', 'controllers/tunes-controller'], app);

    function app(tablatureController, tunesController) {
        tunesController.load();
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