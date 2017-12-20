StartTest(function (t) {

    // #2338 - Calendar Manager widget incorrectly saves week override

    t.it('Week override days do not overwrite the existing ones in the calendar having the same ids', function (t) {

        var calendar   = new Gnt.data.calendar.BusinessTime({
            calendarId : 'calendar',
            name       : 'Calendar'
        });

        var days1 = calendar.add(
            {
                Name              : 'foo',
                Type              : 'WEEKDAYOVERRIDE',
                Weekday           : -1,
                OverrideStartDate : new Date(2015, 10, 2),
                OverrideEndDate   : new Date(2015, 10, 6)
            },
            {
                Name              : 'foo',
                Type              : 'WEEKDAYOVERRIDE',
                Weekday           : 1,
                OverrideStartDate : new Date(2015, 10, 2),
                OverrideEndDate   : new Date(2015, 10, 6)
            }
        );

        var calendarWidget = new Gnt.widget.calendar.Calendar({
            calendar : calendar,
            height   : 550,
            width    : 600,
            renderTo : Ext.getBody()
        });

        calendarWidget.down('tabpanel').setActiveTab(1);


        calendarWidget.datePicker.setValue(new Date(2015, 10, 9));

        // add one more week override
        calendarWidget.addWeek();

        var override2 = calendarWidget.weekOverridesStore.getAt(0);

        // for one of the days let's set "Id" equal to one of existing ones in the calendar
        override2.set('weekAvailability', [
            new Gnt.model.CalendarDay({
                Id                : days1[1].getId(),
                Name              : override2.get('mainDay').getName(),
                Type              : 'WEEKDAYOVERRIDE',
                Weekday           : 2,
                OverrideStartDate : override2.get('mainDay').getOverrideStartDate(),
                OverrideEndDate   : override2.get('mainDay').getOverrideEndDate()
            })
        ]);

        calendarWidget.applyChanges();

        t.is(calendar.count(), 4, 'proper number of records found');

    })
});
