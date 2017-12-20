StartTest(function (t) {

    t.it('Calendar model supports float DaysPerMonth/DaysPerWeek/HoursPerDay', function (t) {

            var calendarManager2 = Ext.create('Gnt.data.CalendarManager');

            calendarManager2.setRoot({
                expanded    : true,
                children    : [
                    {
                        Id                  : 90000,
                        Name                : 'c90000',
                        DaysPerMonth        : 30.5,
                        DaysPerWeek         : 6.5,
                        HoursPerDay         : 23.5,
                        WeekendsAreWorkdays : true,
                        WeekendFirstDay     : 6,
                        WeekendSecondDay    : 0,
                        DefaultAvailability : [ '00:00-24:00' ]
                    }
                ]
            });

            var calendarRecord = calendarManager2.getRoot().firstChild;

            t.is(calendarRecord.getDaysPerMonth(), 30.5);
            t.is(calendarRecord.getDaysPerWeek(), 6.5);
            t.is(calendarRecord.getHoursPerDay(), 23.5)

            var calendar = calendarRecord.getCalendar();

            t.is(calendar.daysPerMonth, 30.5);
            t.is(calendar.daysPerWeek, 6.5);
            t.is(calendar.hoursPerDay, 23.5)
    });

});