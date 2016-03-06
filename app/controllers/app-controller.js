(function() {
    'use strict';

    define(['controllers.instruments', 'controllers.tablature'], AppController);

    function AppController(instrumentsController, tablatureController) {
        return {
            index: function() {
                instrumentsController.load();
                tablatureController.load();
            }
        };
    }
})();