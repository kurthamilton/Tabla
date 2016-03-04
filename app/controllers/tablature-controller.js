(function() {
    'use strict';

    define(() => new TablatureController());

    function TablatureController() {
        const controller = 'tablature';

        this.index = function() {

        };
    }

    function Scope() {

    }

    // todo: move out of this controller
    function bind(controller, action, model) {
        let view = document.getElementById(`${controller}.${action}`);
        return rivets.bind(view, model);
    }
})();