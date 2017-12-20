Ext.define('Gnt.examples.performance.gantt.model.Task', {
    extend : 'Gnt.model.Task',

    normalize : function() {
        var me    = this,
            store = me.getTaskStore(),
            result;

        store && store.performanceBus.fireEvent('data-normalization', 'data-normalization-done');
        result = me.callParent(arguments);
        store && store.performanceBus.fireEvent('data-normalization-done');

        return result;
    },

    propagateChanges : function(changer, callback, forceCascadeChanges) {
        var me = this,
            store = me.getTaskStore();

        store && store.performanceBus.fireEvent('propagate-changes', 'propagate-changes-done');

        return me.callParent([changer, function() {
            callback && callback.apply(null, arguments);
            store && store.performanceBus.fireEvent('propagate-changes-done');
        }, forceCascadeChanges]);
    }
});
