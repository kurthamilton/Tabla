(function() {
    'use strict';

    configure();
    requirejs(['controllers.instruments'], app);

    function app(instrumentsController) {
        instrumentsController.index();
    }

    function configure() {
        require.config({
            paths: {
                'controllers.instruments': 'controllers/instruments-controller',
                'models.instrument': 'models/instrument',
                'models.string': 'models/string',
                'services.instrumentFactory': 'services/instrument-factory',
                'services.scale': 'services/scale-service',
                'services.storage': 'services/storage-service'
            }
        });
    }
})();