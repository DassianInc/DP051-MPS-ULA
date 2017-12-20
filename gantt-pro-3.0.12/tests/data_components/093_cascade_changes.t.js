StartTest(function (t) {

    var dependencyStore = t.getDependencyStore({
        data : [
            { From : 1, To : 2, Id : 1, Type : 2 }
        ]
    });

    var taskStore = t.getTaskStore({
        dependencyStore : dependencyStore,
        cascadeChanges  : true,
        DATA            : [
            {
                Id             : 1,
                leaf           : true,
                StartDate      : new Date(2011, 6, 25, 8),
                Duration       : 3
            },
            {
                Id             : 2,
                leaf           : true,
                StartDate      : new Date(2011, 6, 28, 8),
                Duration       : 2
            }
        ]
    });

    t.wontFire(taskStore, 'beforecascade');

    taskStore.getNodeById(1).setPercentDone(100);
});
