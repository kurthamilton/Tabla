(function() {
    'use strict';

    define(() => Tune);

    function Tune(options) {
        this.beatsPerBar = 4;
        this.id = options.id;
        this.index = {};
        this.instrument = options.instrument;
        this.name = options.name;
        this.notes = [];
    }

    Tune.prototype.addNote = function(note) {
        let indexKey = this.getIndexKey(note);
        this.deleteNote(note);
        this.index[indexKey] = this.notes.length;
        this.notes.push(note);
    };

    Tune.prototype.deleteNote = function(note) {
        let indexKey = this.getIndexKey(note);
        if (!this.index.hasOwnProperty(indexKey)) {
            return;
        }
        let arrayIndex = this.index[indexKey];
        this.notes.splice(arrayIndex, 1);
        delete this.index[indexKey];
    };

    Tune.prototype.getFret = function(note) {
        let indexKey = this.getIndexKey(note);
        if (!this.index.hasOwnProperty(indexKey)) {
            return null;
        }
        let arrayIndex = this.index[indexKey];
        return this.notes[arrayIndex].fret;
    };

    Tune.prototype.getIndexKey = function(note) {
        return `${note.bar}.${note.crotchet}.${note.quaver}.${note.string}`;
    };

    Tune.prototype.maxBar = function() {
        let maxBar = 0;
        this.notes.forEach(note => maxBar = Math.max(note.bar, maxBar));
        return maxBar;
    };
})();