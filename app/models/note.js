(function() {
    'use strict';

    define(() => Note);

    const effects = ['hammeron', 'pulloff', 'slide'];

    function Note(options) {
        let note = this;

        this.bar = options.bar;
        this.crotchet = options.crotchet;
        this.effects = options.effects || {};
        this.fret = options.fret;
        this.quaver = options.quaver;
        this.string = options.string;

        this.addEffect = addEffect;
        this.hasEffect = hasEffect;
        this.removeEffect = removeEffect;
        this.toggleEffect = toggleEffect;
        this.volume = volume;

        function addEffect(name) {
            let effect = getEffect(name);
            if (!effect) {
                return;
            }

            note.effects[effect.name] = true;
        }

        function getEffect(name) {
            let index = effects.indexOf(name.toLowerCase());
            if (index < 0) {
                return null;
            }

            return {
                name: effects[index]
            };
        }

        function hasEffect(name) {
            let effect = getEffect(name);
            if (!effect) {
                return false;
            }
            return note.effects.hasOwnProperty(effect.name) && note.effects[effect.name] === true;
        }

        function removeEffect(name) {
            let effect = getEffect(name);
            if (!effect) {
                return;
            }

            note.effects[effect.name] = false;
        }

        function toggleEffect(name) {
            hasEffect(name) ? removeEffect(name) : addEffect(name);
            return hasEffect(name);
        }

        function volume() {
            let volume = 1;
            effects.forEach(name => {
                if (hasEffect(name)) {
                    volume = 0.5;
                    return;
                }
            })
            return volume;
        }
    }
})();