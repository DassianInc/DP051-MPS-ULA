StartTest(function(t) {

    // Checks for ResourceHistogram particular rows refreshing
    // Histogram shouldn`t do total panel refresh on changes of resource/task/assignment

    var resourceStore   = t.getResourceStore();

    var assignmentStore = t.getAssignmentStore();

    var dependencyStore = t.getDependencyStore();

    var taskStore = t.getTaskStore({
        cascadeChanges  : false,
        resourceStore   : resourceStore,
        assignmentStore : assignmentStore,
        dependencyStore : dependencyStore
    });

    var histogram = new Gnt.panel.ResourceHistogram({
        taskStore           : taskStore,
        resourceStore       : resourceStore,
        assignmentStore     : assignmentStore,
        startDate           : new Date(2010, 1, 1),
        endDate             : new Date(2010, 1, 12),
        width               : 800,
        height              : 400,
        renderTo            : Ext.getBody()
    });

    t.diag("Histogram shouldn`t do total panel refresh on changes of resource/task/assignment");

    t.waitForRowsVisible(histogram, function () {
        t.willFireNTimes(histogram.getView().lockedView, "itemupdate", 5, "Locked view: 5 times occured refresh of particular grid row");
        t.willFireNTimes(histogram.getView().normalView, "itemupdate", 5, "Normal view: 5 times occured refresh of particular grid row");

        t.wontFire(histogram.getView().lockedView, "refresh", "Locked view: No total panel refresh occured");
        t.wontFire(histogram.getView().normalView, "refresh", "Normal view: No total panel refresh occured");

        // resource change should cause itemupdate event
        resourceStore.getById("r1").setName("smth");

        // task change should cause itemupdate event
        taskStore.getNodeById(118).setDuration(2);

        // assignment change should cause itemupdate event
        assignmentStore.remove(assignmentStore.getById("a1"));

        // assignment add should cause itemupdate event
        taskStore.getNodeById(116).assign(resourceStore.getById("r4"), 100);

        // task remove should cause itemupdate event
        taskStore.getNodeById(118).remove();
    });

});
