StartTest(function(t) {

    // test for ticket #814, field should match values using altFomats config

    var taskStore           = t.getTaskStore();

    var startDateField      = new Gnt.field.StartDate({
        task                : taskStore.getNodeById(117),
        taskStore           : taskStore,
        adjustMilestones    : true,
        fieldLabel          : 'Start Date',
        renderTo            : Ext.getBody()
    });

    var endDateField      = new Gnt.field.EndDate({
        task                : taskStore.getNodeById(117),
        taskStore           : taskStore,
        adjustMilestones    : true,
        fieldLabel          : 'End Date',
        renderTo            : Ext.getBody()
    });

    t.is(startDateField.getRawValue(), '02/03/2010', 'Initial start date value is correct');
    t.is(endDateField.getRawValue(), '02/10/2010', 'Initial end date value is correct');

    t.chain(
        function (next) {
            startDateField.inputEl.dom.value = '';
            next();
        },

        { type : '2/3/2010', target : startDateField, desc : "Type 2/3/2010 to start date" },

        function (next) {
            startDateField.blur();
            next();
        },
            // firefox is a bit async here, add more stable condition
        { waitFor : function () { return startDateField.getRawValue() === '02/03/2010'; }, desc : 'Start date value is correct' },

        function (next) {
            endDateField.inputEl.dom.value = '';
            next();
        },

        { type : '2/10/2010', target : endDateField, desc : "Type 2/10/2010 to end date" },

        function (next) {
            endDateField.blur();
            next();
        },

        // firefox is a bit async here, add more stable condition
        { waitFor : function () { return endDateField.getRawValue() === '02/10/2010'; }, desc : 'End date value is correct' }
    );
});
