StartTest(function (t) {
    t.it('Should support basic zoomToFit', function (t) {

        var taskStore = Ext.create("Gnt.data.TaskStore", {
            root : {
                expanded : true,
                children : [
                    {
                        "StartDate" : "2010-01-04",
                        "EndDate"   : "2010-01-18",
                        "leaf"      : true
                    },
                    {
                        "StartDate" : "2010-02-04",
                        "EndDate"   : "2010-02-18",
                        "leaf"      : true
                    },
                    {
                        "StartDate" : "2010-06-04",
                        "EndDate"   : "2010-07-18",
                        "leaf"      : true
                    }
                ]
            }
        });

        var gantt = t.getGantt2({
            width     : 700,
            renderTo  : Ext.getBody(),
            taskStore : taskStore,
            startDate : new Date(2009, 1, 1),
            endDate   : new Date(2009, 2, 1)
        });

        t.chain(
            { waitForRowsVisible : gantt },

            function () {
                gantt.zoomToFit();

                var visibleRange = gantt.getSchedulingView().getVisibleDateRange();

                // https://www.assembla.com/spaces/bryntum/tickets/1521
                t.todo(function (t) {
                    t.isLess(visibleRange.startDate, new Date(2010, 0, 4));
                    t.isGreater(visibleRange.endDate, new Date(2010, 6, 18));
                });
            }
        );
    });

    t.it('Should only take filtered tasks into account if treestore filtering is active', function (t) {

        var taskStore = Ext.create("Gnt.data.TaskStore", {
            root : {
                expanded : true,
                children : [
                    {
                        "StartDate" : "2011-02-04",
                        "Duration"  : 1,
                        "leaf"      : true,
                        "Name"      : 'Foo'
                    },
                    {
                        "StartDate" : "2013-02-04",
                        "Duration"  : 1,
                        "leaf"      : true
                    },
                    {
                        "StartDate" : "2013-02-05",
                        "Duration"  : 2,
                        "leaf"      : true
                    }
                ]
            }
        });

        var gantt = t.getGantt2({
            width     : 500,
            renderTo  : Ext.getBody(),
            taskStore : taskStore,
            startDate : new Date(2009, 1, 1),
            endDate   : new Date(2009, 2, 1)
        });

        t.chain(
            { waitForRowsVisible : gantt },
            { waitFor : 500 },

            function (next) {
                taskStore.filterTreeBy(function(t) {
                    return t.getStartDate().getFullYear() === 2013;
                });

                t.waitForEvent(gantt, 'zoomchange', next);
                gantt.zoomToFit();
            },
            function (next) {
                var visibleRange = gantt.getSchedulingView().getVisibleDateRange();

                t.isLess(visibleRange.startDate, new Date(2013, 1, 4));
                t.isGreater(visibleRange.endDate, new Date(2010, 2, 18));

                t.isLessOrEqual(visibleRange.endDate - visibleRange.startDate, 3*7*24*3600*1000, 'Should max show 3 weeks total');
            }
        );
    });
    
    t.it('Should include offsets into span', function (t) {
        var taskStore = Ext.create("Gnt.data.TaskStore", {
            root : {
                expanded : true,
                children : [
                    {
                        "StartDate" : "2010-01-04",
                        "EndDate"   : "2010-02-04",
                        "leaf"      : true
                    }
                ]
            }
        
        });
        var gantt = t.getGantt2({
            width       : 500,
            renderTo    : Ext.getBody(),
            taskStore   : taskStore,
            startDate   : new Date(2009, 1, 1),
            endDate     : new Date(2009, 2, 1)
        });
        
        t.chain(
            { waitForRowsVisible : gantt },
            
            function () {
                gantt.zoomToFit(null, { leftMargin : 200, rightMargin : 150 });
                var view = gantt.getSchedulingView();
                var taskEl = gantt.el.down('.sch-gantt-item');
                
                
                t.isGreater(taskEl.getX() - view.getX(), 200, 'Left label is fully visible');
                t.isGreater(view.el.getBox().right - taskEl.getBox().right, 150, 'Right label is fully visible');
            }
        );
    });
});   
