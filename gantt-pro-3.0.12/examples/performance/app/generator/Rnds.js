Ext.define('Gnt.examples.performance.generator.Rnds', function (thisClass) {

    function random(min, max, rnd) {
        var result;

        switch (true) {
            case min !== undefined && max !== undefined:
                result = min + Math.floor((max - min) * rnd());
                break;
            case min !== undefined:
                result = Math.floor(min * rnd());
                break;
            default:
                result = rnd();
        }

        return result;
    }

    return {
        statics : {
            createNative : function() {
                return function(min, max) {
                    return random(min, max, function() { return Math.random(); });
                };
            },

            createStable : function(seed) {
                var rnd = new Math.seedrandom(seed);

                return function(min, max) {
                    return random(min, max, rnd);
                };
            }
        }
    };
});
