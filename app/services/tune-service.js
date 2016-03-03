(function() {
    'use strict';

    define(['Tune'], TuneService);

    function TuneService(Tune) {
        let tune = new Tune();
        
        return {
            tune: tune
        };
    }
})();