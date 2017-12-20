StartTest(function (t) {

    var getDataSet = function () {
        var dependencyStore = Ext.create("Gnt.data.DependencyStore", {
            proxy : {
                type   : 'memory',
                reader : {
                    type : 'json'
                }
            },

            data : [
                {
                    From : 1,
                    To   : 2,
                    Type : 2
                },
                {
                    From : 1,
                    To   : 3,
                    Type : 2
                },
                {
                    From : 2,
                    To   : 4,
                    Type : 2
                },
                {
                    From : 3,
                    To   : 4,
                    Type : 2
                },
                {
                    From : 4,
                    To   : 5,
                    Type : 2
                }
            ]
        });


        var taskStore = Ext.create("Gnt.data.TaskStore", {
            dependencyStore : dependencyStore,
            cascadeChanges  : true,
            cascadeDelay    : 0,

            proxy : 'memory',

            root : {
                expanded : true,

                children : [
                    {
                        Id        : 1,
                        leaf      : true,
                        StartDate : new Date(2011, 6, 1),
                        EndDate   : new Date(2011, 6, 5)
                    },
                    {
                        Id        : 123,
                        expanded  : true,
                        StartDate : new Date(2011, 6, 15),
                        EndDate   : new Date(2011, 6, 23),

                        children : [
                            {
                                Id        : 2,
                                leaf      : true,
                                StartDate : new Date(2011, 6, 16),
                                EndDate   : new Date(2011, 6, 20)
                            },
                            {
                                Id        : 3,
                                leaf      : true,
                                StartDate : new Date(2011, 6, 18),
                                EndDate   : new Date(2011, 6, 22)
                            }
                        ]
                    },
                    {
                        Id        : 4,
                        leaf      : true,
                        StartDate : new Date(2011, 6, 25),
                        EndDate   : new Date(2011, 6, 28)
                    },
                    {
                        Id        : 5,
                        leaf      : true,
                        StartDate : new Date(2011, 6, 28),
                        EndDate   : new Date(2011, 6, 28)
                    },
                    {
                        Id        : 6,
                        leaf      : true,
                        StartDate : new Date(2011, 6, 28),
                        Duration  : 0
                    }
                ]
            }
        });

        return {
            taskStore       : taskStore,
            dependencyStore : dependencyStore
        }
    }

    t.it('getNodeById should work even when root is collapsed', function (t) {
        var taskStore = new Gnt.data.TaskStore({
            root : {
                expanded : false,

                children : [
                    {
                        Id        : 1
                    }
                ]
            }
        });

        var task1 = taskStore.getNodeById(1);

        // http://www.sencha.com/forum/showthread.php?288239-TreeStore-getById-broken&p=1053342#post1053342
        t.ok(task1)
    });

    t.it('getDependencies', function (t) {
        var dataSet = getDataSet()
        var taskStore = dataSet.taskStore
        var dependencyStore = dataSet.dependencyStore
        var expectedDeps = [ dependencyStore.getAt(0), dependencyStore.getAt(1) ];
        var task1 = taskStore.getNodeById(1);

        t.ok(task1 && 0 === (task1.get('StartDate') - new Date(2011, 6, 1)), 'Correct task found by id')

        t.isDeeply(task1.getIncomingDependencies(), [], 'No incoming deps for task "1"')
        t.isDeeply(task1.getOutgoingDependencies(), expectedDeps, 'Correct outcoming deps for task "1"')
        t.isDeeply(task1.getAllDependencies(), expectedDeps, 'Correct getAllDependencies for task "1"')

        var task2 = taskStore.getNodeById(2);

        t.isDeeply(task2.getIncomingDependencies(), [ dependencyStore.getAt(0) ], 'Correct incoming deps for task "2"')
        t.isDeeply(task2.getOutgoingDependencies(), [ dependencyStore.getAt(2) ], 'Correct outcoming deps for task "2"')

        dependencyStore.removeAll();

        t.isDeeply(task1.getAllDependencies(), [], 'Correct getAllDependencies for cleared dependencyStore')

        dependencyStore.loadData([
            {
                From : 1,
                To   : 2
            }
        ])
        t.isDeeply(task1.getAllDependencies(), [dependencyStore.first()], 'Correct getAllDependencies after dependencyStore loadData')
    })


    t.it('Milestones', function (t) {
        var dataSet = getDataSet()
        var taskStore = dataSet.taskStore
        var dependencyStore = dataSet.dependencyStore

        var task5 = taskStore.getNodeById(5);
        var task6 = taskStore.getNodeById(6)

        t.ok(task5.isMilestone(), "Same start and end date is a milestone")
        t.ok(task6.isMilestone(), "A milestone can be a task with a startdate and 0 duration")
    })

    t.it('Constraints', function (t) {
        var dataSet = getDataSet()
        var taskStore = dataSet.taskStore
        var dependencyStore = dataSet.dependencyStore
        var task2 = taskStore.getNodeById(2);

        t.isDeeply(task2.getIncomingDependenciesConstraintContext(), {
            startDate        : new Date(2011, 6, 5),
            endDate          : null,
            constrainingTask : taskStore.getNodeById(1)
        }, "Correct constrain context for `task2`")

        t.isDeeply(taskStore.getNodeById(4).getIncomingDependenciesConstraintContext(), {
            startDate        : new Date(2011, 6, 22),
            endDate          : null,
            constrainingTask : taskStore.getNodeById(3)
        }, "Correct constrain context for `task4`")
    })


    t.it('Update parent', function (t) {
        var dataSet         = getDataSet()
        var taskStore       = dataSet.taskStore
        var dependencyStore = dataSet.dependencyStore
        var task2 = taskStore.getNodeById(2);

        t.is(taskStore.getNodeById(123).getDuration(), 6, 'Correct parent duration before recalculate')

        taskStore.startBatchCascade()

        task2.recalculateParents()

        taskStore.endBatchCascade()

        t.isDateEqual(taskStore.getNodeById(123).getStartDate(), new Date(2011, 6, 16), 'Correct parent update')
        t.isDateEqual(taskStore.getNodeById(123).getEndDate(), new Date(2011, 6, 22), 'Correct parent update')
        t.is(taskStore.getNodeById(123).getDuration(), 4, 'Correct parent duration update')
    })

    t.it('Cascades 1 - manual', function (t) {
        var dataSet = getDataSet()
        var taskStore = dataSet.taskStore
        var dependencyStore = dataSet.dependencyStore

        var cascadeFired = 0
        var beforeCascadeFired = 0

        taskStore.on('beforecascade', function () {
            beforeCascadeFired++
        })
        taskStore.on('cascade', function () {
            cascadeFired++
        })

        taskStore.cascadeChangesForTask(taskStore.getNodeById(1))

        t.is(beforeCascadeFired, 1, "Should be exactly one `beforecascade` event before cascade")
        t.is(cascadeFired, 1, "Should be exactly one `cascade` event after cascade")

        t.isStartEnd(taskStore.getNodeById(1), new Date(2011, 6, 1), new Date(2011, 6, 5), 'Correct dates for `task1` after cascade')
        t.isStartEnd(taskStore.getNodeById(2), new Date(2011, 6, 5), new Date(2011, 6, 7), 'Correct dates for `task2` after cascade')
        t.isStartEnd(taskStore.getNodeById(3), new Date(2011, 6, 5), new Date(2011, 6, 9), 'Correct dates for `task3` after cascade')

        t.isStartEnd(taskStore.getNodeById(123), new Date(2011, 6, 5), new Date(2011, 6, 9), 'Correct dates for `task123` after cascade')

        // note - task4 has been re-scheduled from saturday to monday
        t.isStartEnd(taskStore.getNodeById(4), new Date(2011, 6, 11), new Date(2011, 6, 14), 'Correct dates for `task4` after cascade')
        t.isStartEnd(taskStore.getNodeById(5), new Date(2011, 6, 14), new Date(2011, 6, 14), 'Correct dates for `task5` after cascade')

    })

    t.it('Cascades 2 - triggered by task update', function (t) {

        var dataSet = getDataSet()
        var taskStore = dataSet.taskStore
        var dependencyStore = dataSet.dependencyStore

        var cascadeFired = 0
        var beforeCascadeFired = 0

        taskStore.on('beforecascade', function () {
            beforeCascadeFired++
        })
        taskStore.on('cascade', function () {
            cascadeFired++
        })

        taskStore.getNodeById(1).setStartDate(new Date(2011, 6, 4), true)

        t.is(beforeCascadeFired, 1, "Should be exactly one `beforecascade` event before cascade")
        t.is(cascadeFired, 1, "Should be exactly one `cascade` event after cascade")

        t.isStartEnd(taskStore.getNodeById(1), new Date(2011, 6, 4), new Date(2011, 6, 6), 'Correct dates for `task1` after cascade')
        t.isStartEnd(taskStore.getNodeById(2), new Date(2011, 6, 6), new Date(2011, 6, 8), 'Correct dates for `task2` after cascade')
        t.isStartEnd(taskStore.getNodeById(3), new Date(2011, 6, 6), new Date(2011, 6, 12), 'Correct dates for `task3` after cascade')

        // Adjusted due to its childrens changes
        t.isStartEnd(taskStore.getNodeById(123), new Date(2011, 6, 6), new Date(2011, 6, 12), 'Correct dates for `task123` after cascade')

        // note - task4 has been re-scheduled from saturday to monday
        t.isStartEnd(taskStore.getNodeById(4), new Date(2011, 6, 12), new Date(2011, 6, 15), 'Correct dates for `task4` after cascade')
        t.isStartEnd(taskStore.getNodeById(5), new Date(2011, 6, 15), new Date(2011, 6, 15), 'Correct dates for `task5` after cascade')

        // Make sure a cascade is not fired unless another task was actually modified as a result of a task update.
        var nbrAffected = 0;
        taskStore.on('cascade', function (store, context) {
            nbrAffected = context.nbrAffected;
        });

        taskStore.getNodeById(1).setStartDate(new Date(2011, 5, 2), false);
        t.is(nbrAffected, 0, 'Cascade affected no other tasks');
    })

    t.it('Cascade after dependency add', function (t) {

        var taskStore = getDataSet().taskStore

        var cascadeFired = 0
        var beforeCascadeFired = 0

        taskStore.on('beforecascade', function () {
            beforeCascadeFired++
        })
        taskStore.on('cascade', function () {
            cascadeFired++
        })

        taskStore.dependencyStore.add({
            From : 2,
            To   : 3,
            Type : 2
        })

        t.is(beforeCascadeFired, 1, "Should be exactly one `beforecascade` event before cascade")
        t.is(cascadeFired, 1, "Should be exactly one `cascade` event after cascade")

        t.isStartEnd(taskStore.getNodeById(1), new Date(2011, 6, 1), new Date(2011, 6, 5), 'Correct dates for `task1` after cascade')
        t.isStartEnd(taskStore.getNodeById(2), new Date(2011, 6, 16), new Date(2011, 6, 20), 'Correct dates for `task2` after cascade')
        t.isStartEnd(taskStore.getNodeById(3), new Date(2011, 6, 20), new Date(2011, 6, 26), 'Correct dates for `task3` after cascade')

        t.isStartEnd(taskStore.getNodeById(123), new Date(2011, 6, 16), new Date(2011, 6, 26), 'Correct dates for `task123` after cascade')

        // NOTE: - task4 has been re-scheduled from saturday to monday
        t.isStartEnd(taskStore.getNodeById(4), new Date(2011, 6, 26), new Date(2011, 6, 29), 'Correctly re-scheduled the start date of the task to next working day')
        t.isStartEnd(taskStore.getNodeById(5), new Date(2011, 6, 29), new Date(2011, 6, 29), 'Correct dates for `task5` after cascade')

        taskStore.getNodeById(5).setStartEndDate(null, null);
        t.isStartEnd(taskStore.getNodeById(5), null, null, 'Correct dates for `task5` after resetting it')

    })

    t.it('No cascade after the change of field other than "Start/EndDate", but cascade after `reject`', function (t) {


        var taskStore = getDataSet().taskStore

        var cascadeFired = 0
        var beforeCascadeFired = 0

        taskStore.on('beforecascade', function () {
            beforeCascadeFired++
        })
        taskStore.on('cascade', function () {
            cascadeFired++
        })

        taskStore.getNodeById(1).set('Name', 'SomeName')

        t.ok(!beforeCascadeFired, "No cascade after change of non-start/end date field")
        t.ok(!cascadeFired, "No cascade after change of non-start/end date field")

        taskStore.getNodeById(1).reject()

        t.is(beforeCascadeFired, 0, "Should be exactly one `beforecascade` event before cascade")
        t.is(cascadeFired, 0, "Should be exactly one `cascade` event after cascade")

        var task = new Gnt.model.Task({
            "Duration"     : 0,
            "DurationUnit" : "d",
            "StartDate"    : new Date(2010, 1, 28)
        });
        task.calendar = new Gnt.data.Calendar();
        task.normalize();

        t.ok(task.normalized, 'Task indicated as normalized');
        t.is(task.getDuration(), 0, 'Task duration 0');
        t.is(task.getStartDate(), new Date(2010, 1, 28), 'Task start date ok');
        t.is(task.getEndDate(), new Date(2010, 1, 28), 'Task end date ok should be same as start date, since duration is 0');

        // If end is specified as inclusive, the below should give an adjusted end date of 2012-06-23 00:00:00
        task = new Gnt.model.Task({
            "Duration"     : 5,
            "DurationUnit" : "d",
            "StartDate"    : "2012-06-18",
            "EndDate"      : "2012-06-22"
        });
        task.inclusiveEndDate = true;
        task.calendar = new Gnt.data.Calendar();
        task.normalize();

        t.is(task.getDuration(), 5, 'Task duration 5');
        t.is(task.getStartDate(), new Date(2012, 5, 18), 'Task start date ok');
        t.is(task.getEndDate(), new Date(2012, 5, 23), 'Task end date adjusted to start of next day');

        task = new Gnt.model.Task({
            "Duration"     : 4,
            "DurationUnit" : "d",
            "StartDate"    : "2012-06-18T10:00:00",
            "EndDate"      : "2012-06-22T10:00:00"
        });
        task.inclusiveEndDate = true;
        task.calendar = new Gnt.data.Calendar();
        task.normalize();

        t.is(task.getDuration(), 4, 'Task duration 4');
        t.is(task.getStartDate(), new Date(2012, 5, 18, 10), 'inclusiveEndDate: Task start date ok');
        t.is(task.getEndDate(), new Date(2012, 5, 22, 10), 'inclusiveEndDate: Task end date not adjusted to start of next day, if it has hour info');

        task = new Gnt.model.Task({
            "Duration"     : 0,
            "DurationUnit" : "d",
            "StartDate"    : "2012-06-18T00:00:00",
            "EndDate"      : "2012-06-18T00:00:00"
        });
        task.inclusiveEndDate = true;
        task.calendar = new Gnt.data.Calendar();
        task.normalize();

        t.is(task.getDuration(), 0, 'Task duration 0');
        t.is(task.getStartDate(), new Date(2012, 5, 18), 'Task start date ok - milestone');
        t.is(task.getEndDate(), new Date(2012, 5, 18), 'Task end date not adjusted to start of next day, if it has hour info - milestone');
    })

    t.it('Make sure we can set null on date fields', function(t) {
        var dataSet = getDataSet()
        var taskStore = dataSet.taskStore
        var dependencyStore = dataSet.dependencyStore

        var task = new Gnt.model.Task();

        taskStore.getRootNode().appendChild(task);
        task.setDuration(3);

        t.is(task.getDuration(), 3, 'Should be possible to set just duration on a task');

        taskStore.getNodeById(5).setStartEndDate(new Date(2011, 6, 29), new Date(2011, 6, 30));

        taskStore.getNodeById(5).setStartDate(null);
        t.is(taskStore.getNodeById(5).getStartDate(), null, 'Could null start date')
        t.is(taskStore.getNodeById(5).getDuration(), null, 'Duration null after nulling start date')

        taskStore.getNodeById(5).setStartDate(new Date(2011, 6, 29));

        taskStore.getNodeById(5).setEndDate(null);
        t.is(taskStore.getNodeById(5).getEndDate(), null, 'Could null end date')
        t.is(taskStore.getNodeById(5).getDuration(), null, 'Duration null after nulling End date')

        taskStore.getNodeById(5).setStartEndDate(null, null);
        t.isStartEnd(taskStore.getNodeById(5), null, null, 'Correct dates for `task5` after resetting it');
    })

    t.it('Verify we can add task with start + duration to the task store', function(t) {
        var dataSet = getDataSet()
        var taskStore = dataSet.taskStore
        var dependencyStore = dataSet.dependencyStore

        var task = new Gnt.model.Task({
            convertEmptyParentToLeaf : true
        });

        taskStore.getNodeById(5).appendChild(task)

        task.appendChild(new Gnt.model.Task());
        t.notOk(task.data.leaf, 'Node with children is not a leaf');
        task.firstChild.remove();
        t.ok(task.data.leaf, 'Node without children is a leaf');

        /* Verify we can add task with start + duration to the task store */
        taskStore.getRootNode().appendChild({
            Id        : 123123,
            StartDate : new Date(2013, 1, 25),
            Duration  : 3,
            leaf      : true
        });

        t.ok(taskStore.getNodeById(123123).normalized, 'Should find node normalized after adding it to task store')

        t.is(taskStore.getNodeById(123123).getEndDate(),
            new Date(2013, 1, 28),
            'Should be able to create a task using StartDate + Duration');
    })

    t.it('Phantom checks', function(t) {
        var dataSet = getDataSet()
        var taskStore = dataSet.taskStore
        var dependencyStore = dataSet.dependencyStore

        taskStore.getRootNode().removeAll();

        var task = taskStore.getRootNode().appendChild({
            Id : 1
        });

        t.notOk(task.phantom, 'Newly added task with an Id should not be a phantom');
        t.ok(task.addTaskBelow({ leaf : true }).phantom, 'Newly added task should be a phantom')

        task.setEndDate(new Date(2010, 1, 2));
        task.setStartDate(new Date(2010, 1, 1));

        t.is(task.getDuration(), 1, 'Should find duration calculated when setting end then start date');
    })

    t.it('Should find duration calculated when setting start and then end date', function(t) {
        var dataSet = getDataSet()
        var taskStore = dataSet.taskStore
        var dependencyStore = dataSet.dependencyStore

        taskStore.getRootNode().removeAll();

        var task = taskStore.getRootNode().appendChild({
            Id : 1
        });

        task.setStartDate(new Date(2010, 1, 1));
        task.setEndDate(new Date(2010, 1, 2));

        t.is(task.getDuration(), 1, 'Should find duration calculated when setting start and then end date');
    })

    t.it('Does not set end date of milestone less than its start date', function (t) {
        var task6 = getDataSet().taskStore.getNodeById(6);

        t.is(task6.getStartDate(), new Date(2011, 6, 28), "Correct start date");
        t.is(task6.getEndDate(), new Date(2011, 6, 28), "Correct end date");

        task6.setEndDate(new Date(2011, 6, 26), false);

        t.is(task6.getStartDate(), new Date(2011, 6, 28), "Start date is the same");
        t.is(task6.getEndDate(), new Date(2011, 6, 28), "End date is the same");
    });

    t.it('Should be possible to convert a task to be a milestone', function (t) {

        var task = new Gnt.model.Task({
            StartDate : new Date(2013, 6, 24),
            Duration  : 2
        });
        getDataSet().taskStore.getRootNode().appendChild(task);

        t.notOk(task.isMilestone(), "Not a milestone");

        task.convertToMilestone();

        t.ok(task.isMilestone(), "Now a milestone");
        t.is(task.getStartDate(), new Date(2013, 6, 26), "Milestone at the original task end date");
    });

    t.it('Should not produce any side effects to convert a milestone to be a milestone', function (t) {

        var task2 = new Gnt.model.Task({
            StartDate : new Date(2013, 6, 26),
            Duration  : 0
        });
        getDataSet().taskStore.getRootNode().appendChild(task2);

        t.ok(task2.isMilestone(), "Originally a milestone");

        task2.convertToMilestone();

        t.ok(task2.isMilestone(), "Still a milestone");
        t.is(task2.getStartDate(), new Date(2013, 6, 26), "Milestone at the original task end date");
    });

    t.it('Should not crash if converting a blank task to a milestone', function (t) {

        var task2 = new Gnt.model.Task();
        getDataSet().taskStore.getRootNode().appendChild(task2);

        task2.convertToMilestone();

        t.pass('All ok')
    });

    t.it('Should be able to convert milestone to regular task', function (t) {

        var task = new Gnt.model.Task({
            StartDate : new Date(2013, 6, 24),
            Duration  : 0
        });

        getDataSet().taskStore.getRootNode().appendChild(task);

        task.convertToRegular();

        t.is(task.getDuration(), 1, 'Duration 1');
        t.is(task.getStartDate(), new Date(2013, 6, 23), 'Start ok');
        t.is(task.getEndDate(), new Date(2013, 6, 24), 'End ok');
    });

    t.it('Setting task end date can turn task into milestone and back to regular', function (t) {

        var task = new Gnt.model.Task({
            StartDate : new Date(2013, 6, 20),
            Duration  : 0
        });

        getDataSet().taskStore.getRootNode().appendChild(task);

        t.ok(task.isMilestone(), "Milestone");

        task.setEndDate(new Date(2013, 6, 23), false, true);

        t.notOk(task.isMilestone(), "Now it's not a milestone");
        t.is(task.getStartDate(), new Date(2013, 6, 22), "Start date is adjusted to the calendar");
        t.is(task.getEndDate(), new Date(2013, 6, 23), "End date is adjusted to the calendar");

        task.setEndDate(new Date(2013, 6, 22), false, true);

        t.ok(task.isMilestone(), "Now it's milestone again");
        t.is(task.getStartDate(), new Date(2013, 6, 20), "Start date is adjusted back to midnight between Friday and Saturday");
        t.is(task.getEndDate(), new Date(2013, 6, 20), "End date is adjusted back to midnight between Friday and Saturday");
    });

    t.it('Setting task duration can turn task into milestone and back to regular', function (t) {

        var task = new Gnt.model.Task({
            StartDate : new Date(2013, 6, 20),
            Duration  : 0
        });

        getDataSet().taskStore.getRootNode().appendChild(task);

        t.ok(task.isMilestone(), "Milestone");

        task.setDuration(1);

        t.notOk(task.isMilestone(), "Now it's not a milestone");
        t.is(task.getStartDate(), new Date(2013, 6, 22), "Start date is adjusted to the calendar");
        t.is(task.getEndDate(), new Date(2013, 6, 23), "End date is adjusted to the calendar");

        task.setDuration(0);

        t.ok(task.isMilestone(), "Now it's milestone again");
        t.is(task.getStartDate(), new Date(2013, 6, 20), "Start date is adjusted back to midnight between Friday and Saturday");
        t.is(task.getEndDate(), new Date(2013, 6, 20), "End date is adjusted back to midnight between Friday and Saturday");
    });

    t.it('Removing a single task record', function (t) {

        var resourceStore = new Gnt.data.ResourceStore({
            data : [
                { Id : 1, Name : "Mats" }
            ]
        });

        var assignmentStore = new Gnt.data.AssignmentStore({
            data : [
                { ResourceId : 1, TaskId : 1, Units : 50 }
            ]
        });

        var dependencyStore = new Gnt.data.DependencyStore({
            data : [
                { Id : 1, From : 1, To : 2 },
                { Id : 2, From : 1, To : 3 },
                { Id : 3, From : 2, To : 4 }
            ]
        });

        var taskStore = new Gnt.data.TaskStore({
            resourceStore   : resourceStore,
            dependencyStore : dependencyStore,
            assignmentStore : assignmentStore,
            proxy           :'memory',

            root            : {
                expanded : true,
                children : [
                    { Id : 1, StartDate : new Date(2010, 1, 1), Duration : 10 },
                    { Id : 2, StartDate : new Date(2010, 1, 1), Duration : 10 },
                    { Id : 3, StartDate : new Date(2010, 1, 1), Duration : 10 },
                    { Id : 4, StartDate : new Date(2010, 1, 1), Duration : 10 }
                ]
            }
        });

        var task = taskStore.getNodeById(1);

        t.is(assignmentStore.getAssignmentsForTask(task).length, 1, 'Should find 1 assignment');
        task.remove();

        t.is(assignmentStore.getCount(), 0, 'Assignment store reacted to task remove');
        t.is(dependencyStore.getCount(), 1, 'Dependency store reacted to task remove');
        t.is(dependencyStore.getAt(0).getId(), 3, 'Dependency store reacted to task remove');
    });

    t.it('Removing a parent task record', function (t) {

        var resourceStore = new Gnt.data.ResourceStore({
            data : [
                { Id : 1, Name : "Mats" }
            ]
        });

        var assignmentStore = new Gnt.data.AssignmentStore({
            data : [
                { ResourceId : 1, TaskId : 11, Units : 50 }
            ]
        });

        var dependencyStore = new Gnt.data.DependencyStore({
            data : [
                { Id : 1, From : 11, To : 12 },
                { Id : 2, From : 11, To : 13 },
                { Id : 3, From : 12, To : 14 }
            ]
        });

        var taskStore = new Gnt.data.TaskStore({
            resourceStore   : resourceStore,
            dependencyStore : dependencyStore,
            assignmentStore : assignmentStore,
            proxy           : {
                type   : 'memory',
                reader : {
                    type : 'json'
                }
            },

            root            : {
                expanded : true,
                children : [
                    {
                        Id          : 1,
                        StartDate   : new Date(2010, 1, 1),
                        Duration    : 10,
                        expanded    : true,
                        children    : [
                            { Id : 11, StartDate : new Date(2010, 1, 1), Duration : 10 },
                            { Id : 12, StartDate : new Date(2010, 1, 1), Duration : 10 },
                            { Id : 13, StartDate : new Date(2010, 1, 1), Duration : 10 },
                            { Id : 14, StartDate : new Date(2010, 1, 1), Duration : 10 }
                        ]
                    }
                ]
            }
        });

        taskStore.getNodeById(1).remove();

        t.is(assignmentStore.getCount(), 0, 'Assignment store reacted to task remove');
        t.is(dependencyStore.getCount(), 0, 'Dependency store reacted to task remove');
    });


    t.it('Verifying `getInDepthWalker`', function (t) {
        /* jshint -W085 */
        /* global taskStore */
        with (t.getAllStoresDataSet(
            [
                {
                    Id          : 1,
                    children    : [
                        {
                            Id          : 2,
                            leaf        : true
                        },
                        {
                            Id          : 3,
                            children    : [
                                {
                                    Id          : 4,
                                    leaf        : true
                                }
                            ]
                        }
                    ]
                },
                {
                    Id          : 5,
                    children    : []
                },
                {
                    Id          : 6,
                    children    : [
                        {
                            Id          : 7,
                            leaf        : true
                        },
                        {
                            Id          : 8,
                            leaf        : true
                        }
                    ]
                },
                {
                    Id          : 9,
                    leaf        : true
                }
            ]
        )) {
            var walker      = taskStore.getRootNode().getInDepthWalker()

            var task, tasks = []

            while (task = walker()) tasks.push(task.getId())

            t.isDeeply(tasks, [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ], "Correct walking")
        }

    });
});
