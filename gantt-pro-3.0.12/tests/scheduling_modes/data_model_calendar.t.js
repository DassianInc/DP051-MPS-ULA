StartTest(function(t) {
    
    //======================================================================================================================================================================================================================================================
    t.diag('Setup');

    var calendar1           = t.getCalendar({
        calendarId      : 'calendar1',
        
        defaultAvailability : '01:00-15:00',

        data            : [
            // weekend shifted from 4/5 to 6/7
            {
                Date            : new Date(2012, 1, 4),
                IsWorkingDay    : true,
                
                Availability    : [ '10:00-17:00' ]
            },
            {
                Date            : new Date(2012, 1, 5),
                IsWorkingDay    : true,
                
                Availability    : [ '10:00-17:00' ]
            },
            {
                Date            : new Date(2012, 1, 6),
                IsWorkingDay    : false
            },
            {
                Date            : new Date(2012, 1, 7),
                IsWorkingDay    : false
            },
            {
                Type            : 'WEEKDAY',
                Weekday         : 2,
                IsWorkingDay    : true,
                Availability    : [ '10:00-11:00' ]
            }
        ]
    });

    t.is(Gnt.data.Calendar.getCalendar('calendar1'), calendar1, 'Correct calendar found by id');
    
    t.is(calendar1.getDefaultCalendarDay(0), calendar1.defaultWeekAvailability[ 0 ], 'Days from default week are stored in `defaultWeekAvailability`')
    
    
    var calendar2           = t.getCalendar({
        calendarId      : 'calendar2',
        
        parent          : 'calendar1',
        
        data            : [
            // explicitly specified the holiday
            {
                Date            : new Date(2012, 1, 7),
                IsWorkingDay    : true,
                
                Availability    : [ '08:00-17:00' ]
            },
            {
                Id              : 'mainday',
                Type            : 'WEEKDAYOVERRIDE',
                IsWorkingDay    : true,
                Name            : 'WEEKFOO',
                OverrideStartDate   : new Date(2012, 1, 8),
                OverrideEndDate     : new Date(2012, 1, 29),
                // indicates "main" day
                Weekday             : -1
            },
            {
                Id              : 'weekdayoverride',
                Type            : 'WEEKDAYOVERRIDE',
                IsWorkingDay    : true,
                Name            : 'WEEKFOO',
                
                OverrideStartDate   : new Date(2012, 1, 8),
                OverrideEndDate     : new Date(2012, 1, 29),
                
                Weekday             : 3,
                
                Availability        : [ '11:00-15:00' ]
            },
            {
                Type            : 'WEEKDAY',
                Weekday         : 2,
                IsWorkingDay    : true,
                Availability    : [ '11:00-12:00' ]
            }
        ]
    })
    
    t.is(calendar2.parent, calendar1, "Correctly set parent calendar");
    
    
    var calendar3           = t.getCalendar({
        parent              : 'calendar2',
        
        defaultAvailability : '03:00-15:00'
    })
    
    t.is(calendar3.parent, calendar2, "Correctly set parent calendar");

    t.isDeeply(Gnt.data.Calendar.getAllCalendars(), [ calendar1, calendar2 ], 'Correct list of calendars received from `getAllCalendars` - "calendar3" has no id');
    
    //======================================================================================================================================================================================================================================================
    t.diag('Parent-child relationships');
    
    t.is(calendar3.isHoliday(new Date(2012, 1, 7)), false, 'Own data overrides parent data');
    
    // `getCalendarDay` - should return either instance of CalendarDay for that day or the "default" instance for the week day
    var calendarDay     = calendar3.getCalendarDay(new Date(2012, 1, 7));
    
    t.is(calendarDay, calendar2.getOwnCalendarDay(new Date(2012, 1, 7)), 'The day for 2012/Feb/07 is specified as override');
    

    t.ok(calendar3.isHoliday(new Date(2012, 1, 6)), 'Found holiday in parent data');

    var calendarDay2    = calendar3.getCalendarDay(new Date(2012, 1, 6));
    
    t.is(calendarDay2, calendar1.getOwnCalendarDay(new Date(2012, 1, 6)), 'The day for 2012/Feb/06 is found in parent calendar');
    
    
    t.notOk(calendar3.isHoliday(new Date(2012, 1, 5)), 'Found working day override in parent data');
    t.notOk(calendar3.isHoliday(new Date(2012, 1, 4)), 'Found working day override in parent data');

    t.is(calendar3.getCalendarDay(new Date(2012, 1, 3)), calendar3.defaultWeekAvailability[ 5 ], 'Since calendar3 defines own `defaultAvailability` - it should be taken from calendar3 itself');
    
    t.is(calendar2.getCalendarDay(new Date(2012, 1, 3)), calendar1.defaultWeekAvailability[ 5 ], 'In the same time calendar2 does not define own `defaultAvailability` - so we take it from parent - calendar1');

    // Tuesday in Calendar 3
    t.is(calendar3.getCalendarDay(new Date(2012, 1, 21)), calendar3.getWeekDay(2), 'Correctly found Tuesday week day')
    t.is(calendar3.getWeekDay(2), calendar2.getWeekDay(2), '... which is defined in parent')
    t.isDeeply(calendar3.getWeekDay(2).getAvailability(true), [ '11:00-12:00' ], '.. in the parent - calendar2')
    
    // Tuesday in Calendar 2
    t.is(calendar2.getCalendarDay(new Date(2012, 1, 21)), calendar2.getWeekDay(2), 'Correctly found Tuesday week day')
    t.is(calendar2.getWeekDay(2).store, calendar2, '... which is defined in the calendar2 itself')
    t.isDeeply(calendar2.getWeekDay(2).getAvailability(true), [ '11:00-12:00' ], '.. in the parent - calendar2')
    
    
    
    //======================================================================================================================================================================================================================================================
    t.diag('Checking non-standard weeks');
    
    var nonStandardWeekDay  = calendar2.getById('weekdayoverride')
    
    var weekDefinition    = {
        startDate           : new Date(2012, 1, 8),
        endDate             : new Date(2012, 1, 29),
        name                : 'WEEKFOO',
        weekAvailability    : [ undefined, undefined, undefined, nonStandardWeekDay ],
        mainDay             : calendar2.getById('mainday')
    }
    
    t.isDeeply(calendar2.getNonStandardWeekByStartDate(new Date(2012, 1, 8)), weekDefinition, 'Correct non-standard week returned - by start date')
    t.isDeeply(calendar2.getNonStandardWeekByDate(new Date(2012, 1, 8)), weekDefinition, 'Correct non-standard week returned - by any date within of it')
    t.isDeeply(calendar2.getNonStandardWeekByDate(new Date(2012, 1, 9, 1, 2)), weekDefinition, 'Correct non-standard week returned - by any date within of it')
    t.isDeeply(calendar2.getNonStandardWeekByDate(new Date(2012, 1, 29, 18, 10)), weekDefinition, 'Correct non-standard week returned - by any date within of it')
    
    t.is(calendar2.getCalendarDay(new Date(2012, 1, 8)), nonStandardWeekDay, 'Correctly found the week day from *non-standard* week')
    t.is(calendar2.getCalendarDay(new Date(2012, 1, 9)), calendar2.getDefaultCalendarDay(4), 'Correctly found the week day from *standard* week')
    t.is(calendar2.getCalendarDay(new Date(2012, 1, 15)), nonStandardWeekDay, 'Correctly found the week day from *non-standard* week')
    t.is(calendar2.getCalendarDay(new Date(2012, 1, 22)), nonStandardWeekDay, 'Correctly found the week day from *non-standard* week')
    t.is(calendar2.getCalendarDay(new Date(2012, 1, 29)), nonStandardWeekDay, 'Correctly found the week day from *non-standard* week')
    
    // almost the same assertions should be true for calendar3, since it inherit from calendar2
    t.is(calendar3.getCalendarDay(new Date(2012, 1, 8)), nonStandardWeekDay, 'Correctly found the week day from *non-standard* week')
    t.is(calendar3.getCalendarDay(new Date(2012, 1, 9)), calendar3.getDefaultCalendarDay(4), 'Since calendar3 defines own default availability day from standard week should be taken from calendar3 itself')
    t.is(calendar3.getCalendarDay(new Date(2012, 1, 15)), nonStandardWeekDay, 'Correctly found the week day from *non-standard* week')
    t.is(calendar3.getCalendarDay(new Date(2012, 1, 22)), nonStandardWeekDay, 'Correctly found the week day from *non-standard* week')
    t.is(calendar3.getCalendarDay(new Date(2012, 1, 29)), nonStandardWeekDay, 'Correctly found the week day from *non-standard* week')
    

    
    //======================================================================================================================================================================================================================================================
    t.diag('CRUD for non-standard weeks');
    
    t.throwsOk(function () {
        
        calendar2.addNonStandardWeek(new Date(2012, 1, 9), new Date(2012, 1, 10), [])
        
    }, /.*/, 'Exception is thrown')
    
    var rangeBefore     = calendar2.getRange()
    
    calendar2.addNonStandardWeek(
        new Date(2012, 2, 1), 
        new Date(2012, 2, 15), 
        [ undefined, new Gnt.model.CalendarDay({ Availability : [ '09:00-12:00' ] }), [ '09:00-12:00' ] ]
    )
    
    t.is(calendar2.getCount(), rangeBefore.length + 3, '2 new "week override" calendar days were added + 1 "main" day for it')
    
    var standardWeekDay2        = calendar2.getDefaultCalendarDay(1)
    var nonStandardWeekDay2     = calendar2.getNonStandardWeekByStartDate(new Date(2012, 2, 1)).weekAvailability[ 1 ]
    var nonStandardWeekDay3     = calendar2.getNonStandardWeekByStartDate(new Date(2012, 2, 1)).weekAvailability[ 2 ]
    
    t.ok(nonStandardWeekDay2, "New non-standard day was created in the store")
    t.ok(nonStandardWeekDay3, "New non-standard day was created in the store")
    
    t.is(nonStandardWeekDay2.getType(), 'WEEKDAYOVERRIDE', 'Correct type set on the day')
    t.is(nonStandardWeekDay2.getOverrideStartDate(), new Date(2012, 2, 1), 'Correct override start date set on the day')
    t.is(nonStandardWeekDay2.getOverrideEndDate(), new Date(2012, 2, 15), 'Correct override end date set on the day')
    t.is(nonStandardWeekDay2.getWeekday(), 1, 'Correct override week day set on the day')
    
    t.is(nonStandardWeekDay3.getType(), 'WEEKDAYOVERRIDE', 'Correct type set on the day')
    t.is(nonStandardWeekDay3.getOverrideStartDate(), new Date(2012, 2, 1), 'Correct override start date set on the day')
    t.is(nonStandardWeekDay3.getOverrideEndDate(), new Date(2012, 2, 15), 'Correct override end date set on the day')
    t.is(nonStandardWeekDay3.getWeekday(), 2, 'Correct override week day set on the day')
    
    t.is(calendar2.getCalendarDay(new Date(2012, 2, 5)), nonStandardWeekDay2, 'Correctly found the week day from *non-standard* week')
    t.is(calendar2.getCalendarDay(new Date(2012, 2, 12)), nonStandardWeekDay2, 'Correctly found the week day from *non-standard* week')
    
    t.is(calendar2.getCalendarDay(new Date(2012, 2, 6)), nonStandardWeekDay3, 'Correctly found the week day from *non-standard* week')
    t.is(calendar2.getCalendarDay(new Date(2012, 2, 13)), nonStandardWeekDay3, 'Correctly found the week day from *non-standard* week')
    
    calendar2.removeNonStandardWeek(new Date(2012, 2, 1))
    
    t.is(calendar2.getCalendarDay(new Date(2012, 2, 5)), standardWeekDay2, 'Correctly found the standard week day')
    t.is(calendar2.getCalendarDay(new Date(2012, 2, 12)), standardWeekDay2, 'Correctly found the standard  week day')
    
    t.isDeeply(calendar2.getRange(), rangeBefore, "Removing week also removes all its days")
    
    
    //============================================
    t.diag('Testing setParent');
    
    t.willFireNTimes(calendar3, 'parentchange', 1)
    
    calendar3.setParent(calendar1);
    
    t.is(calendar3.getWeekDay(2), calendar1.getWeekDay(2), 'Found week day in new parent');
    
    
    //============================================
    t.diag('Changing the `calendarId` property');
    
    var calendarWithoutId = new Gnt.data.Calendar();
    
    calendarWithoutId.setCalendarId('dynamicId');

    t.is(Gnt.data.Calendar.getCalendar('dynamicId'), calendarWithoutId, 'Setting `calendarId` dynmicallly registered the calendar in the registry');
    
    calendar1.setCalendarId('newId');
    
    t.notOk(Gnt.data.Calendar.getCalendar('calendar1'), 'Calendar can not be found under old id');
    t.is(Gnt.data.Calendar.getCalendar('newId'), calendar1, 'Calendar is found under new id');
});
