(function() {
    'use strict';

    define(['models/bar', 'models/part'], function(Bar, Part) {
        function Tune(options) {
            this.bars = deserializeBars(options.bars);
            this.beatsPerBar = options.beatsPerBar || 4;
            this.bpm = options.bpm || 120;
            this.id = options.id;
            this.name = options.name;
            this.parts = deserializeParts(options.parts, this);
            this.volume = options.volume || 1;
        }

        function deserializeBars(options) {
            let bars = [];

            let numberOfBars = options ? options.length : 16;
            for (let i = 0; i < numberOfBars; i++) {
                bars.push(new Bar(options ? options[i] : {
                    index: i
                }));
            }

            return bars;
        }

        function deserializeParts(options, tune) {
            return options.map(object => {
                object.tune = tune;
                let part = new Part(object);
                return part;
            });
        }

        Tune.prototype.serialize = function() {
            return {
                bars: this.bars.map(bar => bar.serialize()),
                beatsPerBar: this.beatsPerBar,
                bpm: this.bpm,
                id: this.id,
                name: this.name,
                parts: this.parts.map(part => part.serialize()),
                volume: this.volume
            };
        };

        return Tune;
    });
})();
