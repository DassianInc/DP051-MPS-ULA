StartTest({
    needDone        : true
}, function(t) {

    var dependencyStore = Ext.create("Gnt.data.DependencyStore");

    var taskStore = Ext.create("Gnt.data.TaskStore", {
        dependencyStore : dependencyStore,

        cascadeChanges  : true,

        proxy       : {
            type    : 'memory',
            reader  : { type    : 'json' }
        },

        root        : { expanded : true }
    });

    taskStore.load()

    var id                  = 1

    var tasksNumInChunk     = 6

    var rootTasks           = []

    // creates a very heavily depended chunk of tasks:
    // each task has incoming dep from `incomingDepFrom` (which is a milestone from previous step)
    // each following task depends from previous
    // each task has outgoing dep to a final milestone
    var createHeavilyDependedChunk = function (incomingDepFrom, startDate, level) {
        var tasks       = []

        for (var i = 0; i < tasksNumInChunk; i++) {
            var newTaskId       = id++

            if (incomingDepFrom) dependencyStore.add({
                From        : incomingDepFrom.Id,
                To          : newTaskId
            })

            tasks.push({
                StartDate       : startDate,
                Duration        : 1,
                Id              : newTaskId,
                leaf            : true
            })

            if (i > 0) dependencyStore.add({
                From        : tasks[ i - 1 ].Id,
                To          : newTaskId
            })

            startDate           = Sch.util.Date.add(startDate, Sch.util.Date.DAY, 1)
        }

        var mileStoneId     = id++

        var mileStone       = {
            StartDate       : startDate,
            Duration        : 0,
            leaf            : true,
            Id              : mileStoneId
        }

        tasks.push(mileStone)

        for (var i = 0; i < tasksNumInChunk; i++) dependencyStore.add({
            From            : tasks[ i ].Id,
            To              : mileStoneId
        })

        rootTasks.push({
            Id              : id++,
            expanded        : true,
            children        : tasks
        })

        if (level > 0) createHeavilyDependedChunk(mileStone, startDate, level - 1)
    }

    createHeavilyDependedChunk(null, new Date(2012, 0, 1), 3)

    taskStore.proxy.data    = { children : rootTasks }

    taskStore.load()

    //======================================================================================================================================================================================================================================================
    t.diag('Sanity')

    // uncomment to visualize the dependencies 
//    var gantt = t.getGantt({
//        dependencyStore : dependencyStore,
//        taskStore       : taskStore,
//        renderTo        : Ext.getBody(),
//        
//        startDate       : new Date(2012, 0, 1),
//        endDate         : new Date(2012, 2, 1)
//    })

    var time        = new Date()

    var someTaskInTheTopGroup    = taskStore.getNodeById(3)

    // move the task to 1 day right
    someTaskInTheTopGroup.setStartDate(
        Sch.util.Date.add(someTaskInTheTopGroup.getStartDate(), Sch.util.Date.DAY, 1),
        true
    )

    var elapsedTime = new Date() - time

    t.isLess(elapsedTime, 5000, 'Cascading of changes in heavily depended structure is reasonably fast')

    t.done()
})    
