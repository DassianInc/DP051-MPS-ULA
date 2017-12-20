Ext.define('Gnt.examples.performance.Functions', {

    statics : {

        meta : function(m, obj) {
            var result;

            if (arguments.length == 2) {
                obj.__meta__ = m;
                result       = obj;
            }
            else {
                result = Ext.isFunction(m) && m.__meta__ || null;
            }

            return result;
        }
    }

});
