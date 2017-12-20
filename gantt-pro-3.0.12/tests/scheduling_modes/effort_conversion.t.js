StartTest(function (t) {

    //======================================================================================================================================================================================================================================================
    t.diag('Setup');

    var dataSet = t.getSampleDataSet1();

    var taskStore = dataSet.taskStore;
    var dependencyStore = dataSet.dependencyStore;
    var resourceStore = dataSet.resourceStore;

    // task lasts 4 calendar days, 2 of which are weekends, so we have 2 days fixed duration task, with 2 resources assigned
    var task1 = taskStore.getNodeById(1);


    //======================================================================================================================================================================================================================================================
    t.it('Effort conversion', function (t) {

        t.isStartEnd(task1, new Date(2011, 6, 1, 8, 0), new Date(2011, 6, 4, 17, 0), "Correct start-end for task1")

        t.is(task1.getDuration(), 2, '2d duration');

        t.is(task1.getEffort(), 32, '32h effort - 2 days * 2 resources * 8 hours'); // assuming default assignment unit is 100
        t.is(task1.getEffort('d'), 4, '32 man-hours is 4 man-days');
        t.is(task1.getEffort('w'), 4 / 5, '32 man-hours is 4/5 of man-week');
        t.is(task1.getEffort('mo'), 4 / 20, '32 man-hours is 4/20 of man-month');
    });


    //======================================================================================================================================================================================================================================================
    t.it('Working duration', function (t) {

        t.is(task1.getDuration('d'), 2, '2 working days duration for Task1')
        t.is(task1.getDuration('h'), 16, '16 working hours duration for Task1')
        t.is(task1.getDuration('w'), 2 / 5, '0.4 working weeks duration for Task1')
        t.is(task1.getDuration('mo'), 2 / 20, '0.1 working months duration for Task1')
    });


    //======================================================================================================================================================================================================================================================
    t.it('Customizing effort conversion rules', function (t) {

        var calendar = t.getBusinessTimeCalendar({
            hoursPerDay  : 10,
            daysPerWeek  : 6,
            daysPerMonth : 24,

            defaultAvailability : [ '08:00-18:00' ]
        });

        // effort convertion rules are always taken from the project calendar
        // so we need to update it on the task store
        taskStore.setCalendar(calendar);

        t.is(task1.getDuration(), 2, '2d duration is still the same');
        t.isStartEnd(task1, new Date(2011, 6, 1, 8, 0), new Date(2011, 6, 4, 18, 0), "But `day` means 10 hours now, so end date slightly changed")

        t.is(task1.getEffort(), 40, 'Effort increases 40h = 2 days * 2 resources * 10 hours');

        t.is(task1.getEffort('d'), 40 / 10, '40 man-hours is 4 man-days, assuming man-day has 10 hours');
        t.is(task1.getEffort('w'), 40 / 10 / 6, '40 man-hours is 40 / 6 of man-week with 6 days per week');
        t.is(task1.getEffort('mo'), 40 / 10 / 24, '40 man-hours is 40 / 24 of man-month (24 days per month)');
    });
});
