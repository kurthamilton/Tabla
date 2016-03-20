(function() {
    'use strict';

    define(['models/note-collection'], PartWrapper);

    function PartWrapper(NoteCollection) {
        /**
         * An instrument's part in a tune
         */
        function Part(options) {
            let part = this;
            let noteCollection = new NoteCollection();

            this.id = options.id;
            this.instrumentName = options.instrumentName;
            this.name = options.name || options.instrumentName;
            this.sound = options.sound;
            this.tune = options.tune;

            this.addNote = function(note) {
                noteCollection.add(note);
            };

            this.deleteNote = function(note) {
                noteCollection.remove(note);
            };

            this.getFrets = function(position) {
                return noteCollection.getFrets(position);
            };

            this.serialize = function() {
                return {
                    id: part.id,
                    instrumentName: part.instrumentName,
                    name: part.name,
                    notes: noteCollection.serialize(),
                    sound: part.sound
                };
            };
        }

        return Part;
    }
})();