(function() {
    'use strict';

    define(() => Instrument);

    function Instrument(name) {
        this.name = name;
        this.strings = [];
    }
})();