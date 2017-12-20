StartTest(function(t) {

    // Empty resource store, meaning the assignments will not be able look up their resource (for calendars etc).
    var resourceStore   = new Gnt.data.ResourceStore();
    var aStore          = t.getAssignmentStore();

    var taskStore       = t.getTaskStore({
        resourceStore       : resourceStore,
        assignmentStore     : aStore
    });

    t.pass('Should handle assignment that is missing its resource');
})