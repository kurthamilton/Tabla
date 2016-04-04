(function() {
    'use strict';

    define(() => Instrument);

    function Instrument(options) {
        this.frets = options.frets;
        this.name = options.name;
        this.strings = [];
    }
})();