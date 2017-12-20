StartTest(function(t) {

    // Here we check that panel can get startDate and endDate from taskStore if they were not specified

    t.it('Panel takes start and end dates from task store', function (t) {
        var gantt = t.getGantt({
            renderTo        : Ext.getBody(),
            startDate       : null,
            endDate         : null,
            // to avoid rounding and just get exact dates
            autoAdjustTimeAxis      : false
        });

        t.is(gantt.timeAxis.getStart(), gantt.getTaskStore().getProjectStartDate(), 'proper start date set');
        t.is(gantt.timeAxis.getEnd(),   gantt.getTaskStore().getProjectEndDate(),   'proper end date set');
    });


    t.it('Panel prevents own refresh while tasks store is not loaded', function (t) {

        var gantt = t.getGantt({
            startDate   : null,
            endDate     : null,
            taskStore   : t.getTaskStore({
                DATA        : [{
                    expanded   : true,
                    
                    children : [
                        { Name : 'Task 1', StartDate : "2011-01-01", EndDate : "2011-01-01", leaf : true },
                        { Name : 'Task 2', StartDate : "2011-01-02", EndDate : "2011-01-11", leaf : true },
                        { Name : 'Task 3', StartDate : "2011-01-03", EndDate : "2011-01-11", leaf : true },
                        { Name : 'Task 4', StartDate : "2011-01-04", EndDate : "2011-01-11", leaf : true },
                        { Name : 'Task 5', StartDate : "2011-01-05", EndDate : "2011-01-11", leaf : true },
                        { Name : 'Task 6', StartDate : "2011-01-06", EndDate : "2011-01-11", leaf : true },
                        { Name : 'Task 11', StartDate : "2011-01-07", EndDate : "2011-01-11", leaf : true },
                        { Name : 'Task 12', StartDate : "2011-01-08", EndDate : "2011-01-11", leaf : true },
                        { Name : 'Task 13', StartDate : "2011-01-09", EndDate : "2011-01-11", leaf : true },
                        { Name : 'Task 14', StartDate : "2011-01-10", EndDate : "2011-01-11", leaf : true },
                        { Name : 'Task 15', StartDate : "2011-01-11", EndDate : "2011-01-12", leaf : true },
                        { Name : 'Task 16', StartDate : "2011-01-12", EndDate : "2011-01-13", leaf : true, Cls : 'Task-16' }
                    ]
                }]
            }),
            // to avoid rounding and just get exact dates
            autoAdjustTimeAxis      : false,
            renderTo    : Ext.getBody()
        });

        var view            = gantt.getSchedulingView(),
            resourceStore   = gantt.getResourceStore(),
            taskStore       = gantt.getTaskStore();

        // waiting for the very first refresh to complete to not interfere with other refreshes
        t.waitFor(function () { return view.viewReady; }, function () {
            t.is(gantt.timeAxis.getStart(), taskStore.getProjectStartDate(), 'proper start date set');
            t.is(gantt.timeAxis.getEnd(),   taskStore.getProjectEndDate(),   'proper end date set');
            
            t.selectorExists('.Task-16', 'Tasks has been rendered')
            
            t.isGreater(gantt.lockedGrid.getView().getNodes().length, 0, 'Some rows are rendered in locked grid')
        });
    });

    // https://www.assembla.com/spaces/bryntum/tickets/1873-rows-not-rendered-for-empty-event-store
    // this ticket changes behavior a bit. In fact, what we test here is if panel gets start end date from first set of tasks
    // that was added to task store when it was created empty. 
    t.xit('Panel gets start end dates from new tasks', function (t) {

        var gantt   = t.getGantt({
            startDate       : null,
            endDate         : null,
            taskStore       : t.getTaskStore({
                DATA        : []
            }),
            // to avoid rounding and just get exact dates
            autoAdjustTimeAxis      : false,
            renderTo        : Ext.getBody()
        });

        var view            = gantt.getSchedulingView(),
            taskStore       = gantt.getTaskStore();

        // waiting for the very first refresh to complete to not interfere with other refreshes
        t.waitFor(100, function () {

            // 1 refresh happens due to setTimespan
            // 1 refresh happens since view wants to refresh itself after adding new node (buffering related)
            t.knownBugIn('5.1.1', function (t) {
                t.willFireNTimes(view, 'refresh', 1, 'refresh event will be fired 1 times');

                taskStore.append(new Gnt.model.Task({ Id : 10, StartDate : new Date(2010, 1, 1), EndDate : new Date(2010, 2, 2), Cls : 'event-I' }));
            })

            t.is(gantt.timeAxis.start, new Date(2010, 1, 1), 'proper start date set');
            t.is(gantt.timeAxis.end, new Date(2010, 2, 2), 'proper end date set');

            t.selectorExists('.event-I', 'event #10 is rendered');

        });
    });


    t.it('Should stop preventing `refresh` after setTimeSpan call', function (t) {

        var gantt   = t.getGantt({
            startDate       : null,
            endDate         : null,
            taskStore       : t.getTaskStore({
                DATA        : []
            }),
            renderTo        : Ext.getBody()
        });

        var view            = gantt.getSchedulingView(),
            taskStore       = gantt.getTaskStore();

        // waiting for the very first refresh to complete to not interfere with other refreshes
        t.waitFor(100, function () {

            t.willFireNTimes(view, 'refresh', 1, 'refresh event will be fired 1 times');

            gantt.setTimeSpan(new Date(2010, 1, 1), new Date(2010, 1, 10));

        });
    });
});

