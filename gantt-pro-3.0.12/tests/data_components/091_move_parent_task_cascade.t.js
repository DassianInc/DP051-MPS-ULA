StartTest(function(t) {
    // hint: to understand what's going on in the tests you need to actually draw the tasks with dates on paper

    var getDataSet = function (taskStoreData, dependenciesData) {
        var dependencyStore = Ext.create("Gnt.data.DependencyStore", {
            data    : dependenciesData || []
        });


        var taskStore = Ext.create("Gnt.data.TaskStore", {
            dependencyStore     : dependencyStore,
            cascadeChanges      : true,
            cascadeDelay        : 0,

            root                : {
                expanded    : true,
                children    : taskStoreData
            }
        });

        return {
            taskStore       : taskStore,
            dependencyStore : dependencyStore
        }
    }

    t.it('Move parent and cascade to outside of that parent. Also recalculate the parent of the parent being moved', function (t) {
        var taskStore       = getDataSet(
            [
                {
                    Id          : 1,
                    StartDate   : new Date(2013, 8, 2),
                    Duration    : 5,
                    children    : [
                        {
                            Id          : 2,
                            leaf        : true,
                            StartDate   : new Date(2013, 8, 2),
                            Duration    : 2
                        },
                        {
                            Id          : 10,
                            StartDate   : new Date(2013, 8, 3),
                            Duration    : 3,
                            children    : [
                                {
                                    Id          : 11,
                                    leaf        : true,
                                    StartDate   : new Date(2013, 8, 3),
                                    Duration    : 1
                                },
                                {
                                    Id          : 12,
                                    leaf        : true,
                                    StartDate   : new Date(2013, 8, 5),
                                    Duration    : 1
                                }
                            ]
                        },
                        {
                            Id          : 3,
                            leaf        : true,
                            StartDate   : new Date(2013, 8, 6),
                            Duration    : 1
                        }
                    ]
                },
                {
                    Id          : 4,
                    leaf        : true,
                    StartDate   : new Date(2013, 8, 9),
                    Duration    : 2
                }
            ],
            [
                {
                    From        : 12,
                    To          : 3
                },
                {
                    From        : 3,
                    To          : 4
                }
            ]
        ).taskStore

        var id         = function (id) { return taskStore.getNodeById(id) }

        t.firesOk(taskStore, 'cascade', 2, 'Should fire only 2 cascades to avoid extra full view refreshes')

        taskStore.on('cascade', function (taskStore, context) {
            t.ok(id(10).internalId in context.affected, "The affected child task is included in the cascade context")
            t.ok(id(11).internalId in context.affected, "The affected child task is included in the cascade context")
            t.ok(id(12).internalId in context.affected, "The affected child task is included in the cascade context")
        }, null, { single : true })

        id(10).setStartDate(new Date(2013, 8, 5), true, true)

        t.isStartEnd(id(1), new Date(2013, 8, 2), new Date(2013, 8, 11), 'Task1 has been moved correctly')
        t.isStartEnd(id(2), new Date(2013, 8, 2), new Date(2013, 8, 4), 'Task2 has been moved correctly')
        t.isStartEnd(id(10), new Date(2013, 8, 5), new Date(2013, 8, 10), 'Task10 has been moved correctly')
        t.isStartEnd(id(11), new Date(2013, 8, 5), new Date(2013, 8, 6), 'Task11 has been moved correctly')
        t.isStartEnd(id(12), new Date(2013, 8, 9), new Date(2013, 8, 10), 'Task12 has been moved correctly')
        t.isStartEnd(id(3), new Date(2013, 8, 10), new Date(2013, 8, 11), 'Task3 has been moved correctly')
        t.isStartEnd(id(4), new Date(2013, 8, 11), new Date(2013, 8, 13), 'Task4 has been moved correctly')

        id(10).setStartDate(new Date(2013, 8, 2), true, true)

        t.isStartEnd(id(1), new Date(2013, 8, 2), new Date(2013, 8, 6), 'Task1 has been moved correctly')
        t.isStartEnd(id(2), new Date(2013, 8, 2), new Date(2013, 8, 4), 'Task2 has been moved correctly')
        t.isStartEnd(id(10), new Date(2013, 8, 2), new Date(2013, 8, 5), 'Task10 has been moved correctly')
        t.isStartEnd(id(11), new Date(2013, 8, 2), new Date(2013, 8, 3), 'Task11 has been moved correctly')
        t.isStartEnd(id(12), new Date(2013, 8, 4), new Date(2013, 8, 5), 'Task12 has been moved correctly')
        t.isStartEnd(id(3), new Date(2013, 8, 5), new Date(2013, 8, 6), 'Task3 has been moved correctly')
        t.isStartEnd(id(4), new Date(2013, 8, 6), new Date(2013, 8, 10), 'Task4 has been moved correctly')

    })


    // same thing, but moving the top-most parent, cascading is caused by the dependency from the parent task, which is child of the task being moved
    t.it('Move parent and cascade to outside of that parent, caused by the sub-parent', function (t) {
        var taskStore       = getDataSet(
            [
                {
                    Id          : 1,
                    StartDate   : new Date(2013, 8, 2),
                    Duration    : 5,
                    children    : [
                        {
                            Id          : 2,
                            leaf        : true,
                            StartDate   : new Date(2013, 8, 2),
                            Duration    : 2
                        },
                        {
                            Id          : 10,
                            StartDate   : new Date(2013, 8, 3),
                            Duration    : 3,
                            children    : [
                                {
                                    Id          : 11,
                                    leaf        : true,
                                    StartDate   : new Date(2013, 8, 3),
                                    Duration    : 1
                                },
                                {
                                    Id          : 12,
                                    leaf        : true,
                                    StartDate   : new Date(2013, 8, 5),
                                    Duration    : 1
                                }
                            ]
                        },
                        {
                            Id          : 3,
                            leaf        : true,
                            StartDate   : new Date(2013, 8, 6),
                            Duration    : 1
                        }
                    ]
                },
                {
                    Id          : 4,
                    leaf        : true,
                    StartDate   : new Date(2013, 8, 9),
                    Duration    : 2
                }
            ],
            [
                {
                    From        : 12,
                    To          : 3
                },
                {
                    From        : 10,
                    To          : 4
                }
            ]
        ).taskStore

        var id         = function (id) { return taskStore.getNodeById(id) }

        t.firesOk(taskStore, 'cascade', 2, 'Should fire only 2 cascades to avoid extra full view refreshes')

        id(1).setStartDate(new Date(2013, 8, 3), true, true)

        taskStore.on('cascade', function (taskStore, context) {
            t.ok(id(1).internalId in context.affected, "The affected child task is included in the cascade context")
            t.ok(id(2).internalId in context.affected, "The affected child task is included in the cascade context")
            t.ok(id(11).internalId in context.affected, "The affected child task is included in the cascade context")
            t.ok(id(12).internalId in context.affected, "The affected child task is included in the cascade context")
        }, null, { single : true })

        t.isStartEnd(id(1), new Date(2013, 8, 3), new Date(2013, 8, 10), 'Task1 has been moved correctly')
        t.isStartEnd(id(2), new Date(2013, 8, 3), new Date(2013, 8, 5), 'Task2 has been moved correctly')
        t.isStartEnd(id(10), new Date(2013, 8, 4), new Date(2013, 8, 7), 'Task10 has been moved correctly')
        t.isStartEnd(id(11), new Date(2013, 8, 4), new Date(2013, 8, 5), 'Task11 has been moved correctly')
        t.isStartEnd(id(12), new Date(2013, 8, 6), new Date(2013, 8, 7), 'Task12 has been moved correctly')
        t.isStartEnd(id(3), new Date(2013, 8, 9), new Date(2013, 8, 10), 'Task3 has been moved correctly')
        t.isStartEnd(id(4), new Date(2013, 8, 9), new Date(2013, 8, 11), 'Task4 has been moved correctly')

        id(1).setStartDate(new Date(2013, 8, 5), true, true)

        t.isStartEnd(id(1), new Date(2013, 8, 5), new Date(2013, 8, 12), 'Task1 has been moved correctly')
        t.isStartEnd(id(2), new Date(2013, 8, 5), new Date(2013, 8, 7), 'Task2 has been moved correctly')
        t.isStartEnd(id(10), new Date(2013, 8, 6), new Date(2013, 8, 11), 'Task10 has been moved correctly')
        t.isStartEnd(id(11), new Date(2013, 8, 6), new Date(2013, 8, 7), 'Task11 has been moved correctly')
        t.isStartEnd(id(12), new Date(2013, 8, 10), new Date(2013, 8, 11), 'Task12 has been moved correctly')
        t.isStartEnd(id(3), new Date(2013, 8, 11), new Date(2013, 8, 12), 'Task3 has been moved correctly')
        t.isStartEnd(id(4), new Date(2013, 8, 11), new Date(2013, 8, 13), 'Task4 has been moved correctly')
    })
});
