StartTest(function(t) {
    // in this test we generally repeat the 11_start_date_null.t.js, but on the empty task that has Duration 0
    // (such task will be a milestone)

    var task           = new Gnt.model.Task({
        Duration    : 0
    });

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

    // we'll click on today's cell
    var clickDate       = Ext.Date.clearTime(Ext.Date.add(new Date()));
    var resultDate      = clickDate;

    // if clickDate is a weekend field date will have to be set to Friday-Saturday midnight
    if (clickDate.getDay() === 0) {
        resultDate = Ext.Date.add(clickDate, Ext.Date.DAY, -2);
    } else if (clickDate.getDay() == 6) {
        resultDate = Ext.Date.add(clickDate, Ext.Date.DAY, -1);
    }

    t.chain(
        { click : '.x-form-date-trigger' },
        { click : '.x-btn:contains(Today)' },

        function (next) {
            t.diag('Picked some date');
            t.is(startDateField.getRawValue(), Ext.Date.format(resultDate, 'Y-m-d'), 'Field contains proper date');

            next();
        },

        { click : '.x-form-date-trigger' },

        function (next) {
            t.is(startDateField.picker.getValue(), resultDate, 'Correct date selected in picker when re-opening it');
            startDateField.destroy();
        }

    );

});
