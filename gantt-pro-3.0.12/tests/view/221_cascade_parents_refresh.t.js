StartTest(function(t) {

    // #1484 make sure that parents of affected nodes get updated after task store cascade

    var g = t.getGantt2({
        renderTo        : Ext.getBody(),
        startDate       : new Date(2010, 0, 29),
        taskStore       : new Gnt.data.TaskStore({
            cascadeChanges  : true,
            root            : {
                expanded : true,
                children : [
                    {
                        "Id"        : 2,
                        "leaf"      : true,
                        "StartDate" : "2010-02-01",
                        "Duration"  : 1
                    },
                    {
                        "Id"        : 3,
                        "StartDate" : "2010-02-02",
                        "expanded"  : true,
                        "Duration"  : 1,
                        "children"  : [
                            {
                                "Id"        : 4,
                                "StartDate" : "2010-02-02",
                                "Duration"  : 1,
                                "expanded"  : true,
                                "children"  : [
                                    {
                                        "Id"        : 5,
                                        "leaf"      : true,
                                        "StartDate" : "2010-02-02",
                                        "Duration"  : 1
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        }),

        dependencyStore : new Gnt.data.DependencyStore({
            data : [
                { From : 2, To : 5 }
            ]
        })
    });

    var ts = g.taskStore;

    t.chain(
        { waitFor : 'rowsVisible' },

        function() {
            ts.getById(2).setDuration(2);

            t.matchGridCellContent(g.lockedGrid, 1, 1, '02/03/2010', 'task #3 row was refreshed');
        }
    );
});
