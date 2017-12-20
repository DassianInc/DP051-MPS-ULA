StartTest(function(t) {
    
    //======================================================================================================================================================================================================================================================
    t.diag('Setup')
    
    var dataSet             = t.getSampleDataSet1()
    
    var taskStore           = dataSet.taskStore
    var dependencyStore     = dataSet.dependencyStore
    var resourceStore       = dataSet.resourceStore
    

    //======================================================================================================================================================================================================================================================
    t.diag('EffortDriven scheduling mode')
    
    var task2   = taskStore.getNodeById(2);
    
    t.is(task2.getSchedulingMode(), 'EffortDriven', 'We are testing what we were going to test :)')
    
    t.is(task2.getDuration('h'), 28, 'Duration is 28 business hours')
    t.is(task2.getDuration(), 28 / 8, 'Duration is 3.5 business days, 2 of them are exceptions - weekend with special availability')
    
    t.is(task2.getEffort(), 28, '8 + 4 + 16 = 28h effort - 2 full days of 1 resource + working weekend')

    // assigning one additional resource - should change the end date of the task
    resourceStore.getById('Res3').assignTo(task2)
    
    t.is(task2.getDuration(), 28 / 8 / 2, 'Duration should be twice less - 14h (as now 2 resources are working on the task)')
    
    t.isStartEnd(task2, new Date(2011, 6, 16, 11), new Date(2011, 6, 18, 10), 'Correct end date')
    
    t.is(task2.getEffort(), 28, 'Effort remains the same after assigning additional resource')
    
    // un-assigning the resource - state should be reverted back to previous one
    resourceStore.getById('Res3').unAssignFrom(task2)
    
    t.is(task2.getEffort(), 28, 'Effort is still the same')
    
    t.is(task2.getDuration(), 28 / 8, 'Duration was restored back')
    t.isStartEnd(task2, new Date(2011, 6, 16, 11), new Date(2011, 6, 19, 17), 'End date was restored back')

    
    // now assigning 3 additional resource - should change the end date of the task
    resourceStore.getById('Res3').assignTo(task2)
    resourceStore.getById('Res7').assignTo(task2)
    resourceStore.getById('Res8').assignTo(task2)

    t.is(task2.getEffort(), 28, 'Effort is still the same')
    
    t.is(task2.getDuration(), 28 / 8 / 4, 'Duration should be 4 times less - 7h (as now 4 resources are working on the task)')
    
    t.isStartEnd(task2, new Date(2011, 6, 16, 11), new Date(2011, 6, 16, 19), 'Correct end date for 7h duration')
    
    
})    
