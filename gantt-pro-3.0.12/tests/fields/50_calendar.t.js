StartTest(function(t) {

    var taskStore           = t.getTaskStore();

    var calendar1           = Ext.create('Gnt.data.calendar.BusinessTime', {
        calendarId  : 'cal1',
        data        : [
            {
                Date            : new Date(2013, 1, 16),
                IsWorkingDay    : false
            }
        ]
    });
    var calendar2           = Ext.create('Gnt.data.calendar.BusinessTime', {
        calendarId  : 'cal2',
        data        : [
            {
                Date            : new Date(2013, 1, 17),
                IsWorkingDay    : false
            }
        ]
    });
    var calendar3           = Ext.create('Gnt.data.calendar.BusinessTime', {
        calendarId  : 'cal3',
        data        : [
            {
                Date            : new Date(2013, 1, 24),
                IsWorkingDay    : false
            }
        ]
    });

    var task                = new Gnt.model.Task({
        StartDate       : new Date(2013, 1, 15),
        Duration        : 3,
        CalendarId      : 'cal1'
    });

    var calendarField      = new Gnt.field.Calendar({
        task                : task,
        taskStore           : taskStore,
        renderTo            : Ext.getBody()
    });


    var checkValues = function (value, valueStr) {
        t.is(calendarField.getValue(), value, 'field.getValue():  '+value);
        t.is(calendarField.getRawValue(), valueStr, 'field rawValue contains "'+valueStr+'"');
        t.is(calendarField.task.getCalendarId(true), value, 'Task CalendarId contains '+value);
    };

    var trigger     = calendarField.el.down('.x-form-trigger');

    t.diag('Initial value read from task');
    checkValues('cal1', 'cal1');

    t.chain(
        //open combo box
        { click : trigger },

        function (next) {
            t.diag('Check selected item in list');

            var selected    = calendarField.getPicker().el.down('.x-boundlist-item.x-boundlist-selected').dom;
            selected        = selected.innerText || selected.textContent;

            t.is(selected, 'cal1', 'Picker highlighted proper item');

            next();
        },
        //let`s select cal3
        { click : '.x-boundlist-item:contains(cal3)' },

        function (next) {
            t.diag('Click "cal3"');
            checkValues('cal3', 'cal3');

            next();
        },

        function (next) {
            // clear INPUT element
            calendarField.clearValue();
            // imitate field on-blur behavior
            t.diag('Blur field');

            next();
        },

        { click : calendarField },

        { type : '[TAB]'},

        function (next) {
            t.diag('Type ""');
            checkValues('', '');

            next();
        }
    );

});
