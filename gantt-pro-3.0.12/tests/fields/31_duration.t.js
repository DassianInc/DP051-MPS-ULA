StartTest(function(t) {

    // Here we check that Duration field respects decimalSeparator setting (#1246)

    var taskStore           = t.getTaskStore();

    var task                = new Gnt.model.Task({
        StartDate       : new Date(2013, 1, 15),
        Duration        : 3.5
    });

    var durationField      = new Gnt.field.Duration({
        task                : task,
        taskStore           : taskStore,
        adjustMilestones    : true,
        format              : 'Y-m-d',
        renderTo            : Ext.getBody(),
        decimalSeparator    : ',',
        decimalPrecision    : 1
    });


    var checkValues = function (value, valueStr, endDate) {
        var endDateStr  = Ext.Date.format(endDate, 'Y-m-d');

        t.is(durationField.getValue(), value, 'Field contains '+value);
        t.is(durationField.getRawValue(), valueStr, 'Field rawValue contains "'+valueStr+'"');
        t.is(durationField.task.getDuration(), value, 'Task duration contains '+value);
        t.is(durationField.task.getEndDate(), endDate, 'Task EndDate contains '+endDateStr);
    };


    t.is(durationField.rawValue, '3,5 days', "Initial value read from task");
    t.is(durationField.rawToValue('3,5 days'), 3.5, 'Value contains only numeric part of the duration');

    t.is(durationField.valueToRaw(durationField.rawToValue('11,5 days')), '11,5 days', 'Cycle conversion ->');
    t.is(durationField.rawToValue(durationField.valueToRaw(11.5)), 11.5, 'Cycle conversion <-');
});
