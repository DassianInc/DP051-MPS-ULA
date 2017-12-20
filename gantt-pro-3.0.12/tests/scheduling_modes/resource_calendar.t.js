StartTest(function(t) {
    
    //======================================================================================================================================================================================================================================================
    t.diag('Setup')
    
    var dataSet             = t.getSampleDataSet3()
    
    var taskStore           = dataSet.taskStore
    var dependencyStore     = dataSet.dependencyStore
    var resourceStore       = dataSet.resourceStore
    

    //======================================================================================================================================================================================================================================================
    t.diag('Checking interactions with resource calendar')
    
    var task1   = taskStore.getNodeById("Task1");
    
    // setting start date to 00:00, meanwhile the first available interval will be at 13:00 only
    task1.setStartDate(new Date(2012, 6, 2, 0), true, true)
    
    t.is(task1.getStartDate(), new Date(2012, 6, 2, 13), '`setStartDate` correctly skipped non-available hours in resource calendar')

    // setting start end to 00:00, meanwhile the last available interval will be at 17:00 only
    task1.setEndDate(new Date(2012, 6, 3, 0), true, true)
    
    t.is(task1.getEndDate(), new Date(2012, 6, 2, 17), '`setEndDate` correctly skipped non-available hours in resource calendar')

    t.is(task1.skipNonWorkingTime(new Date(2012, 6, 6, 17), true), new Date(2012, 6, 9, 8), '`skipNonWorkingTime` correctly skipped non-available weekend hours to Monday 8am')
    
    // setting start date to 17:00, which is the last available time in resource availability
    task1.setStartDate(new Date(2012, 6, 2, 17), true, true)
    
    t.is(task1.getStartDate(), new Date(2012, 6, 3, 13), 'should skip non available hours and start the task at next day')
    

    //======================================================================================================================================================================================================================================================
    t.diag('Checking `skipNonWorkingTime` of the task w/o assignments')
    
    var task2   = taskStore.getNodeById("Task2");
    
    t.is(task2.skipNonWorkingTime(new Date(2012, 6, 2, 0), true), new Date(2012, 6, 2, 8), '`skipNonWorkingTime` correctly skipped non-available hours in project calendar (which is used since task has no assignments)')
    t.is(task2.skipNonWorkingTime(new Date(2012, 6, 6, 17), true), new Date(2012, 6, 9, 8), '`skipNonWorkingTime` correctly skipped non-available weekend hours to Monday 8am')
    
    t.is(task2.skipNonWorkingTime(new Date(2012, 6, 2, 23), false), new Date(2012, 6, 2, 17), '`skipNonWorkingTime` correctly skipped non-available hours in project calendar backward (which is used since task has no assignments)')
    t.is(task2.skipNonWorkingTime(new Date(2012, 6, 9, 8), false), new Date(2012, 6, 6, 17), '`skipNonWorkingTime` correctly skipped non-available weekend hours from Monday 8:00 till Friday 17:00')
})    
