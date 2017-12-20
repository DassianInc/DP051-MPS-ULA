StartTest(function(t) {
    t.diag("Current timzone: " + t.getTimeZone())

    var dstDates        = t.getDSTDates()

    if (!dstDates.length) {
        t.diag("Not found any DST dates in current timezone in 2012, test exits")

        return
    }

    var DATE            = Sch.util.Date
    var taskStore       = t.getTaskStore({
        dependencyStore     : t.getDependencyStore(),
        cascadeChanges      : true,
        cascadeDelay        : 0,

        weekendsAreWorkdays : true
    })

    Ext.Array.each(dstDates, function (dstDate) {
        // "feature testing"
        var beforeDST   = DATE.add(dstDate, DATE.DAY, -1)

        var newTask     = taskStore.getRootNode().appendChild({
            StartDate       : beforeDST,
            Duration        : 0
        })

        newTask.setEndDate(DATE.add(dstDate, DATE.DAY, 1), false)

        t.is(newTask.getDuration(), 2, 'The task crossing DST change date: ' + dstDate + ' still has correct duration in full days')

        // actual root cause of the issue - misbehaving of `calculateDuration`
        var crossDSTDuration    = newTask.calculateDuration(DATE.add(dstDate, DATE.DAY, -1), DATE.add(dstDate, DATE.DAY, 1), DATE.DAY)

        t.is(crossDSTDuration, 2, 'The task crossing DST change date: ' + dstDate + ' still has correct duration in full days')

    })
})
