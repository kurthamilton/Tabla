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

        // Compare 2 positions. Returns 0 if positions are equal, -1 if x < y, 1 if x > y.
        Tune.prototype.positionCompare = function(x, y) {
            if (x.bar === y.bar && x.crotchet === y.crotchet && x.quaver === y.quaver) {
                return 0;
            }

            if (x.bar !== y.bar) {
                return x.bar < y.bar ? -1 : 1;
            }
            if (x.crotchet !== y.crotchet) {
                return x.crotchet < y.crotchet ? -1 : 1;
            }
            if (x.quaver !== y.quaver) {
                return x.quaver < y.quaver ? -1 : 1;
            }

            return null;
        };

        // Offsets the position by the offset. Set loop to false when 0 should not be passed through
        Tune.prototype.offsetPosition = function(position, offset, loop) {
            let tune = this;

            if (loop === undefined) {
                loop = true;
            }

            if (offset.quaver) {
                position.quaver += offset.quaver || 0;
                if (position.quaver < 0) {
                    tune.offsetPosition(position, { crotchet: -1 }, loop);
                    position.quaver = 3;
                } else if (position.quaver > 3) {
                    tune.offsetPosition(position, { crotchet: 1 }, loop);
                    position.quaver = 0;
                }
            }

            if (offset.crotchet) {
                position.crotchet += offset.crotchet || 0;
                if (position.crotchet < 0) {
                    tune.offsetPosition(position, { bar: -1 }, loop);
                    position.crotchet = tune.bars[position.bar].beats - 1;
                } else if (position.crotchet >= tune.bars[position.bar].beats) {
                    tune.offsetPosition(position, { bar: 1 }, loop);
                    position.crotchet = 0;
                }
            }

            if (offset.bar) {
                position.bar += offset.bar || 0;
                if (loop) {
                    if (position.bar < 0) {
                        position.bar = tune.bars.length - 1;
                    } else if (position.bar >= tune.bars.length) {
                        position.bar = 0;
                    }
                }
            }
        };

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
