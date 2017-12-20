Ext.define('Gnt.examples.performance.gantt.data.TaskStore', {
    extend : 'Gnt.data.TaskStore',

    model  : 'Gnt.examples.performance.gantt.model.Task',

    linearWalkDependentTasks : function() {
        var me = this,
            result;

        me.performanceBus.fireEvent('linearization', 'linearization-done');
        result = me.callParent(arguments);
        me.performanceBus.fireEvent('linearization-done');

        return result;
    }
});
