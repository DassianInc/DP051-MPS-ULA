StartTest(function (t) {
    var generateCalendar = function (id, children) {
        var result = {
            Id                  : id,
            Name                : 'calendar' + id,
            DaysPerMonth        : 30,
            DaysPerWeek         : 7,
            HoursPerDay         : 24,
            WeekendsAreWorkdays : true,
            WeekendFirstDay     : 6,
            WeekendSecondDay    : 0,
            DefaultAvailability : [ '00:00-24:00' ]
        };

        if (children && children.length) {
            result.expanded = true;
            result.children = children;
        } else {
            result.leaf = true
        }

        return result;
    };

    var calendarManager = new Gnt.data.CalendarManager({
        root    : {
            expanded    : true,
            children    : [
                generateCalendar(1),
                generateCalendar(2, [
                    generateCalendar(21, [
                        generateCalendar(211)
                    ]),
                    generateCalendar(22)
                ]),
                generateCalendar(3)
            ]
        }
    });

    var calendar    = function (id) { return calendarManager.getById(id).getCalendar(); };

    t.it('getParentableCalendars should not include child nodes', function (t) {
        var calendar2 = calendar(2);
        var parentableCalendars = calendar2.getParentableCalendars();

        t.is(parentableCalendars.length, 2, '2 possible parents found');
        t.notOk(Ext.Array.some(parentableCalendars, function (item) { return item.parent === calendar2; }), 'No child nodes found');

        var calendar21 = calendar(21);
        parentableCalendars = calendar21.getParentableCalendars();

        t.is(parentableCalendars.length, 4, '4 possible parents found');
        t.notOk(Ext.Array.some(parentableCalendars, function (item) { return item.parent === calendar21; }), 'No child nodes found')
    });

    t.it('isChildOf should work correct', function (t) {
        var calendar2   = calendar(2);

        t.notOk(calendar(2).isChildOf(calendar(1)), 'calendar2 is not child of calendar1');
        t.notOk(calendar(2).isChildOf(calendar(21)), 'calendar2 is not child of calendar21');
        t.notOk(calendar(2).isChildOf(calendar(211)), 'calendar2 is not child of calendar211');
        t.notOk(calendar(2).isChildOf(calendar(3)), 'calendar2 is not child of calendar3');

        t.ok(calendar(211).isChildOf(calendar(21)), 'calendar211 is child of calendar21');
        t.ok(calendar(211).isChildOf(calendar(2)), 'calendar211 is child of calendar2');
        t.notOk(calendar(211).isChildOf(calendar(1)), 'calendar211 is not child of calendar1');
        t.notOk(calendar(211).isChildOf(calendar(3)), 'calendar211 is not child of calendar3');
    });
});