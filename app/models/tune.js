(function() {
    'use strict';

    define(() => Tune);

    function Tune() {
        this.notes = {};
    }

    Tune.prototype.addNote = function(note) {
        let key = `${note.bar}.${note.beat}`;
        if (!this.notes.hasOwnProperty(key)) {
            this.notes = {};
        }
        let beat = this.notes[key];
        if (beat.hasOwnProperty(note.string)) {
            console.log(`oops - string ${note.string} already exists at ${key}`);
            return;
        }

        // todo: check string doesn't conflict with surrounding strings
        beat[note.string] = note;
    };
})();