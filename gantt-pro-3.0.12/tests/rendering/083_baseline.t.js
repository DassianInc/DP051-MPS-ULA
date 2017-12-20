StartTest(function (t) {

    var taskStore = t.getTaskStore({
        DATA   : [
            {
                "Id"                  : 11,
                "StartDate"           : "2010-01-04",
                "EndDate"             : "2010-01-16",
                "BaselineStartDate"   : "2010-01-04",
                "BaselineEndDate"     : "2010-01-16",
                "leaf"                : true,
                "PercentDone"         : 30,
                "BaselinePercentDone" : 10
            },
            {
                "Id"                  : 21,
                "StartDate"           : "2010-01-04",
                "EndDate"             : "2010-01-18",
                "BaselineStartDate"   : "2010-01-04",
                "BaselineEndDate"     : "2010-01-18",
                "leaf"                : false,
                "PercentDone"         : 30,
                "BaselinePercentDone" : 10
            },
            {
                "Id"                  : 31,
                "StartDate"           : "2010-01-18",
                "EndDate"             : "2010-01-18",
                "BaselineStartDate"   : "2010-01-18",
                "BaselineEndDate"     : "2010-01-18",
                "leaf"                : true
            }
        ]
    });

    var gantt = t.getGantt2({
        startDate       : new Date(2010, 0, 4),
        endDate         : new Date(2010, 1, 15),
        renderTo        : Ext.getBody(),
        baselineVisible : true,
        taskStore       : taskStore
    });

    t.waitForEventsToRender(gantt, function () {
        var ganttView = gantt.getSchedulingView();

        t.it('Testing leaf task', function (t) {
            var normalRegion = ganttView.el.down('.sch-gantt-task .sch-gantt-task-bar').getRegion(),
                baselineEl   = ganttView.el.down('.sch-gantt-task-baseline .sch-gantt-task-bar'),
                baselineRegion = baselineEl.getRegion(),
                percentDone    = taskStore.getNodeById(11).getBaselinePercentDone();

            t.selectorCountIs('.sch-gantt-task-baseline', 1, 'Leaf task baseline elements rendered');

            t.is(normalRegion.left, baselineRegion.left, 'Leaf: Correct left value');
            t.is(normalRegion.right, baselineRegion.right, 'Leaf: Correct right value');

            t.isApprox(baselineEl.el.down('.sch-gantt-progress-bar').getWidth(),
                       baselineEl.getWidth() * percentDone/100, 3, 'Percent done ok');

            t.isLE(normalRegion.bottom, baselineRegion.top, 'Leaf: baseline is positioned below normal task');

            t.is(normalRegion.bottom - normalRegion.top, baselineRegion.bottom - baselineRegion.top, 'Equal height of normal and baseline elements');
        });

        t.it('Testing parent task', function (t) {
            var normalRegion            = ganttView.el.down('.sch-gantt-task .sch-gantt-task-bar').getRegion(),
                baselineRegion          = ganttView.el.down('.sch-gantt-task-baseline .sch-gantt-task-bar').getRegion(),
                parentRegion            = ganttView.el.down('.sch-gantt-parent-task .sch-gantt-item').getRegion(),
                baselineParentRegion    = ganttView.el.down('.sch-gantt-parenttask-baseline .sch-gantt-item').getRegion(),
                offset                  = ganttView.getXOffset(taskStore.getNodeById(21));

            t.is(parentRegion.left + offset, baselineParentRegion.left, 'Parent: Correct left value');
            t.is(parentRegion.right - offset, baselineParentRegion.right, 'Parent: Correct right value');
            t.isLE(parentRegion.bottom, baselineParentRegion.top, 'Parent: baseline is positioned below normal task');

            var percentDone             = taskStore.getNodeById(21).getBaselinePercentDone();
            var secondBaselineEl        = ganttView.el.down('.sch-gantt-parenttask-baseline .sch-gantt-item');

            t.isApprox(secondBaselineEl.el.down('.sch-gantt-progress-bar').getWidth(), secondBaselineEl.getWidth() * percentDone/100, 3, 'Percent done ok');

            t.is(normalRegion.bottom - normalRegion.top, baselineRegion.bottom - baselineRegion.top, 'Parent: Equal height of normal and baseline elements');

            taskStore.getNodeById(21).remove();
        });

        t.it('Testing milestone task', function (t) {
            var normalRegion   = ganttView.el.down('.sch-gantt-milestone .sch-gantt-item').getRegion(),
                baselineRegion = ganttView.el.down('.sch-gantt-milestone-baseline .sch-gantt-item').getRegion();

            t.selectorCountIs('.sch-gantt-milestone-baseline', 1, 'Milestone task baseline elements rendered');

            t.is(normalRegion.left, baselineRegion.left, 'Milestone: Correct left value');
            t.is(normalRegion.right, baselineRegion.right, 'Milestone: Correct right value');

            t.isLE(normalRegion.top, baselineRegion.top, 'Milestone: baseline is positioned below normal task');

            t.is(normalRegion.bottom - normalRegion.top, baselineRegion.bottom - baselineRegion.top, 'Equal height of normal and baseline elements');

            taskStore.getNodeById(31).remove();
        });

        t.it('Testing partial visibility', function (t) {

            // Render task partially, starting outside
            taskStore.getNodeById(11).setStartDate(new Date(2009, 11, 28));
            taskStore.getNodeById(11).setBaselineStartDate(new Date(2009, 11, 28));
            taskStore.getNodeById(11).setBaselineEndDate(taskStore.getNodeById(11).getEndDate());
            t.is(ganttView.el.select('.sch-event-startsoutside').getCount(), 2, 'sch-event-startsoutside CSS class found');

            t.selectorExists('.sch-gantt-task-baseline', 'Leaf task baseline elements rendered, when starting before');

            t.is(ganttView.el.down('.sch-gantt-task-baseline').getWidth(),
                ganttView.el.down('.sch-gantt-task').getWidth(),
                'Correct width when ending after');

            // Render task partially, ending outside
            taskStore.getNodeById(11).setStartDate(new Date(2010, 1, 8));
            taskStore.getNodeById(11).setBaselineStartDate(new Date(2010, 1, 8));
            taskStore.getNodeById(11).setBaselineEndDate(taskStore.getNodeById(11).getEndDate());
            t.is(ganttView.el.select('.sch-gantt-task-baseline').getCount(), 1, 'Leaf task baseline elements rendered, when ending after');
            t.is(ganttView.el.select('.sch-event-endsoutside').getCount(), 2, 'sch-event-endsoutside CSS class found');
            t.is(ganttView.el.down('.sch-gantt-task-baseline').getWidth(), ganttView.el.down('.sch-gantt-task').getWidth(), 'Correct width when ending after');

            // Render task after view end
            taskStore.getNodeById(11).setStartDate(new Date(2012, 1, 8));
            taskStore.getNodeById(11).setBaselineStartDate(new Date(2012, 1, 8));
            taskStore.getNodeById(11).setBaselineEndDate(taskStore.getNodeById(11).getEndDate());
            t.selectorNotExists('.sch-gantt-item', 'No task elements, when after timeaxis');

            // Render task before view start
            taskStore.getNodeById(11).setStartDate(new Date(2008, 1, 8));
            taskStore.getNodeById(11).setBaselineStartDate(new Date(2008, 1, 8));
            taskStore.getNodeById(11).setBaselineEndDate(taskStore.getNodeById(11).getEndDate());
            t.selectorNotExists('.sch-gantt-item', 'No task elements, when before timeaxis');


            // Now no baseline elements should be seen
            gantt.setTimeSpan(new Date(2002, 0, 1));
            t.selectorNotExists('.sch-event-wrap', 'No elements found when baseline dates do not intersect viewed dates')
        })
    })
})
