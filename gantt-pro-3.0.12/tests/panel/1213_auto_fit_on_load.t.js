StartTest(function (t) {
    var gantt;

    var startDate = new Date(2011, 1, 1),
        endDate = new Date(2011, 3, 1),
        taskStoreConfig = {
            DATA    : [
                {
                    StartDate   : startDate,
                    Duration    : 2,
                    leaf        : true
                }, {
                    StartDate   : endDate,
                    Duration    : 2,
                    leaf        : true
                }
            ]
        };

    t.it('Should auto fit to loaded store', function (t) {
        gantt = t.getGantt({
            renderTo    : Ext.getBody(),
            startDate   : new Date(2010, 1, 1),
            endDate     : new Date(2010, 1, 1, 1),
            taskStore   : t.getTaskStore(taskStoreConfig),
            autoFitOnLoad : true
        });

        t.chain(
            { waitFor : function () {
                var visibleRange = gantt.getSchedulingView().getVisibleDateRange();

                return Sch.util.Date.timeSpanContains(visibleRange.startDate, visibleRange.endDate, startDate, endDate);
            } },
            function () {
                t.pass('Zoomed to fit')
            }
        )
    });

    t.it('Should auto fit to loading store', function (t) {
        gantt = t.getGantt({
            renderTo    : Ext.getBody(),
            taskStore   : t.getTaskStore(taskStoreConfig, true),
            startDate   : new Date(2010, 1, 1),
            endDate     : new Date(2010, 1, 1, 1),
            autoFitOnLoad : true
        });

        t.chain(
            { waitForSelector : '.sch-column-header' },
            function (next) {
                gantt.taskStore.load();
                next();
            },
            { waitFor : function () {
                var visibleRange = gantt.getSchedulingView().getVisibleDateRange();

                return Sch.util.Date.timeSpanContains(visibleRange.startDate, visibleRange.endDate, startDate, endDate);
            } },
            function () {
                t.pass('Zoomed to fit')
            }
        )
    });
});