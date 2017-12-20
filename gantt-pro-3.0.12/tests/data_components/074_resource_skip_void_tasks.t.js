StartTest(function(t) {

    // Check assignment of not existing task will cause exception in resource.forEachAvailabilityIntervalWithTasks() method (#900)

    var taskStore   = t.getTaskStore({
        assignmentStore : t.getAssignmentStore(),
        resourceStore   : t.getResourceStore()
    });

    var assignmentStore = taskStore.getAssignmentStore();
    var resourceStore   = taskStore.getResourceStore();

    assignmentStore.add({ Id: 'a99', ResourceId: 'r1', TaskId : 99999, Units : 50 });

    var resource = resourceStore.getById('r1');

    resource.forEachAvailabilityIntervalWithTasks(
        {
            startDate   : new Date(2010, 1, 3),
            endDate     : new Date(2010, 1, 27)
        },
        function () {}
    );

    t.pass('Noe exceptions raised');
});
