StartTest(function(t) {

    // Check that histogram doesn't raise an exception on large scale zooming out  #1365

    var taskStore = t.getTaskStore({
        resourceStore       : t.getResourceStore(),
        assignmentStore     : t.getAssignmentStore()
    });

    var histogram       = new Gnt.panel.ResourceHistogram({
        renderTo            : Ext.getBody(),
        width               : 800,
        height              : 600,
        taskStore           : taskStore,
        resourceStore       : taskStore.getResourceStore(),
        assignmentStore     : taskStore.getAssignmentStore(),
        startDate           : new Date(2013, 3, 1),
        endDate             : new Date(2013, 3, 12)
    });

    t.livesOk(function() { histogram.zoomToLevel(2); }, 'doesn`t raise an exception on zooming out');
});
