StartTest(function (t) {
    t.it('Should apply timespan from store', function (t) {
        var gantt = t.getGantt({
            startDate   : null,
            endDate     : null,
            renderTo    : Ext.getBody(),
            // do not load
            taskStore   : t.getTaskStore({}, true)
        });

        t.chain(
            { waitForCQ : 'ganttpanel' },
            function () {
                gantt.taskStore.load();
                t.waitFor(function () {
                    return gantt.lockedGrid.view.getNodes().length > 0;
                }, function () {
                    t.pass('Locked view rendered');
                });
            }
        )
    });
});