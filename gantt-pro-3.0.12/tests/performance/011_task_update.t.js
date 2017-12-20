StartTest(function (t) {
    t.it('Changing the StartDate of a task with one parent should cause one update for each.', function (t) {

        var gantt = t.getGantt({
            renderTo       : Ext.getBody(),
            columns        : [
                { xtype : 'treecolumn' },
                { xtype : 'startdatecolumn' }
            ],
            startDate      : new Date(2010, 1, 1),
            endDate        : new Date(2010, 1, 2),
            plugins        : Ext.create('Sch.plugin.TreeCellEditing', { clicksToEdit : 1 }),
            cascadeChanges : false,
            taskStore      : new Gnt.data.TaskStore({
                root : {
                    children : [
                        {
                            Name      : 'Daddy',
                            expanded  : true,
                            StartDate : new Date(2010, 1, 1),
                            Duration  : 1,
                            children  : [
                                { leaf : true, Name : 'Child', StartDate : new Date(2010, 1, 1), Duration : 1 }
                            ]
                        }
                    ]
                }
            })
        });

        t.waitForEventsToRender(gantt, function () {
            var view = gantt.getSchedulingView(),
                ts = gantt.taskStore,
                root = ts.getRootNode(),
                task = root.firstChild.firstChild;

            t.chain(
                { action : 'click', target : t.getCell(gantt.lockedGrid, 1, 1) },

                { waitForSelectorAtCursor : 'input[type=text]:focus' },

                function (next) {
                    t.nbrUpdates = 0;
                    t.getElementAtCursor().value = '';

                    ts.on('update', function () {
                        t.nbrUpdates++;

                        if (t.nbrUpdates === 2)  next();
                    });

                    t.type('input[type=text]:focus', '02/04/2010[ENTER]', Ext.emptyFn);
                },

                function (next) {
                    t.is(t.nbrUpdates, 2, '2 updates fired, child and parent');
                    var parent = t.getFirstParentTask(gantt);
                    parent.collapse();
                    parent.expand();
                }
            );
        })
    })

    t.it('Changing the StartDate of a task with one parent should cause one update for each.', function (t) {

        var taskStore = Ext.create("Gnt.data.TaskStore", {
            cascadeChanges : true,
            root           : {
                expanded : true,

                children : [
                    {
                        Id        : 1,
                        leaf      : true,
                        StartDate : new Date(2011, 6, 4),
                        Duration  : 1
                    },
                    {
                        Id        : 2,
                        leaf      : true,
                        StartDate : new Date(2011, 6, 5),
                        Duration  : 1
                    }
                ]
            }
        });

        var gantt2 = t.getGantt({
            renderTo        : Ext.getBody(),
            startDate       : new Date(2011, 6, 1),
            endDate         : null,
            taskStore       : taskStore,
            dependencyStore : t.getDependencyStore({
                data : [
                    { From : 1, To : 2 }
                ]
            })
        });

        t.chain(
            { waitForTasksAndDependenciesToRender : gantt2 },

            function () {
                // Two rows should be refreshed (once) by the cascade
                t.willFireNTimes(gantt2.getSchedulingView(), 'itemupdate', 2);
                t.firesOk(taskStore, {
                    beforecascade : 1,
                    cascade       : 1
                });

                taskStore.getNodeById(1).setDuration(2);
            }
        )
    });
})
