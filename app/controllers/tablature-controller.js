(function(rivets) {
    'use strict';

    define(() => new TablatureController());

    function TablatureController() {
        this.index = function() {
            let view = document.getElementById('tablature.index');
            let scope = new Scope();
            rivets.bind(view, scope);
        };
    }

    function Scope() {
        this.model = {
            bars: getBars(20)
        };
    }

    function getBars(numberOfBars) {
        var bars = [];
        for (let i = 0; i < numberOfBars; i++) {
            let bar = {
                beats: getBeats(16)
            };
            bars.push(bar);
        }
        return bars;
    }

    function getBeats(numberOfBeats) {
        var beats = [];
        for (let i = 0; i < numberOfBeats; i++) {
            let beat = {
                strings: getStrings(5)
            };
            beats.push(beat);
        }
        return beats;
    }

    function getStrings(numberOfStrings) {
        var strings = [];
        for (let i = 0; i < numberOfStrings; i++) {
            strings.push(i);
        }
        return strings;
    }
})(rivets);