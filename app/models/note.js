(function() {
    'use strict';

    define(() => Note);

    function Note(options) {
        this.bar = options.bar;
        this.beat = options.beat;
        this.fret = options.fret;
        this.length = options.length;
        this.string = options.string;
    }
})();