StartTest(function(t) {

    t.diag('Setup');

    var dataSet             = t.getSampleDataSet2();

    var taskStore           = dataSet.taskStore;
    var dependencyStore     = dataSet.dependencyStore;
    var resourceStore       = dataSet.resourceStore;
    var assignmentStore     = dataSet.assignmentStore;

    var task1   = taskStore.getNodeById(1);

    t.is(task1.getSchedulingMode(), 'FixedDuration', 'We are testing what we were going to test :)');

    task1.setSchedulingMode('EffortDriven');

    t.is(task1.getDuration(), 0, 'Duration is now 0 - no resources assigned to task');
    // start & end dates set to the end of prev day since it's a milestone now
    t.isStartEnd(task1, new Date(2011, 5, 30, 17), new Date(2011, 5, 30, 17), 'Correct start/end dates');

    t.diag('Assign resource');

    resourceStore.getById('Res1').assignTo(task1);

    t.diag('Set effort to 2');

    task1.setEffort(2);

    t.is(task1.getDuration('h'), 2, 'Duration is now 2h');
    t.isStartEnd(task1, new Date(2011, 6, 1, 8), new Date(2011, 6, 1, 10), 'Correct start/end dates');

    t.diag('Set effort to 0');

    task1.setEffort(0);

    t.is(task1.getDuration(), 0, 'Duration is now 0 - no resources assigned to task');
    // start & end dates set to the end of prev day since it's a milestone now
    t.isStartEnd(task1, new Date(2011, 5, 30, 17), new Date(2011, 5, 30, 17), 'Correct start/end dates');

    t.diag('Set effort to 2');

    task1.setEffort(2);

    t.is(task1.getDuration('h'), 2, 'Duration is now 2h');
    t.isStartEnd(task1, new Date(2011, 6, 1, 8), new Date(2011, 6, 1, 10), 'Correct start/end dates');

    t.diag('Remove assignment');

    assignmentStore.remove([].concat(task1.getAssignments()).pop());

    t.is(task1.getDuration(), 0, 'Duration is now 0 - no resources assigned to task');
    // start & end dates set to the end of prev day since it's a milestone now
    t.isStartEnd(task1, new Date(2011, 5, 30, 17), new Date(2011, 5, 30, 17), 'Correct start/end dates');
})
