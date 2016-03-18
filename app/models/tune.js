(function() {
    'use strict';

    define(() => Tune);

    function Tune(options) {
        this.beatsPerBar = 4;
        this.bpm = 120;
        this.id = options.id;
        this.instrument = options.instrument;
        this.name = options.name;
        this.notes = [];
        this.sound = options.sound;
    }

    Tune.prototype.addNote = function(note) {
        this.deleteNote(note);
        this.notes.push(note);
    };

    Tune.prototype.deleteNote = function(note) {
        let index = getIndex(this.notes, note);
        if (index < 0) {
            return;
        }
        this.notes.splice(index, 1);
    };

    Tune.prototype.getFrets = function(position) {
        // todo: index
        let frets = {};
        this.notes.forEach((n, i) => {
            if (n.bar === position.bar && n.crotchet === position.crotchet && n.quaver === position.quaver) {
                frets[n.string] = n.fret;
            }
        });
        return frets;
    };

    Tune.prototype.maxBar = function() {
        let maxBar = 0;
        this.notes.forEach(note => maxBar = Math.max(note.bar, maxBar));
        return maxBar;
    };

    Tune.prototype.serialize = function() {
        return {
            beatsPerBar: this.beatsPerBar,
            bpm: this.bpm,
            id: this.id,
            instrument: this.instrument,
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
