StartTest(function(t) {

    var taskStore   = t.getTaskStore();
    
    var task1       = taskStore.getNodeById(117)
    
    t.firesOk({
        observable      : taskStore,
        events          : { update : 1 },
        during          : function () {
            task1.setName("New name")
            task1.setDuration(task1.getDuration())
            task1.setStartDate(task1.getStartDate())
        }
    })
    
    
})    
