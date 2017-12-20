StartTest(function(t) {

    // Assert readonly field

    var taskStore = t.getTaskStore({
        DATA : [{
            StartDate : new Date(2013, 1, 15),
            Duration  : 3
        }]
    });

    var task  = taskStore.getRoot().firstChild;

    var field = new Gnt.field.ReadOnly({
        task      : task,
        taskStore : taskStore,
        renderTo  : Ext.getBody()
    });

    t.notOk(field.getValue(), 'field has proper initial value');

    t.chain(
        { click : field, desc : 'Field checked' },

        function (next) {
            t.ok(task.getReadOnly(), 'task got readonly');

            next();
        },

        { click : field, desc : 'Field unchecked' },

        function (next) {
            t.notOk(task.getReadOnly(), 'task got not readonly back');

            next();
        }
    );

});
