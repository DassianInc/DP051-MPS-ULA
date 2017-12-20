StartTest(function (t) {

    var calendarWidget, calendar, dayGrid, dayStore

    var generateDataSet = function (doNotReCreateCalendar) {
        var parentCalendar1 = new Gnt.data.Calendar({
                name        : 'Parent1',
                calendarId  : 'Parent1'
            }),
            parentCalendar2 = new Gnt.data.calendar.BusinessTime({
                name        : 'Parent2',
                calendarId  : 'Parent2'
            });

        if (!doNotReCreateCalendar) calendar = new Gnt.data.calendar.BusinessTime({
            name            : 'Calendar',
            parent          : parentCalendar1,
            data            : [
                {
                    Id              : 'initial1',
                    Date            : new Date(2010, 0, 13),
                    Name            : 'foo1',
                    Cls             : 'gnt-national-holiday'
                },
                {
                    Id              : 'initial2',
                    Date            : new Date(2010, 0, 15),
                    Name            : 'foo2',
                    Cls             : 'gnt-national-holiday'
                }
            ]
        });

        if (calendarWidget) calendarWidget.destroy()

        calendarWidget = new Gnt.widget.calendar.Calendar({
            calendar    : calendar,
            height      : 550,
            width       : 600,
            renderTo    : Ext.getBody()
        });

        dayGrid         = calendarWidget.dayGrid
        dayStore        = dayGrid.getStore()
    }

    generateDataSet()

    t.is(dayStore.getCount(), 2, "2 day override should present already");
    t.is(calendar.getCount(), 2, "2 day override should present already");

    t.chain(
        function (next) {
            calendarWidget.addDay();

            dayStore.getById('initial1').setName('new name');

            dayStore.remove(dayStore.getById('initial2'));

            next();
        },
        function (next) {
            // 1 update
            // 1 removal - 1 main + 1 override
            // 1 addition

            t.firesOk({
                observable      : calendar,
                events          : { update : 1, add : 1, remove : 1 },

                during          : function () {
                    calendarWidget.applyChanges()
                }
            })

            t.is(calendar.getCount(), 2, 'Should remain 2 day overrides')
        }
    )
});
