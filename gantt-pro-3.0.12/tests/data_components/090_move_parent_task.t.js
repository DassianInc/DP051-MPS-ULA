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

    // simplest possible case, parent with 2 children, w/o dependecies
    // moving it to the next week, then to middle week and then back to Monday
    // original dates should be restored at the end
    t.it('Changing the start/end date of the parent task should also move its child tasks, and keep their relative positions', function (t) {
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
                            Id          : 3,
                            leaf        : true,
                            StartDate   : new Date(2013, 8, 6),
                            Duration    : 1
                        }
                    ]
                }
            ]
        ).taskStore

        var task1           = taskStore.getNodeById(1)
        var task2           = taskStore.getNodeById(2)
        var task3           = taskStore.getNodeById(3)

        // moving +1 week
        task1.setStartDate(new Date(2013, 8, 9), true, true)

        t.isStartEnd(task1, new Date(2013, 8, 9), new Date(2013, 8, 14), 'Parent task itself has been moved +1 week')
        t.isStartEnd(task2, new Date(2013, 8, 9), new Date(2013, 8, 11), '1st child has been moved +1 week')
        t.isStartEnd(task3, new Date(2013, 8, 13), new Date(2013, 8, 14), '2nd child has been moved +1 week')

        // moving middle week
        task1.setStartDate(new Date(2013, 8, 4), true, true)

        t.isStartEnd(task1, new Date(2013, 8, 4), new Date(2013, 8, 11), 'Parent task itself has been moved')
        t.isStartEnd(task2, new Date(2013, 8, 4), new Date(2013, 8, 6), '1st child has been moved')
        t.isStartEnd(task3, new Date(2013, 8, 10), new Date(2013, 8, 11), '2nd child has been moved')

        t.is(task1.getTaskStore().getProjectionLevel(), 0);
        t.is(task1.getTaskStore().batchCascadeLevel, 0);

        // moving back
        task1.setStartDate(new Date(2013, 8, 2), true, true)

        t.isStartEnd(task1, new Date(2013, 8, 2), new Date(2013, 8, 7), 'Parent task position has been restored')
        t.isStartEnd(task2, new Date(2013, 8, 2), new Date(2013, 8, 4), '1st child has been restored')
        t.isStartEnd(task3, new Date(2013, 8, 6), new Date(2013, 8, 7), '2nd child has been restored')

        // moving +1 week via end date
        task1.setEndDate(new Date(2013, 8, 14), true, true)

        t.isStartEnd(task1, new Date(2013, 8, 9), new Date(2013, 8, 14), 'Parent task itself has been moved +1 week')
        t.isStartEnd(task2, new Date(2013, 8, 9), new Date(2013, 8, 11), '1st child has been moved +1 week')
        t.isStartEnd(task3, new Date(2013, 8, 13), new Date(2013, 8, 14), '2nd child has been moved +1 week')

        // moving middle week via end date
        task1.setEndDate(new Date(2013, 8, 11), true, true)

        t.isStartEnd(task1, new Date(2013, 8, 4), new Date(2013, 8, 11), 'Parent task itself has been moved')
        t.isStartEnd(task2, new Date(2013, 8, 4), new Date(2013, 8, 6), '1st child has been moved')
        t.isStartEnd(task3, new Date(2013, 8, 10), new Date(2013, 8, 11), '2nd child has been moved')

        // moving back via end date
        task1.setEndDate(new Date(2013, 8, 7), true, true)

        t.isStartEnd(task1, new Date(2013, 8, 2), new Date(2013, 8, 7), 'Parent task position has been restored')
        t.isStartEnd(task2, new Date(2013, 8, 2), new Date(2013, 8, 4), '1st child has been restored')
        t.isStartEnd(task3, new Date(2013, 8, 6), new Date(2013, 8, 7), '2nd child has been restored')
    })


    // now the same case, but tasks have dependency between them
    // 1) changing the parent position should trigger cascade and update the duration of parent task
    // 2) then we set the parent start date, so that
    // 3) restoring original start date will not restore the original dates of all tasks
    t.it('Changing the start date of the parent task should also move its child tasks, and cause a cascade', function (t) {
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
                            Id          : 3,
                            leaf        : true,
                            StartDate   : new Date(2013, 8, 6),
                            Duration    : 1
                        }
                    ]
                }
            ],
            [
                {
                    From        : 2,
                    To          : 3
                }
            ]
        ).taskStore

        var task1           = taskStore.getNodeById(1)
        var task2           = taskStore.getNodeById(2)
        var task3           = taskStore.getNodeById(3)

        // moving +1 week
        task1.setStartDate(new Date(2013, 8, 9), true, true)

        t.isStartEnd(task1, new Date(2013, 8, 9), new Date(2013, 8, 12), 'Parent task itself has been moved')
        t.isStartEnd(task2, new Date(2013, 8, 9), new Date(2013, 8, 11), '1st child has been moved')
        t.isStartEnd(task3, new Date(2013, 8, 11), new Date(2013, 8, 12), '2nd child has been moved')

        // moving middle week
        task1.setStartDate(new Date(2013, 8, 5), true, true)

        t.isStartEnd(task1, new Date(2013, 8, 5), new Date(2013, 8, 10), 'Parent task itself has been moved')
        t.isStartEnd(task2, new Date(2013, 8, 5), new Date(2013, 8, 7), '1st child has been moved')
        t.isStartEnd(task3, new Date(2013, 8, 9), new Date(2013, 8, 10), '2nd child has been moved')

        // moving back
        task1.setStartDate(new Date(2013, 8, 2), true, true)

        t.isStartEnd(task1, new Date(2013, 8, 2), new Date(2013, 8, 5), 'Parent task itself has been moved')
        t.isStartEnd(task2, new Date(2013, 8, 2), new Date(2013, 8, 4), '1st child has been moved')
        t.isStartEnd(task3, new Date(2013, 8, 4), new Date(2013, 8, 5), '2nd child has been moved')
    })


    // same as before, but changing end date instead of start date
    t.it('Changing the end date of the parent task should also move its child tasks, and cause a cascade', function (t) {
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
                            Id          : 3,
                            leaf        : true,
                            StartDate   : new Date(2013, 8, 6),
                            Duration    : 1
                        }
                    ]
                }
            ],
            [
                {
                    From        : 2,
                    To          : 3
                }
            ]
        ).taskStore

        var task1           = taskStore.getNodeById(1)
        var task2           = taskStore.getNodeById(2)
        var task3           = taskStore.getNodeById(3)

        // moving +1 week via end date
        task1.setEndDate(new Date(2013, 8, 14), true, true)

        t.isStartEnd(task1, new Date(2013, 8, 9), new Date(2013, 8, 12), 'Parent task itself has been moved')
        t.isStartEnd(task2, new Date(2013, 8, 9), new Date(2013, 8, 11), '1st child has been moved')
        t.isStartEnd(task3, new Date(2013, 8, 11), new Date(2013, 8, 12), '2nd child has been moved')

        // moving middle week via end date
        task1.setEndDate(new Date(2013, 8, 10), true, true)

        t.isStartEnd(task1, new Date(2013, 8, 5), new Date(2013, 8, 10), 'Parent task itself has been moved')
        t.isStartEnd(task2, new Date(2013, 8, 5), new Date(2013, 8, 7), '1st child has been moved')
        t.isStartEnd(task3, new Date(2013, 8, 9), new Date(2013, 8, 10), '2nd child has been moved')

        // moving back via end date
        task1.setEndDate(new Date(2013, 8, 5), true, true)

        t.isStartEnd(task1, new Date(2013, 8, 2), new Date(2013, 8, 5), 'Parent task itself has been moved')
        t.isStartEnd(task2, new Date(2013, 8, 2), new Date(2013, 8, 4), '1st child has been moved')
        t.isStartEnd(task3, new Date(2013, 8, 4), new Date(2013, 8, 5), '2nd child has been moved')
    })



    // now the case when there's a nested parent task
    t.it('Nested parent tasks, no cascading', function (t) {
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
                }
            ]
        ).taskStore

        var id         = function (id) { return taskStore.getNodeById(id) }

        // moving +1 week
        id(1).setStartDate(new Date(2013, 8, 9), true, true)

        t.isStartEnd(id(1), new Date(2013, 8, 9), new Date(2013, 8, 14), 'Parent task itself has been moved')
        t.isStartEnd(id(2), new Date(2013, 8, 9), new Date(2013, 8, 11), '1st child has been moved')
        t.isStartEnd(id(3), new Date(2013, 8, 13), new Date(2013, 8, 14), '2nd child has been moved')
        t.isStartEnd(id(10), new Date(2013, 8, 10), new Date(2013, 8, 13), '2nd child has been moved')
        t.isStartEnd(id(11), new Date(2013, 8, 10), new Date(2013, 8, 11), '2nd child has been moved')
        t.isStartEnd(id(12), new Date(2013, 8, 12), new Date(2013, 8, 13), '2nd child has been moved')

        // moving middle week
        id(1).setStartDate(new Date(2013, 8, 3), true, true)

        t.isStartEnd(id(1), new Date(2013, 8, 3), new Date(2013, 8, 10), 'Parent task itself has been moved')
        t.isStartEnd(id(2), new Date(2013, 8, 3), new Date(2013, 8, 5), '1st child has been moved')
        t.isStartEnd(id(3), new Date(2013, 8, 9), new Date(2013, 8, 10), '2nd child has been moved')
        t.isStartEnd(id(10), new Date(2013, 8, 4), new Date(2013, 8, 7), '2nd child has been moved')
        t.isStartEnd(id(11), new Date(2013, 8, 4), new Date(2013, 8, 5), '2nd child has been moved')
        t.isStartEnd(id(12), new Date(2013, 8, 6), new Date(2013, 8, 7), '2nd child has been moved')

        // moving back
        id(1).setStartDate(new Date(2013, 8, 2), true, true)

        t.isStartEnd(id(1), new Date(2013, 8, 2), new Date(2013, 8, 7), 'Parent task itself has been moved')
        t.isStartEnd(id(2), new Date(2013, 8, 2), new Date(2013, 8, 4), '1st child has been moved')
        t.isStartEnd(id(3), new Date(2013, 8, 6), new Date(2013, 8, 7), '2nd child has been moved')
        t.isStartEnd(id(10), new Date(2013, 8, 3), new Date(2013, 8, 6), '2nd child has been moved')
        t.isStartEnd(id(11), new Date(2013, 8, 3), new Date(2013, 8, 4), '2nd child has been moved')
        t.isStartEnd(id(12), new Date(2013, 8, 5), new Date(2013, 8, 6), '2nd child has been moved')


        // moving +1 week via end date
        id(1).setEndDate(new Date(2013, 8, 14), true, true)

        t.isStartEnd(id(1), new Date(2013, 8, 9), new Date(2013, 8, 14), 'Parent task itself has been moved')
        t.isStartEnd(id(2), new Date(2013, 8, 9), new Date(2013, 8, 11), '1st child has been moved')
        t.isStartEnd(id(3), new Date(2013, 8, 13), new Date(2013, 8, 14), '2nd child has been moved')
        t.isStartEnd(id(10), new Date(2013, 8, 10), new Date(2013, 8, 13), '2nd child has been moved')
        t.isStartEnd(id(11), new Date(2013, 8, 10), new Date(2013, 8, 11), '2nd child has been moved')
        t.isStartEnd(id(12), new Date(2013, 8, 12), new Date(2013, 8, 13), '2nd child has been moved')

        // moving middle week via end date
        id(1).setEndDate(new Date(2013, 8, 10), true, true)

        t.isStartEnd(id(1), new Date(2013, 8, 3), new Date(2013, 8, 10), 'Parent task itself has been moved')
        t.isStartEnd(id(2), new Date(2013, 8, 3), new Date(2013, 8, 5), '1st child has been moved')
        t.isStartEnd(id(3), new Date(2013, 8, 9), new Date(2013, 8, 10), '2nd child has been moved')
        t.isStartEnd(id(10), new Date(2013, 8, 4), new Date(2013, 8, 7), '2nd child has been moved')
        t.isStartEnd(id(11), new Date(2013, 8, 4), new Date(2013, 8, 5), '2nd child has been moved')
        t.isStartEnd(id(12), new Date(2013, 8, 6), new Date(2013, 8, 7), '2nd child has been moved')

        // moving back via end date
        id(1).setEndDate(new Date(2013, 8, 7), true, true)

        t.isStartEnd(id(1), new Date(2013, 8, 2), new Date(2013, 8, 7), 'Parent task itself has been moved')
        t.isStartEnd(id(2), new Date(2013, 8, 2), new Date(2013, 8, 4), '1st child has been moved')
        t.isStartEnd(id(3), new Date(2013, 8, 6), new Date(2013, 8, 7), '2nd child has been moved')
        t.isStartEnd(id(10), new Date(2013, 8, 3), new Date(2013, 8, 6), '2nd child has been moved')
        t.isStartEnd(id(11), new Date(2013, 8, 3), new Date(2013, 8, 4), '2nd child has been moved')
        t.isStartEnd(id(12), new Date(2013, 8, 5), new Date(2013, 8, 6), '2nd child has been moved')
    });
    
    t.it("Should move parent node with mode 'Manual'", function (t) {
        var taskStore       = getDataSet(
            [
                {
                    Id          : 1,
                    StartDate   : new Date(2013, 8, 2),
                    Duration    : 5,
                    ManuallyScheduled  : true,
                    children    : [
                        {
                            Id          : 2,
                            leaf        : true,
                            StartDate   : new Date(2013, 8, 2),
                            Duration    : 2
                        },
                        {
                            Id          : 3,
                            leaf        : true,
                            StartDate   : new Date(2013, 8, 6),
                            Duration    : 1
                        }
                    ]
                }
            ]
        ).taskStore

        var id         = function (id) { return taskStore.getNodeById(id) };

        var task = id(1);
        
        task.setStartDate(new Date(2013, 8, 4));
        t.is(task.getStartDate(), new Date(2013, 8, 4), 'Start date changed');
        t.is(task.getEndDate(), new Date(2013, 8, 11), "End date complies with the calendars");
        t.is(task.getDuration(), 5, "Duration hasn't changed");
        
        task.setStartDate(new Date(2013, 8, 1));
        t.is(task.getStartDate(), new Date(2013, 8, 2), 'Start date changed, calendars has been taken into account');
        t.is(task.getEndDate(), new Date(2013, 8, 7), 'End date complies with the calendars');
        t.is(task.getDuration(), 5, "Duration hasn't changed");
    });

    t.it('Should NOT move child node with mode \'Manual\'', function (t) {
        var taskStore       = getDataSet(
            [
                {
                    Id          : 1,
                    StartDate   : new Date(2013, 8, 2),
                    //Duration    : 5,
                    children    : [
                        {
                            Id              : 2,
                            leaf            : true,
                            StartDate       : new Date(2013, 8, 2),
                            SchedulingMode  : 'Manual',
                            Duration        : 2
                        },
                        {
                            Id              : 3,
                            leaf            : true,
                            StartDate       : new Date(2013, 8, 6),
                            Duration        : 1
                        }
                    ]
                }
            ]
        ).taskStore

        var task     = function (id) { return taskStore.getNodeById(id) };

        task(1).setStartDate(new Date(2013, 8, 4), true, taskStore.skipWeekendsDuringDragDrop);

        t.is(task(1).getStartDate(), new Date(2013, 8, 2), 'Parent start date hasn`t changed (because of Manually scheduled Task #2)');
        t.is(task(1).getEndDate(), new Date(2013, 8, 11), 'Parent end date changed (because of task #3)');

        t.is(task(2).getStartDate(), new Date(2013, 8, 2), 'Task 2: Start date hasn`t changed');
        t.is(task(2).getEndDate(), new Date(2013, 8, 4), 'Task 2: End date hasn`t changed');

        t.is(task(3).getStartDate(), new Date(2013, 8, 10), 'Task 3: proper start date');
        t.is(task(3).getEndDate(), new Date(2013, 8, 11), 'Task 3: proper end date');

        task(1).setStartDate(new Date(2013, 7, 30), true, taskStore.skipWeekendsDuringDragDrop);

        t.is(task(1).getStartDate(), new Date(2013, 8, 2), 'Parent start date hasn`t changed (because of Manually scheduled Task #2)');
        t.is(task(1).getEndDate(), new Date(2013, 8, 10), 'Parent end date changed (because of task #3)');

        t.is(task(2).getStartDate(), new Date(2013, 8, 2), 'Task 2: Start date hasn`t changed');
        t.is(task(2).getEndDate(), new Date(2013, 8, 4), 'Task 2: End date hasn`t changed');

        t.is(task(3).getStartDate(), new Date(2013, 8, 9), 'Task 3: proper start date');
        t.is(task(3).getEndDate(), new Date(2013, 8, 10), 'Task 3: proper end date');
    });
});
