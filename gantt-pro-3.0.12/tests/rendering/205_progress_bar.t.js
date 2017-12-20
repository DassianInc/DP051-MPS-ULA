StartTest(function (t) {
    t.it('Progress bar width should be absolute and not be relative to visible part of the task', function (t) {

        var taskStore = Ext.create("Gnt.data.TaskStore", {
            root : {
                expanded : true,
                children : [
                    {
                        "StartDate" : "2010-01-04",
                        "EndDate"   : "2010-01-18",
                        "PercentDone" : 50,
                        "leaf"      : true
                    }
                ]
            }
        });

        var gantt = t.getGantt2({
            width     : 700,
            renderTo  : Ext.getBody(),
            taskStore : taskStore,
            startDate : new Date(2010, 0, 4),
            endDate   : new Date(2010, 0, 25)
        });
        
        var view = gantt.getSchedulingView();

        t.chain(
            { waitForRowsVisible : gantt },
            function (next) {
                var taskWidth = gantt.el.down('.sch-gantt-item').getWidth();
                var barWidth  = gantt.el.down('.sch-gantt-progress-bar').getWidth();
                
                t.isApprox(barWidth, taskWidth / 2, 2, 'Progress bar width is correct');
                gantt.setTimeSpan(new Date(2010, 0, 11), new Date(2010, 0, 25));
              
                barWidth  = gantt.el.down('.sch-gantt-progress-bar').getWidth();
                
                t.is(barWidth, 0, 'Progress bar width is correct');
                gantt.setTimeSpan(new Date(2010, 0, 4), new Date(2010, 0, 11));

                taskWidth = gantt.el.down('.sch-gantt-item').getWidth();
                barWidth  = gantt.el.down('.sch-gantt-progress-bar').getWidth();
                
                t.isApprox(barWidth, taskWidth, 2, 'Progress bar width is correct');
            }
        );
    });
});   
