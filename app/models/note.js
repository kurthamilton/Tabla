(function() {
    'use strict';

    define(() => Note);

    function Note(options) {
        this.bar = options.bar;
        this.quaver = options.quaver;
        this.fret = options.fret;
        this.string = options.string;
    }
})();