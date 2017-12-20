StartTest(function(t) {

    // Here we test that Gnt.data.CalendarManager data changes fire corresponding CrudManager "haschanges" event (#1942)

    var setup   = function (cfg) {
        cfg     = cfg || {};

        return new Gnt.data.CrudManager({
            calendarManager : new Gnt.data.CalendarManager({
                root : cfg.root || {
                    expanded    : true,
                    children    : [
                        {
                            Id                  : 100,
                            Name                : 'c100',
                            DaysPerMonth        : 30,
                            DaysPerWeek         : 7,
                            HoursPerDay         : 24,
                            WeekendsAreWorkdays : true,
                            WeekendFirstDay     : 6,
                            WeekendSecondDay    : 0,
                            DefaultAvailability : [ '00:00-24:00' ],
                            Days                : cfg.days || [
                                {
                                    Id      : 1,
                                    "Date"  : "2010-01-01"
                                },
                                {
                                    Id      : 2,
                                    "Date"  : "2010-01-01"
                                }
                            ]
                        }
                    ]
                }
            })
        });

    };

    t.it('Gnt.data.CrudManager fires "haschanges" on calendars data changes', function (t) {
        var crud = setup();

        var calendar = crud.getCalendarManager().getCalendar(100);

        // 1 - add, 1 - update, 1 - remove
        t.willFireNTimes(crud, 'haschanges', 3);

        t.notOk(crud.hasChanges(), 'No changes');

        calendar.add({ "Date" : new Date() });
        calendar.getById(1).set('Name', 'foo');
        calendar.remove(calendar.getById(2));

        t.ok(crud.hasChanges(), 'Changes detected');
    });

});
