(function() {
    'use strict';

    define(() => Note);

    function Note(options) {
        this.bar = options.bar;
        this.crotchet = options.crotchet;
        this.fret = options.fret;
        this.quaver = options.quaver;
        this.string = options.string;
    }
})();