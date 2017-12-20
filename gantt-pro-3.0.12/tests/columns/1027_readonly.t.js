StartTest(function(t) {

    // Assert readonly column

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
                        Effort          : 6
                    }
                ]
            }
        }),
        plugins : editing,
        columns : [{
            xtype : 'readonlycolumn'
        }]
    });

    var task = g.getTaskStore().getNodeById(2);

    t.waitForRowsVisible(g, function () {

        var locked = g.lockedGrid;

        t.matchGridCellContent(locked, 0, 0, 'No', 'Column displays correct value');

        editing.startEdit(task, locked.headerCt.down('readonlycolumn'));

        t.chain(
            { waitFor : function () { return editing.getActiveEditor(); } },

            function (next) {
                editing.getActiveEditor().setValue(true);
                editing.completeEdit();
                next();
            },

            { waitForGridContent : [g.lockedGrid, 0, 0, 'Yes'] }
        );
    });
});