StartTest(function (t) {

    var taskStore = t.getTaskStore({
        DATA   : [
            {
                "Id"                  : 11,
                "StartDate"           : "2010-01-04",
                "EndDate"             : "2010-01-16",
                "BaselineStartDate"   : "2010-01-16",
                "BaselineEndDate"     : "2010-01-19",
                "leaf"                : true,
                "PercentDone"         : 30,
                "BaselinePercentDone" : 10
            },
            {
                "Id"                  : 21,
                "StartDate"           : "2010-01-04",
                "EndDate"             : "2010-01-18",
                "BaselineStartDate"   : "2010-01-18",
                "BaselineEndDate"     : "2010-01-21",
                "leaf"                : false,
                "PercentDone"         : 30,
                "BaselinePercentDone" : 10
            },
            {
                "Id"                  : 31,
                "StartDate"           : "2010-01-18",
                "EndDate"             : "2010-01-18",
                "BaselineStartDate"   : "2010-01-20",
                "BaselineEndDate"     : "2010-01-20",
                "leaf"                : true
            }
        ]
    });

    var gantt = t.getGantt2({
        startDate               : new Date(2010, 0, 4),
        endDate                 : new Date(2010, 1, 15),
        renderTo                : Ext.getBody(),
        baselineVisible         : true,
        enableProgressBarResize : true,
        taskStore               : taskStore
    });

    t.waitForEventsToRender(gantt, function () {
        var ganttView = gantt.getSchedulingView();

        t.it('Testing leaf task', function (t) {
            var baselineEl   = ganttView.el.down('.sch-gantt-task-baseline .sch-gantt-task-bar');

            t.moveCursorTo(baselineEl, function () {
                t.elementIsNotVisible('.sch-gantt-task-baseline .sch-gantt-progressbar-handle', 'no progress bar resize handle');
                t.elementIsNotVisible('.sch-gantt-task-baseline .sch-resizable-handle', 'no task resize handles');
                t.elementIsNotVisible('.sch-gantt-task-baseline .sch-gantt-terminal', 'no dependency terminals');
            });
        });

        t.it('Testing parent task', function (t) {
            var baselineEl   = ganttView.el.down('.sch-gantt-parenttask-baseline .sch-gantt-parenttask-bar');

            t.moveCursorTo(baselineEl, function () {
                t.selectorNotExists('.sch-gantt-parenttask-baseline .sch-gantt-progressbar-handle', 'no progress bar resize handle');
                t.selectorNotExists('.sch-gantt-parenttask-baseline .sch-resizable-handle', 'no task resize handles');
                t.elementIsNotVisible('.sch-gantt-parenttask-baseline .sch-gantt-terminal', 'no dependency terminals');
            });
        });

        t.it('Testing milestone task', function (t) {
            var baselineEl   = ganttView.el.down('.sch-gantt-milestone-baseline .sch-gantt-item');

            t.moveCursorTo(baselineEl, function () {
                t.selectorNotExists('.sch-gantt-milestone-baseline .sch-gantt-progressbar-handle', 'no progress bar resize handle');
                t.selectorNotExists('.sch-gantt-milestone-baseline .sch-resizable-handle', 'no task resize handles');
                t.elementIsNotVisible('.sch-gantt-milestone-baseline .sch-gantt-terminal', 'no dependency terminals');
            });
        });
    })
})
