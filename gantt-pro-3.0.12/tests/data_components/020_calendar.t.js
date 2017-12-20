StartTest(function(t) {

    //======================================================================================================================================================================================================================================================
    t.diag('Sanity')

    t.ok(Gnt.data.Calendar, "Gnt.data.Calendar is here")
    t.ok(Gnt.model.Task, "Gnt.model.Task is here")

    var DATE        = Sch.util.Date

    //======================================================================================================================================================================================================================================================
    t.diag('Setup')


    var calendar        = new Gnt.data.Calendar({

        data        : [
            {
                Date        : new Date(2011, 6, 4)
            },
            {
                Date        : new Date(2011, 6, 5)
            },
            {
                Date            : new Date(2011, 6, 9),
                IsWorkingDay    : true
            }
        ]
    })

    var task            = new Gnt.model.Task()

    task.calendar       = calendar


    //======================================================================================================================================================================================================================================================
    t.diag('Duration')

    t.is(task.calculateDuration(new Date(2011, 6, 1, 12, 0, 0), new Date(2011, 6, 1, 12, 0, 0), DATE.HOUR), 0, 'Correct duration #1')
    t.is(task.calculateDuration(new Date(2011, 6, 1, 12, 0, 0), new Date(2011, 6, 2, 12, 0, 0), DATE.HOUR), 12, 'Correct duration #2')
    t.is(task.calculateDuration(new Date(2011, 6, 1, 12, 0, 0), new Date(2011, 6, 6, 12, 0, 0), DATE.HOUR), 24, 'Correct duration #3')
    t.is(task.calculateDuration(new Date(2011, 6, 1, 12, 0, 0), new Date(2011, 6, 6, 12, 0, 0), DATE.DAY), 1, 'Correct duration #4')
    t.is(task.calculateDuration(new Date(2011, 6, 1, 12, 0, 0), new Date(2011, 6, 6, 12, 0, 0), DATE.MONTH), 1 / 30, 'Correct duration #5')


    t.is(task.calculateDuration(new Date(2011, 6, 1, 23, 59, 59), new Date(2011, 6, 2, 0, 0, 0), DATE.SECOND), 1, 'Correct duration #6')
    t.is(task.calculateDuration(new Date(2011, 6, 1, 23, 59, 59), new Date(2011, 6, 6, 0, 0, 1), DATE.SECOND), 2, 'Correct duration #7')

    t.is(task.calculateDuration(new Date(2011, 6, 1, 23, 59, 59), null, DATE.SECOND), 0, 'Correct null duration #1')
    t.is(task.calculateDuration(null, new Date(2011, 6, 1, 23, 59, 59), DATE.SECOND), 0, 'Correct null duration #2')

    //======================================================================================================================================================================================================================================================
    t.diag('Duration - cross DST')

    t.is(task.calculateDuration(new Date(2012, 1, 27, 0, 0, 0), new Date(2012, 2, 3, 0, 0, 0), DATE.DAY), 5, 'Correct cross duration in days')
    t.is(task.calculateDuration(new Date(2012, 1, 29, 0, 0, 0), new Date(2012, 2, 1, 0, 0, 0), DATE.HOUR), 24, 'Correct cross duration in hours')
    t.is(task.calculateDuration(new Date(2012, 1, 29, 23, 59, 59), new Date(2012, 2, 1, 0, 0, 0), DATE.SECOND), 1, 'Correct cross duration in seconds')


    //======================================================================================================================================================================================================================================================
    t.diag('EndDate')

    t.isDateEqual(task.calculateEndDate(new Date(2011, 6, 1, 12, 0, 0), 0,   DATE.HOUR), new Date(2011, 6, 1, 12), 'Correct end date #1')
    t.isDateEqual(task.calculateEndDate(new Date(2011, 6, 1, 12, 0, 0), 12,  DATE.HOUR), new Date(2011, 6, 2), 'Correct end date #2')
    t.isDateEqual(task.calculateEndDate(new Date(2011, 6, 1, 12, 0, 0), 24,  DATE.HOUR), new Date(2011, 6, 6, 12), 'Correct end date #3')
    t.isDateEqual(task.calculateEndDate(new Date(2011, 6, 1, 12, 0, 0), 1,   DATE.DAY),  new Date(2011, 6, 6, 12), 'Correct end date #4')

    t.isDateEqual(task.calculateEndDate(new Date(2011, 6, 1, 23, 59, 59), 1, DATE.SECOND), new Date(2011, 6, 2, 0, 0, 0), 'Correct end date #5')
    t.isDateEqual(task.calculateEndDate(new Date(2011, 6, 1, 23, 59, 59), 2, DATE.SECOND), new Date(2011, 6, 6, 0, 0, 1), 'Correct end date #6')


    //======================================================================================================================================================================================================================================================
    t.diag('EndDate - cross DST')

    t.isDateEqual(task.calculateEndDate(new Date(2012, 1, 27, 0, 0, 0), 5, DATE.DAY), new Date(2012, 2, 3, 0, 0, 0), 'Correct cross DST end date')
    t.isDateEqual(task.calculateEndDate(new Date(2012, 1, 29, 0, 0, 0), 24, DATE.HOUR), new Date(2012, 2, 1, 0, 0, 0), 'Correct cross DST end date')
    t.isDateEqual(task.calculateEndDate(new Date(2012, 1, 29, 23, 59, 59), 1, DATE.SECOND), new Date(2012, 2, 1, 0, 0, 0), 'Correct cross DST end date')


    //======================================================================================================================================================================================================================================================
    t.diag('StartDate')
    var d=new Date(2011, 6, 1, 12);
    t.isDateEqual(task.calculateStartDate(new Date(2011, 6, 1, 12, 0, 0), 0,   DATE.HOUR), d, 'Correct start date #1')
    t.isDateEqual(task.calculateStartDate(new Date(2011, 6, 2, 12, 0, 0), 12,  DATE.HOUR), d, 'Correct start date #2')
    t.isDateEqual(task.calculateStartDate(new Date(2011, 6, 6, 12, 0, 0), 24,  DATE.HOUR), d, 'Correct start date #3')
    t.isDateEqual(task.calculateStartDate(new Date(2011, 6, 6, 12, 0, 0), 1,   DATE.DAY),  d, 'Correct start date #4')

    t.isDateEqual(task.calculateStartDate(new Date(2011, 6, 2, 0, 0, 0), 1, DATE.SECOND), new Date(2011, 6, 1, 23, 59, 59), 'Correct start date #5')
    t.isDateEqual(task.calculateStartDate(new Date(2011, 6, 6, 0, 0, 1), 2, DATE.SECOND), new Date(2011, 6, 1, 23, 59, 59), 'Correct start date #6')


    //======================================================================================================================================================================================================================================================
    t.diag('StartDate - cross DST')

    t.isDateEqual(task.calculateStartDate(new Date(2012, 2, 3, 0, 0, 0), 5, DATE.DAY), new Date(2012, 1, 27, 0, 0, 0), 'Correct cross DST start date')
    t.isDateEqual(task.calculateStartDate(new Date(2012, 2, 1, 0, 0, 0), 24, DATE.HOUR), new Date(2012, 1, 29, 0, 0, 0), 'Correct cross DST start date')
    t.isDateEqual(task.calculateStartDate(new Date(2012, 2, 1, 0, 0, 0), 1, DATE.SECOND), new Date(2012, 1, 29, 23, 59, 59), 'Correct cross DST start date')


    //======================================================================================================================================================================================================================================================
    t.diag('Ranges')

    var ranges  = calendar.getHolidaysRanges(new Date(2011, 5, 29, 12, 0, 0), new Date(2011, 6, 12, 0, 0, 0))

    t.is(ranges.length, 2, "2 holiday ranges")

    t.isDateEqual(ranges[0].get('StartDate'), new Date(2011, 6, 2), "Correct first range start")
    t.isDateEqual(ranges[0].get('EndDate'), new Date(2011, 6, 6), "Correct first range end")

    t.isDateEqual(ranges[1].get('StartDate'), new Date(2011, 6, 10), "Correct first range start")
    t.isDateEqual(ranges[1].get('EndDate'), new Date(2011, 6, 11), "Correct first range end")


    //======================================================================================================================================================================================================================================================
    t.diag('Ranges with custom CSS classes')


    var calendar        = new Gnt.data.Calendar({

        data        : [
            {
                Date        : new Date(2011, 6, 4),
                Cls         : 'custom1'
            },
            {
                Date        : new Date(2011, 6, 5),
                Cls         : 'custom2'
            },
            {
                Date            : new Date(2011, 6, 9),
                IsWorkingDay    : true
            }
        ]
    })

    var ranges  = calendar.getHolidaysRanges(new Date(2011, 5, 29, 12, 0, 0), new Date(2011, 6, 12, 0, 0, 0))

    t.is(ranges.length, 4, "4 holiday ranges")

    t.isDateEqual(ranges[0].get('StartDate'), new Date(2011, 6, 2), "Correct usual weekend range start")
    t.isDateEqual(ranges[0].get('EndDate'), new Date(2011, 6, 4), "Correct weekend range end")

    t.isDateEqual(ranges[1].get('StartDate'), new Date(2011, 6, 4), "Correct `custom1` range start")
    t.isDateEqual(ranges[1].get('EndDate'), new Date(2011, 6, 5), "Correct `custom1` range end")

    t.isDateEqual(ranges[2].get('StartDate'), new Date(2011, 6, 5), "Correct `custom2` range start")
    t.isDateEqual(ranges[2].get('EndDate'), new Date(2011, 6, 6), "Correct `custom2` range end")

    t.isDateEqual(ranges[3].get('StartDate'), new Date(2011, 6, 10), "Correct 2nd weekend (with exception) range start")
    t.isDateEqual(ranges[3].get('EndDate'), new Date(2011, 6, 11), "Correct 2nd weekend (with exception) range end")


    //======================================================================================================================================================================================================================================================
    t.diag('Ranges - cross DST + 1 day from weekend only')


    var ranges  = calendar.getHolidaysRanges(new Date(2012, 1, 26, 12, 0, 0), new Date(2012, 2, 4, 0, 0, 0))

    t.is(ranges.length, 2, "2 holiday ranges")

    t.isDateEqual(ranges[0].get('StartDate'), new Date(2012, 1, 26), "Correct first range start")
    t.isDateEqual(ranges[0].get('EndDate'), new Date(2012, 1, 27), "Correct first range end")

    t.isDateEqual(ranges[1].get('StartDate'), new Date(2012, 2, 3), "Correct first range start")
    t.isDateEqual(ranges[1].get('EndDate'), new Date(2012, 2, 4), "Correct first range end")


    // ----------------------
    // Task ending on DST edge, https://www.assembla.com/spaces/bryntum/support/tickets/270
    task.setStartDate(new Date(2011, 2, 10));
    task.calendar = calendar;
    calendar.setWeekendsAreWorkDays(true);

    // Only run in Swedish timezone
    if (!Ext.Date.isDST(new Date(2012, 2, 25, 0))) {
        var endDate     = task.calculateEndDate(new Date(2011, 2, 10), 18, DATE.DAY)

        // Nickolay: some weird date result on my machine: GMT+27
        // Arcady: ..for me it's GMT+30
        // Maxim: .. for me it's GMT+31
        if (!endDate.toString().match(/GMT\+2700/) && !endDate.toString().match(/GMT\+3000/) && !endDate.toString().match(/GMT\+3100/)) {
            t.isDateEqual(endDate, new Date(2011, 2, 28), "Task should end on midnight, crossing DST")
        }
    }
})
