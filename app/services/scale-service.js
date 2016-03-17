(function() {
    'use strict';

    define(ScaleService);

    const scale = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']

    function ScaleService() {
        return {
            midiNote: function(note, octave) {
                return (12 * octave) + scale.indexOf(note);
            },
            noteAtFret: function(note, octave, fret) {
                let scaleIndex = scale.indexOf(note);
                for (let i = 0; i < fret; i++) {
                    scaleIndex++;
                    if (scaleIndex === scale.length) {
                        scaleIndex = 0;
                        octave++;
                    }
                }

                return {
                    note: scale[scaleIndex],
                    octave: octave
                };
            }
        };
    }
})();