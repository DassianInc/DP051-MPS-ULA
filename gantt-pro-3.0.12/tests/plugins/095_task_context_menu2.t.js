StartTest(function(t) {

    var g           = t.getGantt2({
        renderTo    : Ext.getBody(),
        forceFit    : true,
        width       : 500,
        plugins     : new Gnt.plugin.TaskContextMenu()
    });

    var dep     = g.dependencyStore.first(),
        task    = dep.getSourceTask();

    t.chain(
        { rightClick : function () { return g.getSchedulingView().getElementFromEventRecord(task); } },

        { moveCursorTo : '>> #deleteDependencyMenu' },

        { click : '>> #deleteDependencyMenu menuitem' },

        {
            waitFor : function () {
                return !Ext.Array.contains(task.successors, dep);
            },
            desc    : 'Should not find dependency in store after delete'
        },

        { rightClick : function () { return g.getSchedulingView().getElementFromEventRecord(task); } },

        { moveCursorTo : '>> #deleteDependencyMenu' },

        { waitFor : 500 },

        function () {
            t.notOk(t.cq1('#deleteDependencyMenu menuitem').el.isVisible(), 'Dependency item should not be visible');
        }
    )
});
