StartTest(function(t) {
    
    //======================================================================================================================================================================================================================================================
    t.diag('Setup')
    
    var dataSet             = t.getSampleDataSet1()
    
    var calendar            = dataSet.calendar
    

    //======================================================================================================================================================================================================================================================
    t.diag('Default Availability')
    
    var sunday      = calendar.getDefaultCalendarDay(0)
    var saturday    = calendar.getDefaultCalendarDay(6)
    
    t.isDeeply(sunday.getAvailability(), [], 'Sunday has no availablity intervals')
    t.isDeeply(saturday.getAvailability(), [], 'Saturaday has no availablity intervals')
    
    t.is(sunday.getTotalHours(), 0, 'iow - 0 hours are available')
    t.is(saturday.getTotalHours(), 0, 'iow - 0 hours are available')
    
    var checkWeekdayAvailability = function (dayIndex) {
        
        var availability    = calendar.getDefaultCalendarDay(dayIndex)
        
        t.isDeeply(availability.getAvailability(), [
            {
                startTime   : new Date(0, 0, 0, 8, 0),
                endTime     : new Date(0, 0, 0, 12, 0)
            },
            {
                startTime   : new Date(0, 0, 0, 13, 0),
                endTime     : new Date(0, 0, 0, 17, 0)
            }
        ], 'Week day has 2 standard availablility intervals')
    }
    
    checkWeekdayAvailability(1)
    checkWeekdayAvailability(2)
    checkWeekdayAvailability(3)
    checkWeekdayAvailability(4)
    checkWeekdayAvailability(5)

    
    //======================================================================================================================================================================================================================================================
    t.diag('Availability mutation')
    
    saturday.addAvailabilityInterval(new Date(0, 0, 0, 10), new Date(0, 0, 0, 16))

    t.isDeeply(saturday.getAvailability(), [
        {
            startTime   : new Date(0, 0, 0, 10, 0),
            endTime     : new Date(0, 0, 0, 16, 0)
        }
    ], 'Saturaday now has 1 availability inreval')
    
    t.is(saturday.getTotalHours(), 6, '6 working hours are available')
    
    
    t.throwsOk(function () {
        saturday.addAvailabilityInterval(new Date(0, 0, 0, 12), new Date(0, 0, 0, 17))
    }, 'Availability intervals should not intersect', 'Correct exception thrown - "Availability intervals should not intersect"')

    
    t.isDeeply(saturday.getAvailability(), [
        {
            startTime   : new Date(0, 0, 0, 10, 0),
            endTime     : new Date(0, 0, 0, 16, 0)
        }
    ], 'Availability did not change during invalid addition')
    
    
    // should support parsing from string as well
    saturday.addAvailabilityInterval('16:00', '18:00')

    t.isDeeply(saturday.getAvailability(), [
        {
            startTime   : new Date(0, 0, 0, 10, 0),
            endTime     : new Date(0, 0, 0, 16, 0)
        },
        {
            startTime   : new Date(0, 0, 0, 16, 0),
            endTime     : new Date(0, 0, 0, 18, 0)
        }
    ], 'Saturaday now has 2 availability inrevals')
    
    t.is(saturday.getTotalHours(), 8, '8 working hours are available')
    
    
    // should support parsing from string as well
    saturday.addAvailabilityInterval('09:00-10:00')

    t.isDeeply(saturday.getAvailability(), [
        {
            startTime   : new Date(0, 0, 0, 9, 0),
            endTime     : new Date(0, 0, 0, 10, 0)
        },
        {
            startTime   : new Date(0, 0, 0, 10, 0),
            endTime     : new Date(0, 0, 0, 16, 0)
        },
        {
            startTime   : new Date(0, 0, 0, 16, 0),
            endTime     : new Date(0, 0, 0, 18, 0)
        }
    ], 'Saturaday now has 3 availability inrevals')
    
    t.is(saturday.getTotalHours(), 9, '9 working hours are available')
    
    
    saturday.removeAvailbilityInterval(1)

    t.isDeeply(saturday.getAvailability(), [
        {
            startTime   : new Date(0, 0, 0, 9, 0),
            endTime     : new Date(0, 0, 0, 10, 0)
        },
        {
            startTime   : new Date(0, 0, 0, 16, 0),
            endTime     : new Date(0, 0, 0, 18, 0)
        }
    ], 'Saturaday now has 2 availability inrevals')
    
    t.is(saturday.getTotalHours(), 3, '3 working hours are available')

    
    saturday.removeAvailbilityInterval(0)
    saturday.removeAvailbilityInterval(0)

    t.isDeeply(saturday.getAvailability(), [], 'Saturaday now has no availability inrevals')
    
    t.is(saturday.getTotalHours(), 0, '0 working hours are available')
    

    //======================================================================================================================================================================================================================================================
    t.diag('Applying availability to the concrete day')
    
    var monday      = calendar.getDefaultCalendarDay(1)
    
    t.isDeeply(monday.getAvailabilityIntervalsFor(new Date(2012, 1, 21)), [
        {
            startDate       : new Date(2012, 1, 21, 8),
            endDate         : new Date(2012, 1, 21, 12)
        },
        {
            startDate       : new Date(2012, 1, 21, 13),
            endDate         : new Date(2012, 1, 21, 17)
        }
    ], 'Correctly applied availability intervals to a concrete day')
    
    t.is(monday.getAvailabilityStartFor(new Date(2012, 1, 21)), new Date(2012, 1, 21, 8), 'Correct earliest availability timestamp ')
    t.is(monday.getAvailabilityEndFor(new Date(2012, 1, 21)), new Date(2012, 1, 21, 17), 'Correct latest availability timestamp')
    
})    
