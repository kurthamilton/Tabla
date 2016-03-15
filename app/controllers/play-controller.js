(function(rivets) {
    'use strict';

    define(PlayController);

    function PlayController() {
        let scope = {

        };

        return {
            load: function() {
                bind();
            }
        };

        function bind() {
            let view = document.getElementById('play');
            rivets.bind(view, scope);
        }
    }
})(rivets);