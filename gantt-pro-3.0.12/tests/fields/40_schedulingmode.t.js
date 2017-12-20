StartTest(function(t) {

    var taskStore           = t.getTaskStore();

    var task                = new Gnt.model.Task({
        StartDate       : new Date(2013, 1, 15),
        EndDate         : new Date(2013, 1, 20),
        Duration        : 3
    });

    var schedulingModeField      = new Gnt.field.SchedulingMode({
        task                : task,
        taskStore           : taskStore,
        adjustMilestones    : true,
        format              : 'Y-m-d',
        renderTo            : Ext.getBody()
    });


    var checkValues = function (value, valueStr) {
        t.is(schedulingModeField.getValue(), value, 'Field contains '+value);
        t.is(schedulingModeField.getRawValue(), valueStr, 'Field rawValue contains "'+valueStr+'"');
        t.is(schedulingModeField.task.getSchedulingMode(), value, 'Task SchedulingMode contains '+value);
    };


    var trigger     = schedulingModeField.el.down('.x-form-trigger');
    var inputBox    = schedulingModeField.el.down('.x-form-field.x-form-text');


    t.diag('Initial value read from task');
    checkValues('Normal', 'Normal');


    t.chain(
        //open combo box
        {
            action      : 'click',
            target      : trigger
        },
        function (next) {
            t.diag('Check selected item in list');

            var selected    = schedulingModeField.getPicker().el.down('.x-boundlist-item.x-boundlist-selected').dom;
            selected        = selected.innerText || selected.textContent;

            t.is(selected, 'Normal', 'Picker highlighted proper item');

            next();
        },
        {
            action      : 'click',
            target      : '.x-boundlist-item:contains(Fixed duration)'
        },
        function (next) {
            t.diag('Click "Fixed duration"');
            checkValues('FixedDuration', 'Fixed duration');

            next();
        },
        //let`s select Effort driven
        {
            action      : 'click',
            target      : trigger
        },
        {
            waitFor     : 'selector',
            args        : ['.x-boundlist']
        },
        {
            action      : 'click',
            target      : '.x-boundlist-item:contains(Effort driven)'
        },
        function (next) {
            t.diag('Click "Effort driven"');
            checkValues('EffortDriven', 'Effort driven');

            next();
        },
        //let`s select Dynamic assignment
        {
            action      : 'click',
            target      : trigger
        },
        {
            waitFor     : 'selector',
            args        : ['.x-boundlist']
        },
        {
            action      : 'click',
            target      : '.x-boundlist-item:contains(Dynamic assignment)'
        },
        function (next) {
            t.diag('Click "Dynamic assignment"');
            checkValues('DynamicAssignment', 'Dynamic assignment');

            next();
        }
    );

});
