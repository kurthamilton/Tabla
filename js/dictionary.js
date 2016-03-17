(function() {
    'use strict';

    define(() => Dictionary);

    function Dictionary() {
        let index = {};
        let values = [];

        this.add = function(key, value) {
            if (this.containsKey(key)) {
                return;
            }

            index[key] = values.length;
            values.push(value);
        };

        this.containsKey = function(key) {
            return index.hasOwnProperty(key);
        };

        this.remove = function(key) {
            if (!this.containsKey(key)) {
                return;
            }

            values.splice(index[key], 1);
            delete index[key];
        };

        this.set = function(key, value) {
            if (this.containsKey(key)) {
                values[index[key]] = value;
                return;
            }

            this.add(key, value);
        };

        this.values = function() {
            return values.slice();
        };
    }
})();