(function() {
    'use strict';

    define(() => Part);

    /**
     * An instrument's part in a tune
     */
    function Part(options) {
        this.id = options.id;
        this.instrumentName = options.instrumentName;
        this.name = options.name || options.instrumentName;
        this.notes = [];
        this.sound = options.sound;
        this.tune = options.tune;
    }

    Part.prototype.addNote = function(note) {
        this.deleteNote(note);
        this.notes.push(note);
    };

    Part.prototype.deleteNote = function(note) {
        let index = getIndex(this.notes, note);
        if (index < 0) {
            return;
        }
        this.notes.splice(index, 1);
    };

    Part.prototype.getFrets = function(position) {
        // todo: index
        let frets = {};
        this.notes.forEach((n, i) => {
            if (n.bar === position.bar && n.crotchet === position.crotchet && n.quaver === position.quaver) {
                frets[n.string] = n.fret;
            }
        });
        return frets;
    };

    Part.prototype.serialize = function() {
        return {
            id: this.id,
            instrumentName: this.instrumentName,
            name: this.name,
            notes: this.notes,
            sound: this.sound
        };
    };

    function getIndex(notes, note) {
        let position = -1;
        notes.forEach((n, i) => {
            if (n.bar === note.bar && n.crotchet === note.crotchet && n.quaver === note.quaver && n.string === note.string) {
                position = i;
                return;
            }
        });
        return position;
    }
})();