StartTest(function(t) {
    
    //======================================================================================================================================================================================================================================================
    t.diag('Setup')
    
    var dataSet             = t.getSampleDataSet3()
    
    var taskStore           = dataSet.taskStore
    var dependencyStore     = dataSet.dependencyStore
    var resourceStore       = dataSet.resourceStore
    

    //======================================================================================================================================================================================================================================================
    t.diag('Checking interactions with resource and project calendar')
    
    var task1   = taskStore.getNodeById("Task1");
    
    // setting start date to 2012/08/03 15:00 - the date when assigned resource has availability '15:00-20:00'
    // so the task should end at 19:00 which is outside of project calendar availability (this is ok)
    task1.setStartDate(new Date(2012, 7, 3, 15), true, true)
    
    t.isStartEnd(task1, new Date(2012, 7, 3, 15), new Date(2012, 7, 3, 19), 'Project calendar was ignored in favor of calendars of assigned resources')
})    
