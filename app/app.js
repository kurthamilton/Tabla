(function() {
    'use strict';

    configure();
    requirejs(['controllers.app'], app);

    function app(appController) {
        appController.index();
    }

    function configure() {
        require.config({
            paths: {
                'controllers.app': 'controllers/app-controller',
                'controllers.instruments': 'controllers/instruments-controller',
                'controllers.tablature': 'controllers/tablature-controller',
                'models.bar': 'models/bar',
                'models.instrument': 'models/instrument',
                'models.note': 'models/note',
                'models.string': 'models/string',
                'models.tune': 'models/tune',
                'scopes.tablature': 'scopes/tablature-scope',
                'services.instrumentFactory': 'services/instrument-factory',
                'services.scale': 'services/scale-service',
                'services.storage': 'services/storage-service',
                'services.tablature.dom': 'services/tablature-dom-service',
                'services.tune': 'services/tune-service',
                'utils.dom': '../js/dom-utils'
            }
        });
    }
})();