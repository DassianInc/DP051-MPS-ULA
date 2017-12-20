StartTest(function(t) {

    var getDataSet = function () {
        var dependencyStore = Ext.create("Gnt.data.DependencyStore", {
            data    : [
                {
                    From        : 1,
                    To          : 4,
                    Type        : 2,
                    Lag         : 8,
                    LagUnit     : 'h',
                    Id          : 'dep1'

                },
                {
                    From        : 2,
                    To          : 3,
                    Type        : 2,
                    Lag         : -2,
                    LagUnit     : 'h',
                    Id          : 'dep2'
                },
                {
                    From        : 6,
                    To          : 7,
                    Type        : 0,
                    Lag         : 10,
                    LagUnit     : 'mi',
                    Id          : 'dep3'
                },
                {
                    From        : 5,
                    To          : 7,
                    Type        : 0,
                    Lag         : 20 * 60 * 1000, // 20 min
                    LagUnit     : 'ms',
                    Id          : 'dep4'
                }
            ]
        });


        var taskStore = Ext.create("Gnt.data.TaskStore", {
            dependencyStore : dependencyStore,
            calendar        : new Gnt.data.calendar.BusinessTime(),
            root            : {
                expanded    : false,

                children    : [
                    {
                        Id          : 1,
                        leaf        : true,
                        StartDate   : new Date(2011, 5, 1, 8),
                        EndDate     : new Date(2011, 5, 2, 17)
                    },
                    {
                        Id          : 123,
                        StartDate   : new Date(2011, 5, 15, 8),
                        EndDate     : new Date(2011, 5, 22, 17),
                        children    : [
                            {
                                Id          : 2,
                                leaf        : true,
                                StartDate   : new Date(2011, 5, 16, 8),
                                EndDate     : new Date(2011, 5, 21, 17)
                            },
                            {
                                Id          : 3,
                                leaf        : true,
                                StartDate   : new Date(2011, 5, 18, 8),
                                EndDate     : new Date(2011, 5, 21, 17)
                            }
                        ]
                    },
                    {
                        Id          : 4,
                        leaf        : true,
                        StartDate   : new Date(2011, 5, 6, 8),
                        EndDate     : new Date(2011, 5, 7, 17)
                    },
                    {
                        Id          : 5,
                        leaf        : true,
                        StartDate   : new Date(2011, 5, 28, 8),
                        EndDate     : new Date(2011, 5, 29, 17)
                    },
                    {
                        Id          : 6,
                        leaf        : true,
                        StartDate   : new Date(2011, 5, 28, 8),
                        EndDate     : new Date(2011, 5, 28, 17)
                    },
                    {
                        Id          : 7,
                        leaf        : true,
                        StartDate   : new Date(2011, 5, 28, 8),
                        EndDate     : new Date(2011, 5, 28, 17)
                    }
                ]
            }
        });

        return {
            taskStore       : taskStore,
            dependencyStore : dependencyStore
        }
    }

    var dataSet         = getDataSet(),
        taskStore       = dataSet.taskStore,
        dependencyStore = dataSet.dependencyStore,
        task1           = taskStore.getNodeById(1),
        task2           = taskStore.getNodeById(2),
        task3           = taskStore.getNodeById(3),
        task4           = taskStore.getNodeById(4),
        task5           = taskStore.getNodeById(5),
        task7           = taskStore.getNodeById(7);

    t.it('Setup', function(t) {
        t.ok(taskStore.getRootNode().childNodes.length, 'There are some tasks');
    });


    t.it('Constraints', function(t) {
        // task4 is constrained by task1 - iow it should start after task1 + 8h lag
        // task1 ends 06/02 17:00, +8h means 06/03 17:00
        t.isDeeply(task4.getIncomingDependenciesConstraintContext(), {
            startDate           : new Date(2011, 5, 3, 17),
            endDate             : null,
            constrainingTask    : task1
        },  "Correct constrain context for `task4`");

        var dataSet2            = getDataSet();

        var task42              = dataSet2.taskStore.getNodeById(4);

        task42.alignByIncomingDependencies();

        t.is(task42.getStartDate(), new Date(2011, 5, 6, 8), 'Constraining task actually moves it over the weekend');

        // task3 is constrained by task2 - iow it should start after task2 - 2h lag
        t.isDeeply(task3.getIncomingDependenciesConstraintContext(), {
            startDate           : new Date(2011, 5, 21, 15),
            endDate             : null,
            constrainingTask    : task2
        },  "Correct constrain context for `task3`, negative 2h lag ok");

        // task7 is constrained by task5 and task6
        // but the constrain from task5 is more strict (20mins instead of 10mins for task 6)
        t.isDeeply(task7.getIncomingDependenciesConstraintContext(), {
            startDate           : new Date(2011, 5, 28, 8, 20),
            endDate             : null,
            constrainingTask    : task5
        },  "Correct constrain context for `task7`");
    });

    //======================================================================================================================================================================================================================================================
    t.it('Cascading', function(t) {
        taskStore.cascadeChangesForTask(task1);

        t.is(task4.getStartDate(), new Date(2011, 5, 6, 8), 'Correct dates for `task4` after cascade');

        // Change to Finish-to-Start link and set 3 minute lag
        dependencyStore.getById('dep4').set({
            Type    : 2,
            Lag     : 3,
            LagUnit : 'mi'
        });
        taskStore.cascadeChangesForTask(task5);

        // task7 has 2 incoming dependencies
        // and dependency from task 5 takes priority, since it moves task further in time
        t.is(task7.get('StartDate'), new Date(2011, 5, 30, 8, 3), 'Correct dates for `task7` after updating dependency type');

        // Change to Finish-to-Start link and set lag to -2days
        // now the dependency from task 6 should take priority, since dependency from task7 constrain to 06/28 08:00
        // and dependecy from task 6 - to 06/28 08:10
        dependencyStore.getById('dep4').set({
            Type    : 2,
            Lag     : -2,
            LagUnit : 'd'
        });
        taskStore.cascadeChangesForTask(task5);

        t.is(task7.get('StartDate'), new Date(2011, 5, 28, 8, 10), 'Correct dates for `task7` after updating dependency type');
    });
});
