StartTest(function(t) {

    var taskStore   = new Gnt.data.TaskStore({
        dependencyStore : t.getDependencyStore({
            data : [
                { From : 2, To : 3 }
            ]
        }),

        root        : {
            expanded    : true,

            children    : [
                {
                    Id          : 1,
                    leaf        : true,
                    StartDate   : '2010-01-01',
                    EndDate     : '2010-01-07'
                },
                {
                    Id          : 2,
                    leaf        : true,
                    StartDate   : '2010-01-07',
                    EndDate     : '2010-01-10'
                },
                {
                    Id          : 3,
                    leaf        : true,
                    StartDate   : '2010-01-15',
                    EndDate     : '2010-01-21'
                }
            ]
        }
    });

    var g = t.getGantt2({
        renderTo        : document.body,
        taskStore       : taskStore,
        dependencyStore : taskStore.dependencyStore
    });


    t.chain(
        { waitFor : 'rowsVisible', args : g },

        function() {
            taskStore.getRootNode().insertBefore(taskStore.getNodeById(3), taskStore.getNodeById(1), taskStore.getNodeById(2));
            t.is(taskStore.getRootNode().childNodes.length, 3, 'TaskStore content intact')
            t.is(taskStore.dependencyStore.getCount(), 1, 'DependencyStore content intact')
        }
    )
});
