StartTest(function(t) {
    var g = t.getGantt({
        startDate : new Date (2010, 1, 1),
        endDate   : new Date (2010, 2, 1),
        forceFit    : true,
        renderTo    : Ext.getBody(),
        taskStore   : new Gnt.data.TaskStore({
            root : {
                children : [{
                    Id        : 1,
                    StartDate : new Date (2010, 1, 1),
                    Duration  : 3
                }]
            }
        })
    });

    // Clicking a parent task bar should toggle it by default
    var task = g.taskStore.getNodeById(1);

    t.waitForEventsToRender(g, function () {
        t.chain(
            { action : 'click', target : '.sch-gantt-parenttask-bar' },

            function(next) {
                t.ok(task.isExpanded());
                next()
            },

            { action : 'click', target : '.sch-gantt-parenttask-bar' },

            function(next) {
                t.notOk(task.isExpanded());
            }
        );
    });
});    
