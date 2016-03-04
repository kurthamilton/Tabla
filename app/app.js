(function() {
    'use strict';

    configure();
    requirejs(['controllers.instruments', 'controllers.tablature'], app);

    function app(instrumentsController, tablatureController) {
        instrumentsController.index();
        tablatureController.index();
    }

    function configure() {
        require.config({
            paths: {
                'controllers.instruments': 'controllers/instruments-controller',
                'controllers.tablature': 'controllers/tablature-controller',
                'models.bar': 'models/bar',
                'models.instrument': 'models/instrument',
                'models.note': 'models/note',
                'models.string': 'models/string',
                'models.tune': 'models/tune',
                'services.instrumentFactory': 'services/instrument-factory',
                'services.scale': 'services/scale-service',
                'services.storage': 'services/storage-service',
                'services.tune': 'services/tune-service'
            }
        });
    }
})();