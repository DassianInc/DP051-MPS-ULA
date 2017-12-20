StartTest(function (t) {

    // #1462 - Histogram raises exception on phantom resource assigning

    t.it('Histogram handles a phantom resource assignment fine', function (t) {

        var resourceStore       = t.getResourceStore(),
            assignmentStore     = t.getAssignmentStore({
                resourceStore : resourceStore
            }),
            taskStore           = t.getTaskStore({
                resourceStore   : resourceStore,
                assignmentStore : assignmentStore
            });

        var histogram   = new Gnt.panel.ResourceHistogram({
            startDate       : taskStore.getTotalTimeSpan().start,
            endDate         : taskStore.getTotalTimeSpan().end,
            taskStore       : taskStore,
            resourceStore   : resourceStore,
            assignmentStore : assignmentStore,
            width           : 400,
            height          : 100,
            renderTo        : Ext.getBody()
        });

        var resource    = resourceStore.add({ Name : 'foo' })[0];

        t.livesOk(function () {
            assignmentStore.add({ TaskId : 115, ResourceId : resource.getId() });
        }, 'No exceptions were raised');

    });

});
