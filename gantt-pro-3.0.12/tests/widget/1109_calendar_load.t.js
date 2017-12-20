StartTest(function (t) {

    t.describe('Should find overridden day in the calendar widget if provided in the Gnt.data.calendar.Calendar', function (t) {
        var calendar = new Gnt.data.calendar.BusinessTime({
            name : 'Calendar',
            data : [
                {
                    Id   : 'initial',
                    Date : new Date(2010, 1, 3),
                    Name : 'Some day'
                }
            ]
        });

        var calendarWidget = new Gnt.widget.calendar.Calendar({
            calendar         : calendar,
            renderTo         : Ext.getBody(),
            datePickerConfig : {
                value : new Date(2010, 1, 1)
            }
        });
        t.ok(calendarWidget.el.down('.x-datepicker .gnt-datepicker-overriddenday'), 'Found day override');
    });

    t.describe('Should find overridden day in the calendar widget if adding a new override day after rendering the widget', function (t) {
        var calendar = new Gnt.data.calendar.BusinessTime({
            name : 'Calendar'
        });

        var calendarWidget = new Gnt.widget.calendar.Calendar({
            calendar         : calendar,
            renderTo         : Ext.getBody(),
            datePickerConfig : {
                value : new Date(2010, 1, 1)
            }
        });

        t.notOk(calendarWidget.el.down('.x-datepicker .gnt-datepicker-overriddenday'), 'Should not find day override with empty calendar');

        calendar.add(
            {
                Id   : 'initial',
                Date : new Date(2010, 1, 5),
                Name : 'Some other day'
            }
        );

        t.ok(calendarWidget.el.down('.x-datepicker .gnt-datepicker-overriddenday'), 'Found day override after adding to calendar');
    });

});
