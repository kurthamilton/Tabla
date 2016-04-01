(function() {
    'use strict';

    define(['models/note'], function(Note) {
        function NoteCollection(options) {
            let notes = {};
            const properties = ['bar', 'crotchet', 'quaver', 'string'];

            deserializeNotes(options);

            this.add = addNote;
            this.get = getNote;
            this.getNotes = getNotes;
            this.remove = removeNote;
            this.serialize = serialize;

            function addNote(note) {
                if (!isValid(note)) {
                    return;
                }
                let position = getPosition(note);
                if (!notes.hasOwnProperty(position)) {
                    notes[position] = {};
                }

                notes[position][note.string] = new Note(note);
            }

            function deserializeNotes(options) {
                if (options && Array.isArray(options)) {
                    options.forEach(note => addNote(new Note(note)));
                }
            }

            function getNote(note) {
                if (!note) {
                    return null;
                }
                let position = getPosition(note);
                let positionNotes = notes[position];
                if (!positionNotes) {
                    return null;
                }
                return positionNotes[note.string];
            }

            function getNotes(notePosition) {
                let positionNotes = {};

                let position = getPosition(notePosition);
                if (!notes.hasOwnProperty(position)) {
                    return positionNotes;
                }

                for (let string in notes[position]) {
                    if (notes[position].hasOwnProperty(string)) {
                        positionNotes[string] = notes[position][string];
                    }
                }

                return positionNotes;
            }

            function getPosition(note) {
                // return bar.{position as fraction}. e.g. bar 1, crotchet 3, quaver 3 = 1.375
                return note.bar + (note.crotchet / 10) + (note.quaver / 4 / 10);
            }

            function isValid(note) {
                let isValid = true;
                properties.forEach(property => {
                    if (!note.hasOwnProperty(property)) {
                        return (isValid = false);
                    }
                });
                return isValid;
            }

            function removeNote(note) {
                if (!isValid(note)) {
                    return;
                }

                let position = getPosition(note);
                if (!notes.hasOwnProperty(position) || !notes[position].hasOwnProperty(note.string)) {
                    return;
                }

                delete notes[position][note.string];
            }

            function serialize() {
                let serialized = [];

                for (let position in notes) {
                    let positionNotes = notes[position];
                    for (var string in positionNotes) {
                        serialized.push(positionNotes[string]);
                    }
                }

                return serialized;
            }
        }

        return NoteCollection;
    });
})();