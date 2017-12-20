StartTest(function(t) {

    var editing = Ext.create('Sch.plugin.TreeCellEditing', { clicksToEdit: 1 });

    var g = t.getGantt({
        renderTo    : Ext.getBody(),
        plugins     : editing,
        taskStore : t.getTaskStore({
            DATA : [
                {
                    StartDate : new Date(2010, 1, 1),
                    EndDate : new Date(2010, 1, 5),
                    leaf : true
                }, {
                    StartDate : new Date(2010, 1, 1),
                    EndDate : new Date(2010, 1, 15),
                    leaf : true
                }
            ]
        }),
        columns : [
            { xtype : 'treecolumn' },
            { xtype : 'enddatecolumn' }
        ]
    });

    t.willFireNTimes(g.taskStore, 'update', 0);

    t.waitForEventsToRender(g, function () {

        var endDateCol = g.lockedGrid.headerCt.items.last();
        var first = g.taskStore.getRootNode().childNodes[0];
        var last = g.taskStore.getRootNode().childNodes[1];

        t.chain(
            function (next) {
                editing.startEdit(first, endDateCol);
                next();
            },

            { waitFor : 500 },

            function(next){
                editing.startEdit(last, endDateCol);
                next();
            }

        );
    })
});
