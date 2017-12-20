StartTest(function(t) {
    var dependencyStore = Ext.create("Gnt.data.DependencyStore", {
        proxy       : 'memory',
        data    : [
            {
                From        : 1,
                To          : 2
            },
            /*  CYCLIC */
            {
                From        : 2,
                To          : 3
            },
            {
                From        : 3,
                To          : 4
            },
            {
                From        : 4,
                To          : 2
            },
            /*  EOF CYCLIC */

            {
                From        : 5,
                To          : 6
            },
            {
                From        : 6,
                To          : 7
            },
            {
                From        : 5,
                To          : 7
            }
        ]
    });

    var taskStore = Ext.create("Gnt.data.TaskStore", {
        dependencyStore : dependencyStore,
        cascadeChanges : true,
        proxy       : 'memory'
    });

    taskStore.proxy.data = [{ Id : 1}, { Id : 2}, { Id : 3}, { Id : 4}, { Id : 5}, { Id : 6}, { Id : 7}];
    taskStore.load();

    var t1 = taskStore.getNodeById(1);

//    t.throwsOk(function() {
//        taskStore.cascadeChangesForTask(t1);
//    }, 'Cyclic dependency structure detected');

//    t.livesOk(function() {
//        taskStore.cascadeChangesForTask(taskStore.getNodeById(5));
//    }, 'Cyclic dependency structure not detected');
})

