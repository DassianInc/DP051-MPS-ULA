StartTest(function(t) {

    var taskStore           = t.getTaskStore();

    var task                = new Gnt.model.Task({
        StartDate       : new Date(2013, 1, 15),
        EndDate         : new Date(2013, 1, 20),
        Duration        : 3
    });

    var durationField      = new Gnt.field.Duration({
        task                : task,
        taskStore           : taskStore,
        adjustMilestones    : true,
        format              : 'Y-m-d',
        renderTo            : Ext.getBody()
    });


    var checkValues = function (value, valueStr, endDate) {
        var endDateStr  = Ext.Date.format(endDate, 'Y-m-d');

        t.is(durationField.getValue(), value, 'Field contains '+value);
        t.is(durationField.getRawValue(), valueStr, 'Field rawValue contains "'+valueStr+'"');
        t.is(durationField.task.getDuration(), value, 'Task duration contains '+value);
        t.is(durationField.task.getEndDate(), endDate, 'Task EndDate contains '+endDateStr);
    };


    t.is(durationField.rawValue, '3 days', "Initial value read from task");
    t.is(durationField.rawToValue(''), null, 'Empty string converts to null');
    t.is(durationField.rawToValue('3 days'), 3, 'Value contains only numeric part of the duration');

    t.is(durationField.valueToRaw(durationField.rawToValue('11 days')), '11 days', 'Cycle conversion ->');
    t.is(durationField.rawToValue(durationField.valueToRaw(11)), 11, 'Cycle conversion <-');

    var inputBox    = durationField.getFocusEl();//el.down('.x-form-field.x-form-text');

    t.chain(
        //click spinner up 4 times
        {
            action      : 'click',
            target      : 'durationfield => .x-form-spinner-up'
        },
        {
            action      : 'click'
        },
        {
            action      : 'click'
        },
        {
            action      : 'click'
        },
        function (next) {
            t.diag('Click spinner up 4 times (consider weekend workaround)');
            checkValues(7, '7 days', new Date(2013, 1, 26));

            next();
        },
        //click spinner down 4 times
        {
            action      : 'click',
            target      : 'durationfield => .x-form-spinner-down'
        },
        {
            action      : 'click'
        },
        {
            action      : 'click'
        },
        {
            action      : 'click'
        },
        function (next) {
            t.diag('Click spinner down 4 times');
            checkValues(3, '3 days', new Date(2013, 1, 20));

            next();
        },
        // let`s test keyboard input
        // press "up" key 4 times
        {
            action      : 'type',
            text        : '[UP][UP][UP][UP]',
            target      : inputBox
        },
        function (next) {
            t.diag('Press "up" key 4 times');
            checkValues(7, '7 days', new Date(2013, 1, 26));

            next();
        },
        // press "down" key 4 times
        {
            action      : 'type',
            text        : '[DOWN][DOWN][DOWN][DOWN]',
            target      : inputBox
        },
        function (next) {
            t.diag('Press "down" key 4 times');
            checkValues(3, '3 days', new Date(2013, 1, 20));

            next();
        },

        // testing typing of invalid text in the field
        { setValue : 'smth', target : durationField } ,

        function (next) {
            durationField.beforeBlur();

            t.diag('Entered "smth" (validation check)');
            checkValues(3, 'smth', new Date(2013, 1, 20));

            t.notOk(durationField.isValid(), 'Field marked as invalid');

            next();
        },

        // testing typing of "4 days" in the field
        { setValue : '4 days', target : durationField } ,

        function (next) {
            durationField.beforeBlur();
            t.diag('Entered "4 days"');
            checkValues(4, '4 days', new Date(2013, 1, 21));
            t.ok(durationField.isValid(), 'Field marked as valid again');

            next();
        },

        // testing typing of "5 hours" in the field
        { setValue : '5 hours', target : durationField } ,

        function (next) {
            durationField.beforeBlur();
            t.diag('Entered "5 hours"');
            checkValues(5, '5 hours', new Date(2013, 1, 15, 5));
            t.ok(durationField.isValid(), 'Field marked as valid again');
            t.is(durationField.durationUnit, 'h', 'Correctly changed the duration unit')
            t.is(task.getDurationUnit(), 'h', 'Duration unit has been changed in task')

            durationField.instantUpdate     = false
            next();
        },

        // testing typing of "5 days" in the field - numeric part is the same, only the duration unit should change
        { setValue : '5 days', target : durationField } ,

        function (next) {
            durationField.beforeBlur();
            t.diag('Entered "5 days"');
            checkValues(5, '5 days', new Date(2013, 1, 22, 0));
            t.ok(durationField.isValid(), 'Field marked as valid again');
            t.is(durationField.durationUnit, 'd', 'Correctly changed the duration unit')
            t.is(task.getDurationUnit(), 'd', 'Duration unit has been changed in task')

        }
    );
});
