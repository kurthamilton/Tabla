(function() {
    'use strict';

    define(() => Bar);

    function Bar(options) {
        this.beats = options.beats || 4;
        this.index = options.index;
    }

    Bar.prototype.serialize = function() {
        return {
            beats: this.beats,
            index: this.index
        };
    }
})();