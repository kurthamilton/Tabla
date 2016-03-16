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

    Note.prototype.equalPosition = function(other) {
        return other && other.bar === this.bar && other.crotchet === this.crotchet && other.quaver === this.quaver;
    };

    Note.prototype.position = function() {
        return (1000 * this.bar) + (10 * this.crotchet) + (this.quaver);
    };
})();