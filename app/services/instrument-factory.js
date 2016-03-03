(function() {
    'use strict';

    define(['models.instrument', 'models.string'], InstrumentFactory);

    function InstrumentFactory(Instrument, String) {
        const instruments = {
            banjo: function() {
                let banjo = new Instrument('banjo');
                banjo.strings.push(new String({ index: 0, note: 'D', octave: 4 }));
                banjo.strings.push(new String({ index: 1, note: 'B', octave: 3 }));
                banjo.strings.push(new String({ index: 2, note: 'G', octave: 3 }));
                banjo.strings.push(new String({ index: 3, note: 'D', octave: 3 }));
                banjo.strings.push(new String({ index: 4, note: 'G', octave: 4, startFret: 5 }));
                return banjo;
            },
            guitar: function() {
                let guitar = new Instrument('guitar');
                guitar.strings.push(new String({ index: 0, note: 'E', octave: 4 }));
                guitar.strings.push(new String({ index: 1, note: 'B', octave: 3 }));
                guitar.strings.push(new String({ index: 2, note: 'G', octave: 3 }));
                guitar.strings.push(new String({ index: 3, note: 'D', octave: 3 }));
                guitar.strings.push(new String({ index: 4, note: 'A', octave: 2 }));
                guitar.strings.push(new String({ index: 5, note: 'E', octave: 2 }));
                return guitar;
            }
        };

        return {
            available: function() {
                return getAvailableNames();
            },
            get: function(name) {
                if (instruments.hasOwnProperty(name)) {
                    return instruments[name]();
                }
                // todo: custom instruments in storage service
                return null;
            }
        };

        function getAvailableNames() {
            let names = [];
            for (var name in instruments) {
                if (instruments.hasOwnProperty(name)) {
                    names.push(name);
                }
            }
            return names;
        }
    }
})();