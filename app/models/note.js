(function() {
    'use strict';

    define(() => Note);

    const effects = ['hammeron', 'pulloff', 'slideup', 'slidedown'];

    function Note(options) {
        let note = this;

        this.bar = options.bar;
        this.crotchet = options.crotchet;
        this.effect = options.effect || '';
        this.fret = options.fret;
        this.quaver = options.quaver;
        this.string = options.string;

        this.hasEffect = hasEffect;
        this.toggleEffect = toggleEffect;
        this.volume = volume;

        function hasEffect(name) {
            return note.effect === name;
        }

        function isEffect(name) {
            return effects.indexOf(name) >= 0;
        }

        function toggleEffect(name) {
            if (!isEffect(name)) {
                return;
            }

            note.effect = (hasEffect(name) ? '' : name);
            return hasEffect(name);
        }

        function volume() {
            if (hasEffect('hammeron')) {
                return 0.5;
            }
            return 1;
        }
    }
})();