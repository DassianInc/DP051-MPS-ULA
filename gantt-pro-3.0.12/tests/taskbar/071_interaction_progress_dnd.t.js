StartTest(function (t) {

    //======================================================================================================================================================================================================================================================
    t.diag('Setup')

    var g = t.getGantt({
        enableProgressBarResize : true,
        enableDependencyDragDrop: Ext.isIE && Ext.ieVersion > 7,
        renderTo                : Ext.getBody(),
        taskStore               : new Gnt.data.TaskStore({proxy : 'memory'})
    });

    var task = g.taskStore.getRootNode().appendChild({
        StartDate       : new Date(2010, 0, 5),
        EndDate         : new Date(2010, 0, 7),
        Duration        : 1,
        PercentDone     : 0,
        leaf            : true
    });

    t.chain(
        { waitFor       : 'rowsVisible', args : g },
        
        { moveCursorTo  : '.sch-gantt-item' },
        
        { moveCursorTo  : '.sch-gantt-progressbar-handle' },

        {
            action : 'drag',
            source : '.sch-gantt-progressbar-handle',
            by : [40, 0]
        },
        
        function () {
            t.is(task.get('PercentDone'), 100, 'PercentDone was changed to 100');
        }
    )
});
