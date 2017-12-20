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

    t.is(task1.getSchedulingMode(), 'FixedDuration', 'Initial data is correct')

    t.is(task1.getDuration('h'), 8 + 8 + 4 + 8, 'Duration is 28 business hours')
    t.is(task1.getEffort(), 0, 'Initial effort is zero - no resources assigned')

    task1.setSchedulingMode('EffortDriven')

    t.is(task1.getSchedulingMode(), 'EffortDriven', 'Scheduling mode has been changed successfully')

    t.is(task1.getDuration(), 0, 'Duration is now 0 - no resources assigned to task')
    // start & end dates set to the end of prev day since it's a milestone now
    t.isStartEnd(task1, new Date(2011, 5, 30, 17), new Date(2011, 5, 30, 17), 'Correct start/end dates')

    var res1Assignment  = resourceStore.getById('Res1').assignTo(task1)
    var res2Assignment  = resourceStore.getById('Res2').assignTo(task1, 75)
    var res3Assignment  = resourceStore.getById('Res3').assignTo(task1, 50)
    var res4Assignment  = resourceStore.getById('Res4').assignTo(task1, 25)

    task1.setEffort(1.75)

    t.is(res1Assignment.getEffort(), 1, 'Resource1 is contributing 1h of effort')
    t.is(res2Assignment.getEffort(), 0, 'Resource2 is not contributing anything  - its not available')
    t.is(res3Assignment.getEffort(), 0.5, 'Resource3 is contributing 0.5h of effort')
    t.is(res4Assignment.getEffort(), 0.25, 'Resource4 is not contributing 0.25h of effort')

    t.is(task1.getDuration('h'), 1, 'Duration is now 1h - 3 available resources assigned to task with variable assignment units')
    t.isStartEnd(task1, new Date(2011, 6, 1, 8), new Date(2011, 6, 1, 9), 'Correct start/end dates')

    task1.setEffort(7)

    t.is(task1.getDuration('h'), 4, 'Duration is now 4h - 3 available resources assigned to task with variable assignment units')
    t.isStartEnd(task1, new Date(2011, 6, 1, 8), new Date(2011, 6, 1, 12), 'Correct start/end dates')

    task1.setEffort(7 + 2.5)  // 9.5

    t.is(task1.getDuration('h'), 5, 'Duration is now 5h - Res2 now also work on the task for 1h')
    t.isStartEnd(task1, new Date(2011, 6, 1, 8), new Date(2011, 6, 1, 14), 'Correct start/end dates')

    t.is(res1Assignment.getEffort(), 5, 'Resource1 is contributing 5h of effort')
    t.is(res2Assignment.getEffort(), 0.75, 'Resource2 is contributing 0.75h of effort 13:00-14:00 with 0.75 units')
    t.is(res3Assignment.getEffort(), 5 * 0.5, 'Resource3 is contributing 2.5h of effort = 08:00-12:00 + 13:00-14:00 with 0.5 units')
    t.is(res4Assignment.getEffort(), 5 * 0.25, 'Resource4 is not contributing 1.25h of effort = 08:00-12:00 + 13:00-14:00 with 0.25 units')


    task1.setEffort(7 + 2.5 * 4 - 1 * 0.75) // 16.25

    t.is(task1.getDuration('h'), 8, 'Duration is now 8h, Res2 only works will from 13 till 16 on 07/01')
    t.isStartEnd(task1, new Date(2011, 6, 1, 8), new Date(2011, 6, 1, 17), 'Correct start/end dates')


    task1.setEffort(16.25 + 1 + 1 * 0.75) // 18

    t.is(task1.getDuration('h'), 8 + 1, 'Only 2 resources are available starting from 11AM at 07/02')
    t.isStartEnd(task1, new Date(2011, 6, 1, 8), new Date(2011, 6, 2, 12), 'Correct start/end dates')


    task1.setEffort(16.25 + 5 + 3 * 0.75 + 4 * 0.5 + 0 * 0.25) // 25,5

    t.is(task1.getDuration('h'), 8 + 5, 'Only 2 resources are available starting from 11AM at 07/02')
    t.isStartEnd(task1, new Date(2011, 6, 1, 8), new Date(2011, 6, 2, 16), 'Correct start/end dates')

    task1.setEffort(47.75) // value from fixed duration test

    t.is(task1.getDuration('h'), 28, 'Duration should be 28h')
    t.isStartEnd(task1, new Date(2011, 6, 1, 8), new Date(2011, 6, 4, 17), 'Correct start/end dates')
})
