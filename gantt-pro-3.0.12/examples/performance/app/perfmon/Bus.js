Ext.define('Gnt.examples.performance.perfmon.Bus', {

    mixins : {
        observable : 'Ext.mixin.Observable'
    },

    constructor : function(config) {
        var me = this;
        me.mixins.observable.constructor.call(me, config);
    }
});
