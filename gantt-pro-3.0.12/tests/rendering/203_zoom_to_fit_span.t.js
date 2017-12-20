StartTest(function (t) {

    t.it('Should show entire task store timespan after zoomToFit', function (t) {

        // #842: check span after zoom to fit executing to include whole task store content

        var start = new Date(2013, 0, 1),
            end = Sch.util.Date.add(start, Sch.util.Date.MONTH, 7);

        var calendar = Ext.create("Gnt.data.calendar.BusinessTime");

        var taskStore = Ext.create("Gnt.data.TaskStore", {
            calendar : calendar,
            proxy    : {
                type   : 'memory',
                reader : {
                    type : 'json'
                },
                data   : [
                    {
                        StartDate : new Date(2013, 0, 4, 8, 0, 0),
                        EndDate   : new Date(2013, 0, 18, 17, 0, 0),
                        Id        : 1,
                        leaf      : true,
                        Name      : "Task 1",
                        ParentId  : null
                    },
                    {
                        StartDate : new Date(2013, 1, 4, 8, 0, 0),
                        EndDate   : new Date(2013, 1, 18, 17, 0, 0),
                        Id        : 2,
                        leaf      : true,
                        Name      : "Task 2",
                        ParentId  : null
                    },
                    {
                        StartDate : new Date(2013, 2, 18, 8, 0, 0),
                        Id        : 3,
                        leaf      : true,
                        Name      : "Task 3",
                        ParentId  : null
                    },
                    {
                        StartDate : new Date(2013, 5, 4, 8, 0, 0),
                        EndDate   : new Date(2013, 6, 1, 17, 0, 0),
                        Id        : 4,
                        leaf      : true,
                        Name      : "Task 4",
                        ParentId  : null
                    }
                ]
            },
            root     : {
                expanded : true
            }
        });
        taskStore.load();

        var gantt = t.getGantt({
            renderTo  : Ext.getBody(),
            taskStore : taskStore,
            startDate : start,
            endDate   : end
        });

        gantt.zoomToFit();

        var span = gantt.taskStore.getTotalTimeSpan();

        t.isLessOrEqual(gantt.getStart(), span.start, "Time axis starts before project start date");
        t.isLessOrEqual(span.end, gantt.getEnd(), "Time axis ends after project end date");
    });

    t.it('Should show entire task store timespan after zoomToFit', function (t) {
        var taskStore = new Gnt.data.TaskStore({
            root : {
                expanded : true,
                children : [
                    {
                        Id        : 1,
                        StartDate : new Date(2001, 1, 1),
                        EndDate   : new Date(2010, 1, 1),
                        Name      : 'Foo',
                        leaf      : true
                    },
                    {
                        Id        : 2,
                        StartDate : new Date(2010, 1, 1),
                        EndDate   : new Date(2010, 1, 1),
                        Name      : 'Bar',
                        leaf      : true
                    }
                ]
            }
        });

        var gantt = t.getGantt2({
            renderTo  : Ext.getBody(),
            width     : 500,
            taskStore : taskStore
        });

        gantt.zoomToFit();

        var span = gantt.taskStore.getTotalTimeSpan();

        t.is(gantt.viewPreset, 'manyYears', 'Should use manyyear preset');
        t.isGreaterOrEqual(gantt.getSchedulingView().getVisibleDateRange().endDate, new Date(2010, 1, 1), 'End date of task in view');
        t.isGreater(gantt.timeAxisViewModel.getTickWidth(), 5, 'Should have reasonably wide ticks')


        taskStore.getNodeById(1).setStartDate(new Date(1995, 1, 1));

        gantt.zoomToFit();
        t.is(gantt.viewPreset, 'manyYears', 'Should use manyyear preset');
        t.isGreater(gantt.timeAxisViewModel.getTickWidth(), 5, 'Should have reasonably wide ticks')
        t.isLessOrEqual(gantt.getSchedulingView().getVisibleDateRange().startDate, new Date(1995, 1, 1), 'End date of task in view');
        t.isGreaterOrEqual(gantt.getSchedulingView().getVisibleDateRange().endDate, new Date(2010, 1, 1), 'End date of task in view');

        taskStore.getNodeById(1).setStartDate(new Date(1990, 1, 1));
        gantt.zoomToFit();

        t.is(gantt.viewPreset, 'manyYears', 'Should use manyyear preset');
        t.isLessOrEqual(gantt.getSchedulingView().getVisibleDateRange().startDate, new Date(1990, 1, 1), 'End date of task in view');
        t.isGreaterOrEqual(gantt.getSchedulingView().getVisibleDateRange().endDate, new Date(2010, 1, 1), 'End date of task in view');
        t.isGreater(gantt.timeAxisViewModel.getTickWidth(), 5, 'Should have reasonably wide ticks')
    });
});
