Ext.define('Gnt.examples.performance.gantt.view.Gantt', {
    extend : 'Gnt.view.Gantt',
    xtype  : 'performance_ganttview',

    initDependencies : function() {
        var me = this;

        me.callParent();

        if (me.dependencyView) {
            me.dependencyView.renderDependenciesOrig = me.dependencyView.renderDependencies;
            me.dependencyView.renderDependencies = function() {
                var me = this,
                    result;

                me.ganttView.grid.ownerCt.performanceBus.fireEvent('gantt-deps-render', 'gantt-deps-render-done');
                result = me.renderDependenciesOrig.apply(me, arguments);
                me.ganttView.grid.ownerCt.performanceBus.fireEvent('gantt-deps-render-done');

                return result;
            };
        }
    },

    renderTHead : function(values, out, parent) {
        var me = this;

        me.grid.ownerCt.performanceBus.fireEvent('gantt-tasks-render', 'gantt-tasks-render-done');

        return me.callParent([values, out, parent]);
    },

    renderTFoot : function(values, out, parent) {
        var me = this,
            result = me.callParent([values, out, parent]);

        me.grid.ownerCt.performanceBus.fireEvent('gantt-tasks-render-done');

        return result;
    }
});
