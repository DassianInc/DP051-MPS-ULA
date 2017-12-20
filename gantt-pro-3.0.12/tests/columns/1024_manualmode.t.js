StartTest(function(t) {

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
                        SchedulingMode  : 'Manual'
                    }
                ]
            }
        }),
        plugins : editing,
        columns : [{
            xtype : 'manuallyscheduledcolumn'
        }]
    });

    var task = g.getTaskStore().getNodeById(2);

    t.waitForRowsVisible(g, function () {

        var locked = g.lockedGrid;

        t.matchGridCellContent(locked, 0, 0, 'Yes', 'Column displays correct value');

        editing.startEdit(task, locked.headerCt.down('manuallyscheduledcolumn'));

        t.chain(
            { waitFor : function () { return editing.getActiveEditor(); } },

            function (next) {
                editing.getActiveEditor().setValue(false);
                editing.completeEdit();
                next();
            },

            { waitForGridContent : [g.lockedGrid, 0, 0, 'No'] }
        );
    });
});