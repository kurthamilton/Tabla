(function() {
    'use strict';

    define(['services/instrument-factory', 'models/note-collection'], function (instrumentFactory, NoteCollection) {
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

            this.getNote = function(note) {
                return noteCollection.get(note);
            };

            this.getNotes = function(position) {
                return noteCollection.getNotes(position);
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

        Part.prototype.offsetNote = function (note, offset, constrain) {
            if (!offset) {
                return;
            }

            this.tune.offsetPosition(note, offset, constrain);

            note.string += offset.string || 0;

            if (constrain) {
                return;
            }

            // constrain
            let instrument = this.instrument;

            if (note.string < 0) {
                note.string = 0;
            } else if (note.string >= instrument.strings.length) {
                note.string = instrument.strings.length - 1;
            }
        };

        function deserializeNotes(options) {
            return new NoteCollection(options);
        }

        return Part;
    });
})();