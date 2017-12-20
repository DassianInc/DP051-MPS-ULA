/*jshint -W085 */
StartTest(function(t) {
    t.describe('Constraint date field', function(t) {
        // {{{ Should behave as normal date field if unbound to a task
        t.it("Should behave as normal date field if unbound to a task", function(t) {
            var constraintField, dateField,
                date, dateAsString;

            dateField = new Ext.form.field.Date({
                id       : 'date-field',
                renderTo : Ext.getBody()
            });

            constraintField = new Gnt.field.ConstraintDate({
                id       : 'constraint-field',
                renderTo : Ext.getBody(),
                style    : 'top: 40px'
            });

            // Default values must match
            t.is(dateField.getValue(), constraintField.getValue());

            // Empty values must match
            date = '';
            dateField.setValue(date);
            constraintField.setValue(date);
            t.is(dateField.getValue(), constraintField.getValue());

            date = null;
            dateField.setValue(date);
            constraintField.setValue(date);
            t.is(dateField.getValue(), constraintField.getValue());

            // Value might be set as a date
            date = Ext.Date.clearTime(new Date());
            dateField.setValue(date);
            constraintField.setValue(date);
            t.is(dateField.getValue(), constraintField.getValue());

            dateAsString = Ext.Date.format(date, "m/d/Y");
            dateField.setValue(null);
            constraintField.setValue(null);

            t.chain(
                // Value might be typed in
                { type : dateAsString, target : dateField },
                { type : dateAsString, target : constraintField },
                { click : Ext.getBody(), offset : [0, 80] },
                function (next) {
                    t.is(dateField.getValue(), constraintField.getValue());
                    next();
                },
                // Value might be picked
                function (next) {
                    date = new Date(2014, 6, 18);
                    dateField.setValue(date);
                    constraintField.setValue(date);
                    next();
                },
                { click : "#date-field .x-form-trigger" },
                { waitFor : "componentVisible", args : [ dateField.getPicker() ] },
                { click : "#" + dateField.getPicker().getId() + " td:contains(17)" },
                { click : "#constraint-field .x-form-trigger" },
                { waitFor : "componentVisible", args : [ constraintField.getPicker() ] },
                { click : "#" + constraintField.getPicker().getId() + " td:contains(17)" },
                function (next) {
                    t.is(dateField.getValue(), constraintField.getValue());
                    next();
                },
                // Clean up
                function (next) {
                    Ext.destroy(dateField);
                    Ext.destroy(constraintField);
                }
            );
        });
        // }}}

        // {{{ Should obtain the value from a task it's bound to
        t.it("Should obtain the value from a task it's bound to", function(t) {
            var constraintField,
                date;

            date = Ext.Date.clearTime(new Date());

            with(t.getAllStoresDataSet(
                [
                    { Id : 1, leaf : true, ConstraintDate :  date}
                ]
            )) {
                constraintField = Ext.create("Gnt.field.ConstraintDate", {
                    id       : 'constraint-field',
                    renderTo : Ext.getBody(),
                    task     : id(1)
                });

                t.is(constraintField.getValue(), date);

                Ext.destroy(constraintField);
                Ext.destroy(taskStore);
            }
        });
        // }}}

        // {{{ Should update the task with the value set
        t.it("Should update the task with the value set", function(t) {
            var constraintField,
                date;

            date = new Date(2014, 6, 18);

            /* global id, taskStore */
            with(t.getAllStoresDataSet(
                [
                    { Id : 1, leaf : true, ConstraintDate : null }
                ]
            )) {
                constraintField = Ext.create("Gnt.field.ConstraintDate", {
                    id       : 'constraint-field',
                    renderTo : Ext.getBody(),
                    task     : id(1)
                });

                t.chain(
                    // Update by typing
                    { type : Ext.Date.format(date, "m/d/Y"), target : constraintField },
                    { click : Ext.getBody(), offset : [0, 80] }, // Forcing blur
                    function(next) {
                        t.is(id(1).getConstraintDate(), Ext.Date.clearTime(date));
                        next();
                    },
                    // Update value by picking
                    { click : "#constraint-field .x-form-trigger" },
                    { waitFor : "componentVisible", args : [ constraintField.getPicker() ] },
                    { click : "#" + constraintField.getPicker().getId() + " td:contains(17)" },
                    function (next) {
                        t.is(id(1).getConstraintDate(), Ext.Date.clearTime(new Date(2014, 6, 17)));
                        next();
                    },
                    // Clean up
                    function (next) {
                        Ext.destroy(constraintField);
                        Ext.destroy(taskStore);
                    }
                );
            }
        });
        // }}}

        // {{{ Should adjust display date one day backward for FNET/FNLT/MFO constraints if they point to the start of the day and field format has no hour information
        t.it([
            "Should adjust display date one day backward for FNET/FNLT/MFO constraints if they point ",
            "to the start of the day and field format has no hour information"
        ].join(''), function(t) {
            var fnetDateFieldWithoutTime,
                fnetDateFieldWithTime,
                fnltDateFieldWithoutTime,
                fnltDateFieldWithTime,
                mfoDateFieldWithoutTime,
                mfoDateFieldWithTime,
                date, adjustedDate;

            date         = new Date(2014, 10, 21);
            adjustedDate = new Date(2014, 10, 20);

            /* global id */
            with(t.getAllStoresDataSet(
                [
                    { Id : 1, leaf : true, ConstraintType: 'finishnoearlierthan', ConstraintDate : date },
                    { Id : 2, leaf : true, ConstraintType: 'finishnolaterthan',   ConstraintDate : date },
                    { Id : 3, leaf : true, ConstraintType: 'mustfinishon',        ConstraintDate : date }
                ]
            )) {

                fnetDateFieldWithoutTime = Ext.create("Gnt.field.ConstraintDate", {
                    id       : 'fnet-wo-time',
                    renderTo : Ext.getBody(),
                    task     : id(1),
                    format   : 'm/d/Y'
                });

                fnetDateFieldWithTime = Ext.create("Gnt.field.ConstraintDate", {
                    id       : 'fnet-with-time',
                    renderTo : Ext.getBody(),
                    task     : id(1),
                    format   : 'm/d/Y H:i'
                });

                t.is(fnetDateFieldWithoutTime.valueToVisible(date, id(1)), adjustedDate, "FNET date field with no time format has properly adjusted value");
                t.is(fnetDateFieldWithTime.valueToVisible(date, id(1)),    date,         "FNET date field with time format has the original/non-adjusted value");

                fnltDateFieldWithoutTime = Ext.create("Gnt.field.ConstraintDate", {
                    id       : 'fnlt-wo-time',
                    renderTo : Ext.getBody(),
                    task     : id(2),
                    format   : 'm/d/Y'
                });

                fnltDateFieldWithTime = Ext.create("Gnt.field.ConstraintDate", {
                    id       : 'fnlt-with-time',
                    renderTo : Ext.getBody(),
                    task     : id(2),
                    format   : 'm/d/Y H:i'
                });

                t.is(fnltDateFieldWithoutTime.valueToVisible(date, id(1)), adjustedDate, "FNLT date field with no time format has properly adjusted value");
                t.is(fnltDateFieldWithTime.valueToVisible(date, id(1)),    date,         "FNLT date field with time format has the original/non-adjusted value");

                mfoDateFieldWithoutTime = Ext.create("Gnt.field.ConstraintDate", {
                    id       : 'mfo-wo-time',
                    renderTo : Ext.getBody(),
                    task     : id(3),
                    format   : 'm/d/Y'
                });

                mfoDateFieldWithTime = Ext.create("Gnt.field.ConstraintDate", {
                    id       : 'mfo-with-time',
                    renderTo : Ext.getBody(),
                    task     : id(3),
                    format   : 'm/d/Y H:i'
                });

                t.is(mfoDateFieldWithoutTime.valueToVisible(date, id(1)), adjustedDate, "MFO date field with no time format has properly adjusted value");
                t.is(mfoDateFieldWithTime.valueToVisible(date, id(1)),    date,         "MFO date field with time format has the original/non-adjusted value");

                t.chain(
                    { click   : '#fnet-wo-time => .x-form-date-trigger' },
                    function(next) {
                        t.is(
                            fnetDateFieldWithoutTime.getPicker().getValue().getDate(),
                            adjustedDate.getDate(),
                            'FNET date field with no time format picker shows properly adjusted date'
                        );
                        next();
                    },
                    { moveCursorBy : [[50, 0]] },
                    { click   : '' },

                    { click   : '#fnet-with-time => .x-form-date-trigger' },
                    function(next) {
                        t.is(
                            fnetDateFieldWithTime.getPicker().getValue().getDate(),
                            date.getDate(),
                            'FNET date field with time format picker shows original date'
                        );
                        next();
                    },
                    { moveCursorBy : [[50, 0]] },
                    { click   : '' },

                    { click   : '#fnlt-wo-time => .x-form-date-trigger' },
                    function(next) {
                        t.is(
                            fnltDateFieldWithoutTime.getPicker().getValue().getDate(),
                            adjustedDate.getDate(),
                            'FNLT date field with no time format picker shows properly adjusted date'
                        );
                        next();
                    },
                    { moveCursorBy : [[50, 0]] },
                    { click   : '' },

                    { click   : '#fnlt-with-time => .x-form-date-trigger' },
                    function(next) {
                        t.is(
                            fnltDateFieldWithTime.getPicker().getValue().getDate(),
                            date.getDate(),
                            'FNLT date field with time format picker shows original date'
                        );
                        next();
                    },
                    { moveCursorBy : [[50, 0]] },
                    { click   : '' },

                    { click   : '#mfo-wo-time => .x-form-date-trigger' },
                    function(next) {
                        t.is(
                            mfoDateFieldWithoutTime.getPicker().getValue().getDate(),
                            adjustedDate.getDate(),
                            'MFO date field with no time format picker shows properly adjusted date'
                        );
                        next();
                    },
                    { moveCursorBy : [[50, 0]] },
                    { click   : '' },

                    { click   : '#mfo-with-time => .x-form-date-trigger' },
                    function(next) {
                        t.is(
                            mfoDateFieldWithTime.getPicker().getValue().getDate(),
                            date.getDate(),
                            'MFO date field with time format picker shows original date'
                        );
                        next();
                    },
                    { moveCursorBy : [[50, 0]] },
                    { click   : '' },

                    function(next) {
                        Ext.destroy(
                            fnetDateFieldWithoutTime,
                            fnetDateFieldWithTime,
                            fnltDateFieldWithoutTime,
                            fnltDateFieldWithTime,
                            mfoDateFieldWithoutTime,
                            mfoDateFieldWithTime
                        );
                    }
                );
            }
        });
        // }}}

        // {{{ Should adjust display value by one day forward for FNET/FNLT/MFO constraints if display value points to the start of the day and field format has no hour information as well as should keep time information if date is selected via picker.
        t.it([
            "Should adjust display value by one day forward for FNET/FNLT/MFO constraints if display value points ",
            "to the start of the day and field format has no hour information as well as should keep time information ",
            "if date is selected via picker"
        ].join(''), function(t) {

            function testConstraint(t, ctype, done) {

                var fieldWithoutTime,
                    fieldWithTime,
                    originalDate,
                    inputDate, inputAdjustedDate,
                    selectDate, selectAdjustedDate;

                originalDate       = new Date(2014, 10, 20, 8, 30);
                inputDate          = new Date(2014, 10, 18, 9, 45);
                inputAdjustedDate  = new Date(2014, 10, 19, 9, 45);
                selectDate         = new Date(2014, 10, 17, 9, 45);
                selectAdjustedDate = new Date(2014, 10, 18, 9, 45);

                /* global id */
                with(t.getAllStoresDataSet(
                    [
                        { Id : 1, leaf : true, ConstraintType: ctype, ConstraintDate : originalDate },
                        { Id : 2, leaf : true, ConstraintType: ctype, ConstraintDate : originalDate }
                    ]
                )) {

                    fieldWithoutTime = Ext.create("Gnt.field.ConstraintDate", {
                        id       : 'field-wo-time',
                        renderTo : Ext.getBody(),
                        task     : id(1),
                        keepTime : false,
                        format   : 'm/d/Y'
                    });

                    fieldWithTime = Ext.create("Gnt.field.ConstraintDate", {
                        id       : 'field-with-time',
                        renderTo : Ext.getBody(),
                        task     : id(2),
                        format   : 'm/d/Y H:i'
                    });

                    t.chain(
                        function (next) {
                            t.selectText('#field-wo-time input');
                            next();
                        },

                        { type : Ext.Date.format(inputDate, 'm/d/Y') + '[ENTER]', target : '#field-wo-time input' },
                        { click : Ext.getBody(), offset : [200, 0] },

                        function (next) {
                            t.isDateEqual(
                                id(1).getConstraintDate(),
                                Ext.Date.clearTime(inputAdjustedDate, true),
                                "Date has been properly adjusted"
                            );
                            next();
                        },

                        { click : '#field-wo-time => .x-form-date-trigger' },
                        { click : ["#", fieldWithoutTime.getPicker().getId(), ' td:contains(', selectDate.getDate(), ')'].join('') },

                        function (next) {
                            t.isDateEqual(
                                id(1).getConstraintDate(),
                                Ext.Date.clearTime(selectAdjustedDate, true),
                                "Date has been properly adjusted when selected via picker"
                            );
                            next();
                        },

                        function (next) {
                            t.selectText('#field-with-time input');
                            next();
                        },

                        { type : Ext.Date.format(inputDate, 'm/d/Y H:i') + '[ENTER]', target : '#field-with-time input' },
                        { click : Ext.getBody(), offset : [200, 0] },

                        function (next) {
                            t.isDateEqual(
                                id(2).getConstraintDate(),
                                inputDate,
                                "Date has been kept intact"
                            );
                            next();
                        },

                        { click   : '#field-with-time => .x-form-date-trigger' },
                        { click : ["#", fieldWithTime.getPicker().getId(), ' td:contains(', selectDate.getDate(), ')'].join('') },

                        function (next) {
                            t.isDateEqual(
                                id(2).getConstraintDate(),
                                selectDate,
                                "Time has been properly preserved."
                            );
                            next();
                        },

                        function (next) {
                            Ext.destroy(fieldWithoutTime, fieldWithTime);
                            done();
                        }
                    );
                }
            }

            t.chain(
                function (next) {
                    t.diag("FNET");
                    testConstraint(t, 'finishnoearlierthan', next);
                },
                function (next) {
                    t.diag("FNLT");
                    testConstraint(t, 'finishnolaterthan', next);
                },
                function (next) {
                    t.diag("MFO");
                    testConstraint(t, 'mustfinishon', next);
                }
            );
        });
        // }}}
    });
});
