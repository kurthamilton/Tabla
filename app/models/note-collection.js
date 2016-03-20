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
            let position = getPosition(note);
            if (!notes.hasOwnProperty(position)) {
                notes[position] = {};
            }

            notes[position][note.string] = note.fret;
        };

        this.getFrets = function(notePosition) {
            let frets = {};

            let position = getPosition(notePosition);
            if (!notes.hasOwnProperty(position)) {
                return;
            }

            for (let string in notes[position]) {
                if (notes[position].hasOwnProperty(string)) {
                    frets[string] = notes[position][string];
                }
            }

            return frets;
        };

        this.remove = function(note) {
            if (!isValid(note)) {
                return;
            }

            let position = getPosition(note);
            if (!notes.hasOwnProperty(position) || !notes[position].hasOwnProperty(note.string)) {
                return;
            }

            delete notes[position][note.string];
        };

        this.serialize = function() {
            let serialized = [];

            for (let position in notes) {
                let note = getNoteFromPosition(parseFloat(position));

                let frets = notes[position];
                for (var string in frets) {
                    serialized.push({
                        bar: note.bar,
                        crotchet: note.crotchet,
                        quaver: note.quaver,
                        string: string,
                        fret: frets[string]
                    });
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

        function getPosition(note) {
            // return bar.{position as fraction}. e.g. bar 1, crotchet 3, quaver 3 = 1.375
            return note.bar + (note.crotchet / 10) + (note.quaver / 4 / 10);
        }

        function getNoteFromPosition(position) {
            let bar = Math.floor(position);
            position = (position - bar) * 10;

            let crotchet = Math.floor(position);
            position = (position - crotchet) * 4;

            let quaver = position;

            return {
                bar: bar,
                crotchet: crotchet,
                quaver: quaver
            };
        }
    }
})();