StartTest(function(t) {

    // Checks that we are able to set effort driven mode for a task having zero effort and 0% allocated resources #1925

    t.it('Enables EffortDriven mode for a task having zero effort and 0% allocated resources', function (t) {

        var resourceStore   = t.getResourceStore({
            data            : [{ Id : 1, Name : 'foo'}]
        });

        var assignmentStore = t.getAssignmentStore({
            resourceStore   : resourceStore,
            data            : [{ Id : 1, ResourceId : 1, TaskId : 1, Units : 0 }]
        });

        var taskStore       = t.getTaskStore({
            resourceStore   : resourceStore,
            assignmentStore : assignmentStore,
            DATA            : [{ Id : 1, StartDate : new Date(2015, 2, 25), Duration : 1 }]
        });

        t.livesOk(function () {
            taskStore.getNodeById(1).setSchedulingMode('EffortDriven');
        }, 'no exception raised');

    });

});
