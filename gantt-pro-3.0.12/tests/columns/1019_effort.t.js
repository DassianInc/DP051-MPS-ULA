StartTest(function(t) {

    // Here we check that effort column shows the same value which is showed in its editor #950

    var editing = Ext.create('Sch.plugin.TreeCellEditing');

    var g = t.getGantt({
        renderTo    : Ext.getBody(),
        taskStore   : new Gnt.data.TaskStore({
            root : {
                children : [
                    {
                        Id              : 2,
                        leaf            : true,
                        StartDate       : new Date(2011, 6, 16, 11),
                        Duration        : 1.5,
                        Effort          : 6,
                        SchedulingMode  : 'EffortDriven'
                    }
                ]
            }
        }),
        plugins : editing,
        columns : [{
            xtype : 'effortcolumn'
        }]
    });

    var task = g.getTaskStore().getById(2);

    t.waitForRowsVisible(g, function () {
        var locked = g.lockedGrid;

        t.matchGridCellContent(locked, 0, 0, '6 hours', 'Column displays correct value');

        editing.startEdit(task, locked.headerCt.down('effortcolumn'));

        t.waitFor(
            function () { return editing.getActiveEditor(); },
            function () {
                t.is(editing.getActiveEditor().getValue(), 6, 'Editor has correct value');
            }
        );
    });
});
