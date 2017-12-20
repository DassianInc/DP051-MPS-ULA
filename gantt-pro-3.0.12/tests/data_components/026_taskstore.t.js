StartTest(function(t) {
    
    // Someone might use this store with autoLoad, before creating any GanttPanel without any dependency store
    // Need to handle missing auxiliary dependencyStores etc.
    var taskStore = t.getTaskStore({
        proxy       : {
            type    : 'memory',
            reader  : {
                type    : 'json'
            }
        },
        dependencyStore : null
    });
    
    taskStore.proxy.data = [
        {
            Id          : 1,
            leaf        : true,
            StartDate   : new Date(2011, 6, 1),
            EndDate     : new Date(2011, 6, 5)
        },
        {
            Id          : 6,
            leaf        : true,
            StartDate   : new Date(2011, 6, 28),
            Duration    : 0
        }
    ];

    taskStore.load();

    var tasksInRange = taskStore.getEventsInTimeSpan(new Date(2011, 5, 1), new Date(2011, 6, 10));
    t.is(tasksInRange.length, 1, 'getEventsInTimeSpan: 1 task found')
    t.is(tasksInRange.first(), taskStore.getNodeById(1), 'getEventsInTimeSpan: Correct task found')

    // In remove listener of the store, we try to clear existing dependencies for the task and we access this.dependencyStore
    taskStore.getNodeById(1).remove();

    t.it('Should fire update events', function(t) {
        var taskStore = new Gnt.data.TaskStore({
            root : {
                expanded : true,
                children : [
                    {
                        Id   : 1,
                        Name : 'Haj'
                    }
                ]
            }
        })

        t.willFireNTimes(taskStore, 'update', 1);

        taskStore.getNodeById(1).set('Name', 'vask')
    })
})
