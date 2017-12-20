StartTest(function(t) {

    // #864. here we check if start date field works properly on empty task record

    var task           = new Gnt.model.Task();

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

    var pickerCell      = function (value) {
        return 'td[aria-label="'+Ext.Date.format(value, startDateField.picker.ariaTitleDateFormat)+'"]';
    };

    var now             = Ext.Date.clearTime(new Date());
    var anotherDate     = Ext.Date.add(now, Ext.Date.DAY, now.getDate() > 1 ? -1 : 1);
    var resultDate      = anotherDate;

    if (anotherDate.getDay() == 0) {
        resultDate = Ext.Date.add(anotherDate, Ext.Date.DAY, 1);
    } else if (anotherDate.getDay() == 6) {
        resultDate = Ext.Date.add(anotherDate, Ext.Date.DAY, 2);
    }

    t.chain(
        { action : 'click', target : pickerTrigger },

        {
            action      : 'click',
            target      : function () { return pickerCell(anotherDate); }
        },
        function (next) {
            t.diag('Picked some date');
            t.is(startDateField.getRawValue(), Ext.Date.format(resultDate, 'Y-m-d'), 'Field contains proper date');

            next();
        },
        { action : 'click', target : pickerTrigger },
        function (next) {
            t.is(startDateField.picker.getValue(), resultDate, 'Correct date selected in picker when re-opening it')
        }
        
    );

});
