(function() {
    'use strict';

    define(['services/instrument-factory', 'models/note', 'models/note-collection'], function (instrumentFactory, Note, NoteCollection) {
        /**
         * An instrument's part in a tune
         */
        function Part(options) {
            let part = this;
            let noteCollection = deserializeNotes(options.notes);

            this.id = options.id;
            this.instrument = instrumentFactory.get(options.instrumentName);
            this.instrumentName = options.instrumentName;
            this.name = options.name || options.instrumentName;
            this.sound = options.sound;
            this.tune = options.tune;
            this.volume = options.volume || 1;

            this.addNote = function(note) {
                noteCollection.add(note);
            };

            this.deleteNote = function(note) {
                noteCollection.remove(note);
            };

            this.getFrets = function(position) {
                return noteCollection.getFrets(position);
            };

            this.index = function() {
                return part.tune.parts.findIndex(p => p.id === part.id);
            };

            this.serialize = function() {
                return {
                    id: part.id,
                    instrumentName: part.instrumentName,
                    name: part.name,
                    notes: noteCollection.serialize(),
                    sound: part.sound,
                    volume: part.volume
                };
            };
        }

        Part.prototype.getOffset = function(note, other) {
            let offset = this.tune.getOffset(note, other);
            offset.string = other.string - note.string;
            return offset;
        };

        Part.prototype.offsetNote = function (note, offset) {
            if (!offset) {
                return;
            }

            this.tune.offsetPosition(note, offset);

            note.string += offset.string || 0;

            // sanitise
            let instrument = this.instrument;

            if (note.string < 0) {
                note.string = 0;
            } else if (note.string >= instrument.strings.length) {
                note.string = instrument.strings.length - 1;
            }
        };

        function deserializeNotes(options) {
            let notes = new NoteCollection();
            if (options) {
                options.forEach(note => notes.add(new Note(note)));
            }
            return notes;
        }

        return Part;
    });
})();