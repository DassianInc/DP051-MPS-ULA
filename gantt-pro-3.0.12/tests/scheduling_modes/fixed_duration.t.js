StartTest(function(t) {
    
    //======================================================================================================================================================================================================================================================
    t.diag('Setup')
    
    var dataSet             = t.getSampleDataSet1()
    
    var taskStore           = dataSet.taskStore
    var dependencyStore     = dataSet.dependencyStore
    var resourceStore       = dataSet.resourceStore
    

    //======================================================================================================================================================================================================================================================
    t.diag('FixedDuration scheduling mode')
    
    // task lasts 4 calendar days, 2 of which are weekends, so we have 2 days fixed duration task, with 2 resources assigned
    var task1   = taskStore.getNodeById(1);
    
    t.is(task1.getSchedulingMode(), 'FixedDuration', 'We are testing what we were going to test :)')
    
    
    t.is(task1.getDuration(), 2, 'Duration is 2 business days') 
    
    t.is(task1.getEffort(), 32, '32h effort - 2 days * 2 resources * 8 hours') // assuming default assignment unit is 100%
    
    resourceStore.getById('Res3').assignTo(task1)
    
    t.isStartEnd(task1, new Date(2011, 6, 1, 8), new Date(2011, 6, 4, 17), 'The start/end dates of task remains the same')
    
    t.is(task1.getEffort(), 48, 'But effort has increased on 16 hours - 2 days of additional resource ')
    
    resourceStore.getById('Res3').unAssignFrom(task1)
    
    t.is(task1.getEffort(), 32, 'Effort is 32h again')
    
    resourceStore.getById('Res2').unAssignFrom(task1)
    
    t.is(task1.getEffort(), 16, 'Effort is 16h now')
    
    // assigning Resource2 to task1 with 50% allocation
    resourceStore.getById('Res2').assignTo(task1, 50)
    
    t.is(task1.getEffort(), 24, 'Effort is 24h now')

    
    //======================================================================================================================================================================================================================================================
    t.diag('Changing duration')
    
    // doubling the duration of the task
    task1.setDuration(4)

    t.is(task1.getEffort(), 48, 'The effort has doubled too')
    
})    
