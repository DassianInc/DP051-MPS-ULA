StartTest(function(t) {
    // in this test we'll set the format of the start date field to contain hours and minutes info
    // then we'll choose some date in the picker and verify that the end date was set to the picked date
    // and time portion of the date has been copied from the original start date of the task
    // see also: http://www.bryntum.com/forum/viewtopic.php?f=9&t=4294

    var taskStore           = t.getTaskStore({
        calendar        : new Gnt.data.calendar.BusinessTime()
    });
    
    var task                = taskStore.getRootNode().appendChild({
        StartDate       : new Date(2013, 11, 2, 10),
        Duration        : 4
    });

    var startDateField      = new Gnt.field.StartDate({
        task                : task,
        taskStore           : taskStore,
        adjustMilestones    : true,
        format              : 'Y-m-d H:i',
        renderTo            : Ext.getBody()
    });

    var checkDates = function (visibleDate, internalDate, internalStartDate) {
        var visibleDateStr          = Ext.Date.format(visibleDate, 'Y-m-d H:i');
        var internalDateStr         = Ext.Date.format(internalDate, 'Y-m-d H:i');
        var internalStartDateStr    = Ext.Date.format(internalStartDate, 'Y-m-d H:i');

        t.is(startDateField.getValue(), internalDate, 'Field contains '+internalDateStr);
        t.is(startDateField.getRawValue(), visibleDateStr, 'Field rawValue contains '+visibleDateStr);
        t.is(startDateField.task.getStartDate(), internalStartDate, 'Task StartDate contains '+internalStartDateStr);
    };

    var pickerTrigger   = startDateField.el.down('.x-form-date-trigger');
    
    var getPickerDate   = function (title) {
        return '[aria-label="' + title + '"]';
    }

    t.chain(
        { click : pickerTrigger },
        { click : getPickerDate("December 27") },
        function (next) {
            t.diag('December 27');
            checkDates(new Date(2013, 11, 27, 10), new Date(2013, 11, 27, 10), new Date(2013, 11, 27, 10));

            next();
        }
    );

});
