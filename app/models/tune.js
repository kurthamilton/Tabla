(function() {
    'use strict';

    define(() => Tune);

    function Tune(options) {
        this.bars = options.bars || 16;
        this.beatsPerBar = options.beatsPerBar || 4;
        this.bpm = options.bpm || 120;
        this.id = options.id;
        this.name = options.name;
        this.parts = [];
        this.volume = options.volume || 1;
    }

    Tune.prototype.serialize = function() {
        return {
            bars: this.bars,
            beatsPerBar: this.beatsPerBar,
            bpm: this.bpm,
            id: this.id,
            name: this.name,
            parts: this.parts.map(part => part.serialize()),
            volume: this.volume
        };
    };
})();
