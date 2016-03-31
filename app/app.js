(function(rivets) {
    'use strict';

    configure();

    requirejs(['controllers/tunes-controller', 'controllers/tablature-controller', 'controllers/audio-controller'], app);

    function app(tunesController, tablatureController, audioController) {
        tunesController.load();
        tablatureController.load();
        audioController.load();
    }

    function configure() {
        midiConfig();
        rivetsConfig();
        requireConfig();
    }

    function midiConfig() {
        MIDI.soundfontUrl = './assets/midi/';
    }

    function requireConfig() {
        require.config({
            baseUrl: 'app',
            paths: {
                'utils.dom': '../js/dom-utils',
                'utils': '../js/utils'
            }
        });
    }

    function rivetsConfig() {
        // cherry-picked from https://gist.github.com/der-On/cdafe908847e2b882691
        rivets.formatters.default = function(value, args) {
            return (typeof value !== 'undefined' && value !== null) ? value : args;
        };
        rivets.formatters.empty = function(value) {
            return !value || !Array.isArray(value) || value.length === 0;
        };
        rivets.formatters.eq = function(value, args) {
            return value === args;
        };
        rivets.formatters.gt = function(value, args) {
            return value > args;
        };
        rivets.formatters.length = function(value) {
            return Array.isArray(value) ? value.length : 0;
        };
        rivets.formatters.round = function(value, decimals) {
            if (decimals) {
                var exp = Math.pow(10, decimals);
                return Math.round(value * exp) / exp;
            }
            return Math.round(value);
        };

        // operators
        rivets.formatters['*'] = function(value, multiplier) {
            return value * multiplier;
        };
    }
})(rivets);