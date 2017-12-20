describe('A dependency to a task that is currently in a collapsed parent should work fine', function (t) {
    var ds = {
        "tasks" : [
            {
                "Id"        : 2,
                "leaf"      : true,
                "StartDate" : "2010-02-01",
                "Duration"  : 1
            },
            {
                "Id"        : 3,
                "StartDate" : "2010-02-02",
                "expanded"  : false,
                "Duration"  : 1,
                "children"  : [
                    {
                        "Id"        : 4,
                        "StartDate" : "2010-02-02",
                        "Duration"  : 1,
                        "expanded"  : false,
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
    };

    var g = t.getGantt2({
        renderTo        : Ext.getBody(),
        startDate       : new Date(2010, 0, 29),
        taskStore       : new Gnt.data.TaskStore({
            cascadeChanges  : true,
            root            : {
                expanded : true,
                children : ds.tasks
            }
        }),

        dependencyStore : new Gnt.data.DependencyStore({
            data : [
                {"From" : 2, "To" : 5 }
            ]
        })
    });

    var ts = g.taskStore;

    t.chain(
        { waitFor : 'rowsVisible' },

        function() {
            ts.getNodeById(2).setDuration(10);
        }
    )
})
