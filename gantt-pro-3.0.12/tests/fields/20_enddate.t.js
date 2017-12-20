StartTest(function(t) {

    var taskStore           = t.getTaskStore();

    var milestone           = new Gnt.model.Task({
        StartDate       : new Date(2013, 1, 26),
        EndDate         : new Date(2013, 1, 26),
        Duration        : 0
    });

    var notMilestone        = new Gnt.model.Task({
        StartDate       : new Date(2013, 1, 26),
        EndDate         : new Date(2013, 1, 28)
    });

    var weekendWork         = new Gnt.model.Task({
        StartDate       : new Date(2013, 1, 12),
        EndDate         : new Date(2013, 1, 17)
    });


    var endDateField      = new Gnt.field.EndDate({
        task                : milestone,
        taskStore           : taskStore,
        adjustMilestones    : true,
        format              : 'Y-m-d',
        renderTo            : Ext.getBody()
    });

    t.diag('Milestone task tests');

    t.is(endDateField.rawValue, '2013-02-25', "Initial value read from task");

    t.is(endDateField.rawToValue(''), null, 'Empty string converts to null');
    t.is(endDateField.rawToValue('2013-02-25'), new Date(2013, 1, 26), 'Correctly adjusted to 2013-02-26');
    t.is(endDateField.rawToValue('2013-02-26'), new Date(2013, 1, 27), 'Correctly adjusted to 2013-02-27');
    t.is(endDateField.rawToValue('2013-02-28'), new Date(2013, 1, 29), 'Correctly adjusted to 2013-02-29');

    t.is(endDateField.valueToRaw(new Date(2013, 1, 26)), '2013-02-25', 'Correctly adjusted date to 2013-02-25');
    t.is(endDateField.valueToRaw(new Date(2013, 1, 23)), '2013-02-22', 'Correctly adjusted date to 2013-02-22');
    t.is(endDateField.valueToRaw(new Date(2013, 1, 23, 1)), '2013-02-23', 'Correctly adjusted date to 2013-02-23');

    var checkDates = function (visibleDate, internalDate, internalStartDate) {
        var visibleDateStr          = Ext.Date.format(visibleDate, 'Y-m-d');
        var internalDateStr         = Ext.Date.format(internalDate, 'Y-m-d');
        var internalStartDateStr    = Ext.Date.format(internalStartDate, 'Y-m-d');

        t.is(endDateField.getValue(), internalDate, 'Field contains '+internalDateStr);
        t.is(endDateField.getRawValue(), visibleDateStr, 'Field rawValue contains '+visibleDateStr);
        t.is(endDateField.task.getEndDate(), internalDate, 'Task EndDate contains '+internalDateStr);
        t.is(endDateField.task.getStartDate(), internalStartDate, 'Task StartDate contains '+internalStartDateStr);
    };

    var pickerTrigger   = endDateField.el.down('.x-form-date-trigger');

    var getPickerDate   = function (title) {
        return function () {
            return endDateField.picker.el.down('[aria-label="' + title + '"]');
        }
    }

    t.it('Should not be possible to set end date < start date', function(t) {
        var task        = new Gnt.model.Task({
            StartDate       : new Date(2013, 1, 26),
            EndDate         : new Date(2013, 1, 28)
        });

        var field      = new Gnt.field.EndDate({
            task                : task,
            taskStore           : taskStore,
            format              : 'Y-m-d'
        });

        var errors = field.getErrors("2013-01-01");

        t.is(errors && errors.length, 1, 'Got error text when end < start date');
    })

    t.chain(
        { click : pickerTrigger },
        function (next) {
            t.is(endDateField.picker.getValue(), new Date(2013, 1, 25), 'Picker shows correct date 2013-02-26');

            next();
        },
        {
            click      : getPickerDate("February 27")
        },
        function (next) {
            t.diag('Picked 2013-02-27');
            checkDates(new Date(2013, 1, 27), new Date(2013, 1, 28), new Date(2013, 1, 26));

            next();
        },

        { click : pickerTrigger },
        function (next) {
            t.is(endDateField.picker.getValue(), new Date(2013, 1, 27), 'Picker shows correct date 2013-02-27');

            next();
        },
        {
            click      : getPickerDate("February 26")
        },
        function (next) {
            t.diag('Picked 2013-02-26');
            checkDates(new Date(2013, 1, 26), new Date(2013, 1, 27), new Date(2013, 1, 26));

            next();
        },
        function (next) {
            t.diag('Blur field');
            // imitate field on-blur behavior
            endDateField.beforeBlur();

            checkDates(new Date(2013, 1, 26), new Date(2013, 1, 27), new Date(2013, 1, 26));

            next();
        },
        function(next) {
            t.diag('Switch to non-milestone task');

            endDateField.setTask(notMilestone);

            t.is(endDateField.rawValue, '2013-02-27', "Initial value read from task");

            t.is(endDateField.rawToValue(''), null, 'Empty string converts to null');
            t.is(endDateField.rawToValue('2013-02-25'), new Date(2013, 1, 26), 'Correctly adjusted to 2013-02-26');
            t.is(endDateField.rawToValue('2013-02-26'), new Date(2013, 1, 27), 'Correctly adjusted to 2013-02-27');
            t.is(endDateField.rawToValue('2013-02-28'), new Date(2013, 2, 1), 'Correctly adjusted to 2013-03-01');

            t.is(endDateField.valueToRaw(new Date(2013, 1, 26)), '2013-02-25', 'Correctly adjusted to 2013-02-25');
            t.is(endDateField.valueToRaw(new Date(2013, 1, 23)), '2013-02-22', 'Correctly adjusted to 2013-02-22');

            next();
        },

        { click : pickerTrigger },
        function (next) {
            t.is(endDateField.picker.getValue(), new Date(2013, 1, 27), 'Picker shows correct date 2013-02-27');

            next();
        },
        {
            click      : getPickerDate("February 07")
        },
        function (next) {
            t.diag('Picked 2013-02-07 (enter end date before start date)');
            checkDates(new Date(2013, 1, 7), new Date(2013, 1, 28), new Date(2013, 1, 26));
            t.notOk(endDateField.isValid(), 'End date became invalid.');

            next();
        },

        { click : pickerTrigger },
        function (next) {
            // See https://www.assembla.com/spaces/bryntum/tickets/1776 for more information why IE family
            // is handled differently
            if (Ext.isIE) {
                t.todo(function(t) {
                    t.is(endDateField.picker.getValue(), new Date(2013, 1, 7), 'Picker shows invalid date 2013-02-07');

                    // See https://www.assembla.com/spaces/bryntum/tickets/1781 for explanation why
                    if (!t.isElementVisible('.x-datepicker')) {
                        t.click(pickerTrigger, next);
                    }
                    else {
                        next();
                    }
                });
            }
            else {
                t.is(endDateField.picker.getValue(), new Date(2013, 1, 7), 'Picker shows invalid date 2013-02-07');
                next();
            }
        },
        {
            click      : getPickerDate("February 28")
        },
        function (next) {
            t.diag('Picked 2013-02-28');
            checkDates(new Date(2013, 1, 28), new Date(2013, 2, 1), new Date(2013, 1, 26));
            t.ok(endDateField.isValid(), 'End date restored to valid.');

            next();
        },
        // test keyboard input
        function (next) {
            endDateField.inputEl.dom.value = '2013-02-27';
            // imitate field on-blur behavior
            t.diag('Blur field');
            endDateField.beforeBlur();

            next();
        },
        function (next) {
            t.diag('Entered 2013-02-27 from keyboard');
            checkDates(new Date(2013, 1, 27), new Date(2013, 1, 28), new Date(2013, 1, 26));

            next();
        },
        function (next) {
            t.diag('Let`s check weekends processing');
            next();
        },

        { click : pickerTrigger },
        {
            click      : getPickerDate("March 01")
        },
        function (next) {
            t.diag('Picked 2013-03-01 (it`s Friday)');
            checkDates(new Date(2013, 2, 1), new Date(2013, 2, 2), new Date(2013, 1, 26));

            next();
        },
        { click : pickerTrigger },
        {
            click      : getPickerDate("March 02")
        },
        function (next) {
            t.diag('Picked 2013-03-02 (it`s Saturday)');
            checkDates(new Date(2013, 2, 1), new Date(2013, 2, 2), new Date(2013, 1, 26));

            next();
        },

        { click : pickerTrigger },
        {
            click      : getPickerDate("March 03")
        },
        function (next) {
            t.diag('Picked 2013-03-03 (it`s Sunday)');
            checkDates(new Date(2013, 2, 1), new Date(2013, 2, 2), new Date(2013, 1, 26));

            next();
        },

        { click : pickerTrigger },
        {
            click      : getPickerDate("March 04")
        },
        function (next) {
            t.diag('Picked 2013-03-04 (it`s Monday)');
            checkDates(new Date(2013, 2, 4), new Date(2013, 2, 5), new Date(2013, 1, 26));

            next();
        },
        function(next) {
            t.diag('Switch to task in which end date is set to Sunday (2013-02-17)');

            endDateField.setTask(weekendWork);
            checkDates(new Date(2013, 1, 16), new Date(2013, 1, 17), new Date(2013, 1, 12));

            next();
        },
        function (next) {
            t.diag('Blur field');
            // imitate field on-blur behavior
            endDateField.beforeBlur();

            checkDates(new Date(2013, 1, 16), new Date(2013, 1, 17), new Date(2013, 1, 12));

            next();
        },

        { click : pickerTrigger },
        function (next) {
            // See https://www.assembla.com/spaces/bryntum/tickets/1776 for more information why IE family
            // is handled differently
            if (Ext.isIE) {
                t.todo(function(t) {
                    t.is(endDateField.picker.getValue(), new Date(2013, 1, 16), 'Picker shows correct date 2013-02-16');

                    // See https://www.assembla.com/spaces/bryntum/tickets/1781 for explanation why
                    if (!t.isElementVisible('.x-datepicker')) {
                        t.click(pickerTrigger, next);
                    }
                    else {
                        next();
                    }
                });
            }
            else {
                t.is(endDateField.picker.getValue(), new Date(2013, 1, 16), 'Picker shows correct date 2013-02-16');
                next();
            }
        },
        {
            click      : getPickerDate("February 18")
        },
        function (next) {
            t.diag('Picked 2013-02-18');
            checkDates(new Date(2013, 1, 18), new Date(2013, 1, 19), new Date(2013, 1, 12));

            next();
        }

    );

});
