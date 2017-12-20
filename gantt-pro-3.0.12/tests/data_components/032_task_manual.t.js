StartTest(function(t) {

    // #1686 Ensures that we turn (for BW compatibility purposes) task SchedulingMode="Manual" into ManuallyScheduled=true plus SchedulingMode="Normal"
    // TODO: need to drop this test + remove corresponding logic from Task model normalize() method after few releases (2.5.7/3.0.5)

    var getDataSet = function (config) {
        config          = config || {};

        var taskStore   = t.getTaskStore({
            DATA        : config.tasks || [{
                Id              : 1,
                leaf            : true,
                StartDate       : new Date(2011, 6, 1),
                Duration        : 1,
                SchedulingMode  : 'Manual'
            }]
        });

        return taskStore;
    };

    t.it('Maps SchedulingMode=Manual to ManuallyScheduled field', function (t) {
        var task    = getDataSet().getNodeById(1);

        t.ok(task.isManuallyScheduled, 'task is scheduled manually');
        t.is(task.getSchedulingMode(), 'Normal', 'task has Normal scheduling mode');
    });

});
