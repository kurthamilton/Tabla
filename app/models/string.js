(function() {
    'use strict';

    define(() => String);

    function String(options) {
        this.index = options.index;
        this.note = options.note;
        this.octave = options.octave;
        this.startFret = options.startFret || 0;
    }
})();