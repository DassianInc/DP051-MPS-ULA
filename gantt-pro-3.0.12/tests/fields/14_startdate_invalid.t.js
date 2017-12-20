StartTest(function(t) {

    // Mark start date field as invalid when we enter wrong input data. #1204

    var task           = new Gnt.model.Task({ StartDate : new Date(2013, 1, 12), Duration : 1 });

    var taskStore      = t.getTaskStore({
        DATA : [task]
    });

    var startDateField      = new Gnt.field.StartDate({
        task                : task,
        taskStore           : taskStore,
        adjustMilestones    : true,
        format              : 'Y-m-d',
        renderTo            : Ext.getBody()
    });

    var pickerTrigger   = startDateField.el.down('.x-form-date-trigger');

    t.chain(
        function (next) {
            startDateField.inputEl.dom.value = 'qwe';

            next();
        },

        { action : 'click', target : pickerTrigger },

        function (next) {
            t.hasCls(startDateField.inputEl.dom, 'x-form-invalid-field', 'field marked as invalid');
        }
    );

});
