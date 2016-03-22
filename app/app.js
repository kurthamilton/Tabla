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
        rivets.formatters.default = function(value, args) {
            return (typeof value !== 'undefined' && value !== null) ? value : args;
        };
        rivets.formatters.eq = function(value, args) {
            return value === args;
        };
    }
})(rivets);