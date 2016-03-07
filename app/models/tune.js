(function() {
    'use strict';

    define(() => Tune);

    function Tune() {
        this.index = {};
        this.notes = [];
    }

    Tune.prototype.addNote = function(note) {
        let indexKey = `${note.bar}.${note.quaver}.${note.string}`;
        if (this.index.hasOwnProperty(indexKey)) {
            let arrayIndex = this.index[indexKey];
            this.notes.splice(arrayIndex, 1);
        }
        this.index[indexKey] = this.notes.length;
        this.notes.push(note);
    };

    Tune.prototype.deleteNote = function() {
        // todo
    };

    Tune.prototype.getFret = function(bar, quaver, string) {
        let indexKey = `${bar}.${quaver}.${string}`;
        if (!this.index.hasOwnProperty(indexKey)) {
            return null;
        }
        let arrayIndex = this.index[indexKey];
        return this.notes[arrayIndex].fret;
    };

    Tune.prototype.maxBar = function() {
        let maxBar = 0;
        for (let i = 0; i < this.notes.length; i++) {
            let bar = this.notes[i].bar;
            if (bar > maxBar) {
                maxBar = bar;
            }
        }
        return maxBar;
    };
})();