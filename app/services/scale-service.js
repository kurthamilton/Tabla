(function() {
    'use strict';

    define(ScaleService);

    function ScaleService() {
        const scale = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];

        return {
            isValidNote: function(note) {
                if (typeof note !== 'string') {
                    return false;
                }

                return scale.indexOf(note.toUpperCase()) >= 0;
            }
        }
    }
})();