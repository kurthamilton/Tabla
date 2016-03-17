(function() {
    'use strict';

    define(() => Tune);

    function Tune(options) {
        this.beatsPerBar = 4;
        this.bpm = 120;
        this.id = options.id;
        this.index = {};
        this.instrument = options.instrument;
        this.name = options.name;
        this.notes = [];
    }

    Tune.prototype.addNote = function(note) {
        this.deleteNote(note);
        let index = this.notes.length;
        this.notes.push(note);

        let bar = this.index[note.bar] || (this.index[note.bar] = {});
        let crotchet = bar[note.crotchet] || (bar[note.crotchet] = {});
        let quaver = crotchet[note.quaver] || (crotchet[note.quaver] = {});
        quaver[note.string] = index;
    };

    Tune.prototype.deleteNote = function(note) {
        let index = getPosition(this.index, note);
        if (index < 0) {
            return;
        }
        this.notes.splice(index, 1);
        delete this.index[note.bar][note.crotchet][note.quaver][note.string];
    };

    Tune.prototype.getFret = function(note) {
        let index = getPosition(this.index, note);
        if (index === undefined || index < 0) {
            return null;
        }
        return this.notes[index].fret;
    };

    Tune.prototype.getFrets = function(note) {
        let parts = getIndexParts(this.index, note);
        return parts.quaver;
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
            notes: this.notes
        };
    };

    function getIndexParts(index, note) {
        let parts = {
            bar: null,
            crotchet: null,
            quaver: null,
            string: null
        };

        let partNames = ['bar', 'crotchet' ,'quaver', 'string'];
        for (let i = 0; i < partNames.length; i++) {
            let partName = partNames[i];
            let part = index[note[partName]];
            if (!part) {
                i = partNames.length;
            }
            parts[partName] = part || null;
            index = part;
        }

        return parts;
    }

    function getPosition(index, note) {
        let parts = getIndexParts(index, note);
        return parts.string || -1;
    }
})();
