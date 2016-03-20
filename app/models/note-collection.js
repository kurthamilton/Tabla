(function() {
    'use strict';

    define(() => NoteCollection);

    function NoteCollection() {
        let notes = {};
        const properties = ['bar', 'crotchet', 'quaver', 'string'];

        this.add = function(note) {
            if (!isValid(note)) {
                return;
            }

            let notesLevel = notes;
            properties.forEach((property, i) => {
                let noteValue = note[property];

                if (!notesLevel.hasOwnProperty(noteValue)) {
                    notesLevel[noteValue] = {};
                }

                if (i === properties.length - 1) {
                    notesLevel[noteValue] = note.fret;
                }

                notesLevel = notesLevel[noteValue];
            });
        };

        this.getFrets = function(position) {
            let frets = {};

            let bar = notes[position.bar];
            if (!bar) {
                return frets;
            }
            let crotchet = bar[position.crotchet];
            if (!crotchet) {
                return frets;
            }
            let quaver = crotchet[position.quaver];
            if (!quaver) {
                return frets;
            }

            for (let string in quaver) {
                frets[string] = quaver[string];
            }

            return frets;
        };

        this.remove = function(note) {
            if (!isValid(note)) {
                return;
            }

            let notesLevel = notes;
            properties.forEach((property, i) => {
                let noteValue = note[property];

                if (!notesLevel.hasOwnProperty(noteValue)) {
                    return;
                }

                if (i === properties.length - 1) {
                    delete notesLevel[noteValue];
                }

                notesLevel = notesLevel[noteValue];
            });
        };

        this.serialize = function() {
            let serialized = [];
            for (let bar in notes) {
                for (let crotchet in notes[bar]) {
                    for (let quaver in notes[bar][crotchet]) {
                        for (let string in notes[bar][crotchet][quaver]) {
                            let fret = notes[bar][crotchet][quaver][string];
                            if (fret !== undefined) {
                                serialized.push({
                                    bar: parseInt(bar),
                                    crotchet: parseInt(crotchet),
                                    quaver: parseInt(quaver),
                                    string: parseInt(string),
                                    fret: notes[bar][crotchet][quaver][string]
                                });
                            }
                        }
                    }
                }
            }
            return serialized;
        };

        function isValid(note) {
            let isValid = true;
            properties.forEach(property => {
                if (!note.hasOwnProperty(property)) {
                    return (isValid = false);
                }
            });
            return isValid;
        }
    }
})();