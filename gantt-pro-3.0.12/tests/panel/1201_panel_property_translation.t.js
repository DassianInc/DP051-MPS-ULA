StartTest(function(t) {
    //calendar.setWeekendsAreWorkDays(this.weekendsAreWorkdays);
    var g = t.getGantt({
        weekendsAreWorkdays : true
    });
    
    var cal = g.getTaskStore().getCalendar();

    t.ok(cal.weekendsAreWorkdays, 'weekendsAreWorkdays propagated to Calendar properly');
    t.ok(cal.isWorkingDay(new Date(2012, 5, 2)), 'weekendsAreWorkdays propagated to Calendar properly');
    t.ok(cal.isWorkingDay(new Date(2012, 5, 3)), 'weekendsAreWorkdays propagated to Calendar properly');


});
