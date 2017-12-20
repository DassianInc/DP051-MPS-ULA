StartTest(function(t) {

    t.diag('Setup, no additional holidays defined');

    var calendar        = t.getCalendar({
        weekendFirstDay     : 1,
        weekendSecondDay    : 2
    });

    var day0 = new Date(2010, 1, 7),
        day1 = new Date(2010, 1, 8),
        day2 = new Date(2010, 1, 9);

    t.notOk(calendar.isHoliday(day0), 'Sunday is not a holiday');
    t.notOk(calendar.isWeekend(day0), 'Sunday is not a weekend');
    
    t.ok(calendar.isHoliday(day1), 'Monday is a holiday');
    t.ok(calendar.isHoliday(day2), 'Tuesday is a holiday');
    t.ok(calendar.isWeekend(day2), 'Tuesday is a weekend');
    
    t.ok(calendar.isHoliday(day1), 'Monday is a holiday');
    t.ok(calendar.isHoliday(day2), 'Tuesday is a holiday');
    t.ok(calendar.isWeekend(day2), 'Tuesday is a weekend');
        
})    
