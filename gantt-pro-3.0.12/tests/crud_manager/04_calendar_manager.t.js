/*global MyCalendar*/
StartTest(function (t) {

    //

    t.it('Can omit fields in "appendChild" call', function (t) {

        t.expectGlobals('MyCalendar');

        Ext.define('MyCalendar', {
            extend : 'Gnt.data.Calendar',
            daysPerMonth : 6,
            daysPerWeek : 5,
            hoursPerDay : 4,
            weekendsAreWorkdays : true,
            weekendFirstDay : 1,
            weekendSecondDay : 2,
            defaultAvailability : ['01:23-22:22']
        });

        var calendarManager = new Gnt.data.CalendarManager({
            calendarClass : 'MyCalendar'
        });

        calendarManager.getRoot().appendChild({
            Id : 100,
            Name : 'c100',
            children : [
                {
                    Id : 101,
                    Name : 'c101',
                    CalendarClass : 'Gnt.data.calendar.BusinessTime',
                    children : [
                        {
                            Id : 102,
                            CalendarClass : 'Gnt.data.Calendar',
                            Name : 'c102'
                        }
                    ]
                }
            ]
        });

        var c100 = calendarManager.getNodeById(100);
        t.isInstanceOf(c100.getCalendar(), MyCalendar, 'c100: proper calendar class');
        t.is(c100.getName(), 'c100', 'c100: correct Name');
        t.is(c100.getDaysPerMonth(), 6, 'c100: correct DaysPerMonth');
        t.is(c100.getDaysPerWeek(), 5, 'c100: correct DaysPerWeek');
        t.is(c100.getHoursPerDay(), 4, 'c100: correct HoursPerDay');
        t.is(c100.getWeekendsAreWorkdays(), true, 'c100: correct WeekendsAreWorkdays');
        t.is(c100.getWeekendFirstDay(), 1, 'c100: correct WeekendFirstDay');
        t.is(c100.getWeekendSecondDay(), 2, 'c100: correct WeekendSecondDay');
        t.isDeeply(c100.getDefaultAvailability(), ['01:23-22:22'], 'c100: correct DefaultAvailability');

        var c101 = calendarManager.getNodeById(101);
        t.isInstanceOf(c101.getCalendar(), Gnt.data.calendar.BusinessTime, 'c101: proper calendar class');
        t.is(c101.getName(), 'c101', 'c101: correct Name');
        t.is(c101.getDaysPerMonth(), 20, 'c101: correct DaysPerMonth');
        t.is(c101.getDaysPerWeek(), 5, 'c101: correct DaysPerWeek');
        t.is(c101.getHoursPerDay(), 8, 'c101: correct HoursPerDay');
        t.is(c101.getWeekendsAreWorkdays(), false, 'c101: correct WeekendsAreWorkdays');
        t.is(c101.getWeekendFirstDay(), 6, 'c101: correct WeekendFirstDay');
        t.is(c101.getWeekendSecondDay(), 0, 'c101: correct WeekendSecondDay');
        t.isDeeply(c101.getDefaultAvailability(), ['08:00-12:00', '13:00-17:00'], 'c101: correct DefaultAvailability');

        var c102 = calendarManager.getNodeById(102);
        t.isInstanceOf(c102.getCalendar(), Gnt.data.Calendar, 'c102: proper calendar class');
        t.is(c102.getName(), 'c102', 'c102: correct Name');
        t.is(c102.getDaysPerMonth(), 30, 'c102: correct DaysPerMonth');
        t.is(c102.getDaysPerWeek(), 7, 'c102: correct DaysPerWeek');
        t.is(c102.getHoursPerDay(), 24, 'c102: correct HoursPerDay');
        t.is(c102.getWeekendsAreWorkdays(), false, 'c102: correct WeekendsAreWorkdays');
        t.is(c102.getWeekendFirstDay(), 6, 'c102: correct WeekendFirstDay');
        t.is(c102.getWeekendSecondDay(), 0, 'c102: correct WeekendSecondDay');
        t.isDeeply(c102.getDefaultAvailability(), ['00:00-24:00'], 'c102: correct DefaultAvailability');
    });
});
