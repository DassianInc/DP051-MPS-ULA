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

    task1.setSchedulingMode('EffortDriven')

    t.is(task1.getDuration(), 0, 'Duration is now 0 - no resources assigned to task')
    // start & end dates set to the end of prev day since it's a milestone now
    t.isStartEnd(task1, new Date(2011, 5, 30, 17), new Date(2011, 5, 30, 17), 'Correct start/end dates')

    resourceStore.getById('Res1').assignTo(task1)

    task1.setEffort(2)

    t.is(task1.getDuration('h'), 2, 'Duration is now 2h')
    t.isStartEnd(task1, new Date(2011, 6, 1, 8), new Date(2011, 6, 1, 10), 'Correct start/end dates')

    // setting the start date outside of the availability hours - testing the "skipNonWorkingTime" flag
    task1.setStartDate(new Date(2011, 6, 1, 6), true, true)

    t.isStartEnd(task1, new Date(2011, 6, 1, 8), new Date(2011, 6, 1, 10), 'Start/end dates did not change, since `skipNonWorkingTime` just rewind the task to the same time')

    task1.setStartDate(new Date(2011, 6, 1, 10), true, true)

    t.isStartEnd(task1, new Date(2011, 6, 1, 10), new Date(2011, 6, 1, 12), 'Correct start/end dates')

    task1.setStartDate(new Date(2011, 6, 1, 11), true, true)

    t.isStartEnd(task1, new Date(2011, 6, 1, 11), new Date(2011, 6, 1, 14), 'Task ends at 14:00 since 12:00-13:00 interval is not available')


    t.todo('Need to have `calculateEffortBasedStartDate` too', function (t) {
        // reseting the task
        task1.setStartDate(new Date(2011, 6, 1, 8), true, true)

        task1.setEndDate(new Date(2011, 6, 1, 14), true, true)

        t.isStartEnd(task1, new Date(2011, 6, 1, 11), new Date(2011, 6, 1, 14), 'Task ends at 14:00 since 12:00-13:00 interval is not available')
    })

    // reseting the task
    task1.setStartDate(new Date(2011, 6, 1, 8), true, true)
})
