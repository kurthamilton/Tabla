(function() {
    'use strict';

    define(() => Tune);

    function Tune() {
        this.notes = {};
    }

    Tune.prototype.addNote = function(note) {
        let prop = `${note.bar}.${note.beat}.${note.quaver}`;
        if (!this.notes.hasOwnProperty(prop)) {
            this.notes = {};
        }
        this.notes[prop][note.string] = note;
    };
})();