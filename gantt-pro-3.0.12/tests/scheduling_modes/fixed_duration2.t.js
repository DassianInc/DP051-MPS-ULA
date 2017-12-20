StartTest(function(t) {
    
    //======================================================================================================================================================================================================================================================
    t.diag('Setup')
    
    var dataSet             = t.getSampleDataSet2()
    
    var taskStore           = dataSet.taskStore
    var dependencyStore     = dataSet.dependencyStore
    var resourceStore       = dataSet.resourceStore
    

    //======================================================================================================================================================================================================================================================
    t.diag('FixedDuration scheduling mode, now with advanced calendars setup')
    
    // task lasts 4 calendar days, 2 of which are weekends, so we have 2 days fixed duration task, with 2 resources assigned
    var task1   = taskStore.getNodeById(1);
    
    t.is(task1.getSchedulingMode(), 'FixedDuration', 'We are testing what we were going to test :)')
    
    t.is(task1.getDuration('h'), 8 + 8 + 4 + 8, 'Duration is 28 business hours') 
    t.is(task1.getDuration(), 28 / 8, 'Duration is 28 / 8  business days')
    
    t.is(task1.getEffort(), 0, 'Initial effort is zero - no resources assigned') 
    
    resourceStore.getById('Res1').assignTo(task1)
    
    t.isStartEnd(task1, new Date(2011, 6, 1, 8), new Date(2011, 6, 4, 17), 'The start/end dates of task remains the same')
    
    t.is(task1.getEffort(), 28, 'But effort has increased on 28 hours `Resource` has the same availability as the task')
    
    resourceStore.getById('Res2').assignTo(task1, 75)
    
    t.is(task1.getEffort(), 28 + (3 + 3 + 0 + 8) * 0.75, 'Effort is 38.5h now - examine the calendar of Resource2')

    resourceStore.getById('Res3').assignTo(task1, 50)
    
    t.is(task1.getEffort(), 38.5 + (8 + 6 + 0 + 0) * 0.5, 'Effort is 45.5h now - examine the calendar of Resource2')
    
    resourceStore.getById('Res4').assignTo(task1, 25)
    
    t.is(task1.getEffort(), 45.5 + (8 + 0 + 1 + 0) * 0.25, 'Effort is 47.75h now - examine the calendar of Resource2')
    
    
    //======================================================================================================================================================================================================================================================
    t.diag('Changing duration')
    
    // adding 1 business day to the task - at the end of task
    task1.setEndDate(new Date(2011, 6, 5, 17), false)

    t.is(task1.getEffort(), 47.75 + 8 * 1 + 8 * 0.75 + 8 * 0.5 + 8 * 0.25, 'The effort has increased according to assignment units of the resources')
    
    // adding 1 business day to the task - at the beginning of task
    task1.setStartDate(new Date(2011, 5, 30, 8), false)

    t.is(task1.getEffort(), 47.75 + 2 * (8 * 1 + 8 * 0.75 + 8 * 0.5 + 8 * 0.25), 'The effort has increased according to assignment units of the resources')
    
    // adding 2 more business days to task
    task1.setStartEndDate(new Date(2011, 5, 29, 8), new Date(2011, 6, 6, 17))
    
    t.is(task1.getEffort(), 47.75 + 4 * (8 * 1 + 8 * 0.75 + 8 * 0.5 + 8 * 0.25), 'The effort has increased according to assignment units of the resources')
    
    // now returning to original start/end dates 
    task1.setStartEndDate(new Date(2011, 6, 1, 8), new Date(2011, 6, 4, 17))
    
    t.is(task1.getEffort(), 47.75, 'The effort is also back')
    
    // now moving the task to the monday 05 Jul - the end date should be + 28h 
    task1.setStartDate(new Date(2011, 6, 5, 8))
    
    t.is(task1.getDuration('h'), 28, 'Duration is still 28 business hours')
    t.is(task1.getEndDate(), new Date(2011, 6, 8, 12), 'Correct end date calculated')
    
    t.is(task1.getEffort(), 3 * (8 * 1 + 8 * 0.75 + 8 * 0.5 + 8 * 0.25) + (4 * 1 + 4 * 0.75 + 4 * 0.5 + 4 * 0.25), 'The new effort is correct')
})    
