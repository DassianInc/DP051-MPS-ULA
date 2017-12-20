StartTest(function(t) {

    var startDateField,
        milestone,
        notMilestone,
        weekendWork,
        pickerTrigger;

    t.beforeEach(function () {
        startDateField && startDateField.destroy();

        new Gnt.data.Calendar({ calendarId : 'wd', defaultAvailability : [ '08:00-16:00'] });

        var taskStore       = t.getTaskStore();

        milestone       = new Gnt.model.Task({
            StartDate       : new Date(2013, 1, 26),
            Duration        : 0
        });

        notMilestone    = new Gnt.model.Task({
            StartDate       : new Date(2013, 1, 26),
            EndDate         : new Date(2013, 1, 28),
            Duration        : 2
        });

        weekendWork     = new Gnt.model.Task({
            StartDate       : new Date(2013, 1, 16),
            EndDate         : new Date(2013, 1, 20)
        });

        startDateField      = new Gnt.field.StartDate({
            task                : milestone,
            taskStore           : taskStore,
            adjustMilestones    : true,
            format              : 'Y-m-d',
            renderTo            : Ext.getBody()
        });

        pickerTrigger   = startDateField.el.down('.x-form-date-trigger');
    })

    var checkDates = function (visibleDate, internalDate, t) {
        var visibleDateStr  = Ext.Date.format(visibleDate, 'Y-m-d');
        var internalDateStr = Ext.Date.format(internalDate, 'Y-m-d');

        t.is(startDateField.getValue(), internalDate, 'Field contains '+internalDateStr);
        t.is(startDateField.getRawValue(), visibleDateStr, 'Field rawValue contains '+visibleDateStr);
        t.is(startDateField.task.getStartDate(), internalDate, 'Task instance StartDate contains '+internalDateStr);
    };

    var getDateCell      = function (title) {
        return '[aria-label="' + title + '"]';
    };

    t.it('Milestone task tests', function(t) {
        t.is(startDateField.rawValue, '2013-02-25', "Initial value read from task");

        t.is(startDateField.rawToValue(''), null, 'Empty string converts to null');
        t.is(startDateField.rawToValue('2013-02-25'), new Date(2013, 1, 26), 'Correctly adjusted to 2013-02-26');
        t.is(startDateField.rawToValue('2013-02-26'), new Date(2013, 1, 27), 'Correctly adjusted to 2013-02-27');
        t.is(startDateField.rawToValue('2013-02-28'), new Date(2013, 1, 29), 'Correctly adjusted to 2013-02-29');

        t.is(startDateField.valueToRaw(new Date(2013, 1, 26)), '2013-02-25', 'Correctly adjusted date to 2013-02-25');
        t.is(startDateField.valueToRaw(new Date(2013, 1, 23)), '2013-02-22', 'Correctly adjusted date to 2013-02-22');
    });

    t.it('Milestone task time tests', function(t) {

        milestone.setCalendarId('wd');
        milestone.setStartDate(new Date(2013, 0, 25, 16));

        t.is(startDateField.rawValue, '2013-02-25', "Initial value read from task");

        t.is(startDateField.rawToValue(''), null, 'Empty string converts to null');

        t.is(startDateField.rawToValue('2013-02-25'), new Date(2013, 1, 25, 16), 'Correctly adjusted to 2013-02-25');

        t.is(startDateField.rawToValue('2013-02-26'), new Date(2013, 1, 26, 16), 'Correctly adjusted to 2013-02-26');
        t.is(startDateField.rawToValue('2013-02-28'), new Date(2013, 1, 28, 16), 'Correctly adjusted to 2013-02-28');

        t.is(startDateField.valueToRaw(new Date(2013, 1, 26)), '2013-02-25', 'Correctly adjusted date to 2013-02-25');
        t.is(startDateField.valueToRaw(new Date(2013, 1, 23)), '2013-02-22', 'Correctly adjusted date to 2013-02-22');

    });


    t.it('Picker should work correct for milestone (for 8hrs a day calendar)', function (t) {
        milestone.setCalendarId('wd');
        milestone.setStartDate(new Date(2013, 0, 25, 16));

        t.chain(
            { click : pickerTrigger },
            function (next) {
                t.is(startDateField.picker.getValue(), new Date(2013, 1, 25), 'Picker shows correct date 2013-02-26');
                next();
            },
            { click : getDateCell('February 07'), desc : 'Picked 2013-02-07' },
            function (next) {
                checkDates(new Date(2013, 1, 7, 16), new Date(2013, 1, 7, 16), t);
                next();
            },
            { click : pickerTrigger },
            function (next) {
                t.is(startDateField.picker.getValue(), new Date(2013, 1, 7), 'Picker shows correct date 2013-02-07');
                next();
            },
            { click : getDateCell('February 26'), desc : 'Picked 2013-02-26' },
            function (next) {
                checkDates(new Date(2013, 1, 26, 16), new Date(2013, 1, 26, 16), t);

                startDateField.beforeBlur();
                t.diag('Blur field');
                checkDates(new Date(2013, 1, 26, 16), new Date(2013, 1, 26, 16), t);
                next();
            }
        );
    });


    t.it('Picker should work correct for milestone', function (t) {
        t.chain(
            { click : pickerTrigger },
            function (next) {
                t.is(startDateField.picker.getValue(), new Date(2013, 1, 25), 'Picker shows correct date 2013-02-26');
                next();
            },
            { click : getDateCell('February 07'), desc : 'Picked 2013-02-07' },
            function (next) {
                checkDates(new Date(2013, 1, 7), new Date(2013, 1, 8), t);
                next();
            },
            { click : pickerTrigger },
            function (next) {
                t.is(startDateField.picker.getValue(), new Date(2013, 1, 7), 'Picker shows correct date 2013-02-07');
                next();
            },
            { click : getDateCell('February 26'), desc : 'Picked 2013-02-26' },
            function (next) {
                checkDates(new Date(2013, 1, 26), new Date(2013, 1, 27), t);

                startDateField.beforeBlur();
                t.diag('Blur field');
                checkDates(new Date(2013, 1, 26), new Date(2013, 1, 27), t);
                next();
            }
        );
    });

    t.it('Picker should work correct for regular task', function (t) {
        t.chain(
            function(next) {
                startDateField.setTask(notMilestone);

                t.is(startDateField.rawToValue(''), null, 'Empty string converts to null');
                t.is(startDateField.rawToValue('2013-02-25'), new Date(2013, 1, 25), 'Correctly kept as 2013-02-25');
                t.is(startDateField.rawToValue('2013-02-26'), new Date(2013, 1, 26), 'Correctly kept as 2013-02-26');
                t.is(startDateField.rawToValue('2013-02-28'), new Date(2013, 1, 28), 'Correctly kept as 2013-02-28');

                t.is(startDateField.valueToRaw(new Date(2013, 1, 26)), '2013-02-26', 'Correctly kept as 2013-02-26');
                t.is(startDateField.valueToRaw(new Date(2013, 1, 23)), '2013-02-23', 'Correctly kept as 2013-02-23');

                next();
            },

            { click : pickerTrigger },

            function (next) {
                t.is(startDateField.picker.getValue(), new Date(2013, 1, 26), 'Picker shows correct date 2013-02-26');

                next();
            },
            { click : getDateCell('February 07'), desc : 'Picked 2013-02-07' },
            function (next) {
                var date    = new Date(2013, 1, 7);
                checkDates(date, date, t);

                next();
            },

            { click : pickerTrigger },

            function (next) {
                t.is(startDateField.picker.getValue(), new Date(2013, 1, 7), 'Picker shows correct date 2013-02-07');

                next();
            },
            { click : getDateCell('February 26'), desc : 'Picked 2013-02-26' },
            function (next) {
                var date    = new Date(2013, 1, 26);
                checkDates(date, date, t);

                next();
            },
            // test keyboard input
            function (next) {
                startDateField.inputEl.dom.value = '2013-02-27';
                t.diag('Blur field');
                // imitate field on blur behavior
                startDateField.beforeBlur();

                next();
            },
            function (next) {
                t.diag('Entered 2013-02-27 from keyboard');
                var date    = new Date(2013, 1, 27);
                checkDates(date, date, t);

                next();
            }
        )
    });

    t.it('Should process weekends', function (t) {
        startDateField.setTask(notMilestone);

        t.chain(
            { click : pickerTrigger },

            { click : getDateCell('March 01'), desc : 'Picked 2013-03-01 (it`s a Friday)' },
            function (next) {
                checkDates(new Date(2013, 2, 1), new Date(2013, 2, 1), t);
                next();
            },

            { click : pickerTrigger },

            { click : getDateCell('March 02'), desc : 'Picked 2013-03-02 (it`s a Saturday)' },
            function (next) {
                checkDates(new Date(2013, 2, 4), new Date(2013, 2, 4), t);
                next();
            },

            { click : pickerTrigger },

            { click : getDateCell('March 03'), desc : 'Picked 2013-03-03 (it`s a Sunday)' },
            function (next) {
                checkDates(new Date(2013, 2, 4), new Date(2013, 2, 4), t);
                next();
            },

            { click : pickerTrigger },

            { click : getDateCell('March 04'), desc : 'Picked 2013-03-04 (it`s a Monday)' },
            function (next) {
                checkDates(new Date(2013, 2, 4), new Date(2013, 2, 4), t);
                next();
            },

            function(next) {
                t.diag('Switch to task in which start date is set to Saturday (2013-02-16)');
                startDateField.setTask(weekendWork);
                checkDates(new Date(2013, 1, 16), new Date(2013, 1, 16), t);
                next();
            },

            { click : pickerTrigger },

            function (next) {

                // See https://www.assembla.com/spaces/bryntum/tickets/1776 for more information why IE family
                // is handled differently
                if (Ext.isIE) {
                    t.todo(function(t) {
                        t.is(startDateField.picker.getValue(), new Date(2013, 1, 16), 'Picker shows correct date 2013-02-16');
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
                    t.is(startDateField.picker.getValue(), new Date(2013, 1, 16), 'Picker shows correct date 2013-02-16');
                    next();
                }
            },

            { click : getDateCell('February 18'), desc : 'Picked 2013-02-18' },

            function (next) {
                checkDates(new Date(2013, 1, 18), new Date(2013, 1, 18), t);
                next();
            }
        );
    });


});
