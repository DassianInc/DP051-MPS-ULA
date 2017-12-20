StartTest(function (t) {

    t.expectGlobals('TaskModelWithBaseline');

    Ext.define("TaskModelWithBaseline", {
        extend                   : "Gnt.model.Task",
        baselineStartDateField   : 'BaselineStartDate',
        baselineEndDateField     : 'BaselineEndDate',
        baselinePercentDoneField : 'BaselinePercentDone'
    });

    var g = t.getGantt({
        taskStore               : t.getTaskStore({
            model : "TaskModelWithBaseline"
        }),
        enableProgressBarResize : true,
        renderTo                : Ext.getBody(),
        showBaseline            : true,
        eventRenderer           : function () {
            return {
                style            : 'display:none',
                progressBarStyle : 'display:none',

                cls     : 'test-cls',
                ctcls   : 'test-ctcls',
                basecls : 'test-basecls'
            };
        }
    });

    var taskStore = g.taskStore;

    var task = taskStore.getRootNode().appendChild(new taskStore.model({
        StartDate         : new Date(2010, 0, 4),
        BaselineStartDate : new Date(2010, 0, 5),
        Duration          : 2,
        BaselineEndDate   : new Date(2010, 0, 7),
        leaf              : true
    }));

    t.waitForRowsVisible(g, function () {

        var taskEl = g.getSchedulingView().getElementFromEventRecord(task);

        t.ok(taskEl.hasCls('test-cls'), '"cls" class found on task bar element');
        t.notOk(taskEl.isVisible(), 'found correct style on task el');
        t.notOk(taskEl.down('.sch-gantt-progress-bar').isVisible(), 'found correct style on progress bar el');

        var wrap = taskEl.up(g.getSchedulingView().eventWrapSelector);
        t.ok(wrap.hasCls('test-ctcls'), '"ctcls" class found on task container element');

        t.ok(wrap.parent().down('.sch-gantt-task-baseline').hasCls('test-basecls'), '"basecls" class found on task baseline element');

        // Testing a milestone
        task.setStartEndDate(new Date(2010, 0, 6), new Date(2010, 0, 6));

        taskEl = g.getSchedulingView().getElementFromEventRecord(task);
        var diamond = taskEl.down(Ext.isIE8 ? '.sch-gantt-milestone-diamond-top' : '.sch-gantt-milestone-diamond');

        t.ok(diamond.hasCls('test-cls'), '"cls" class found on milestone element');
        t.hasStyle(diamond, 'display', 'none', 'Custom style applied on milestone element');
    });
});
