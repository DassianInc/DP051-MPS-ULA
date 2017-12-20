StartTest(function(t) {

    // Here we check how early/late columns react on data changes

    var taskStore = new Gnt.data.TaskStore({
        cascadeDelay   : 0,

        root : {
            expanded : true,
            children : [
                { leaf : true, Id : 1, StartDate : new Date(2010, 1, 3), Duration : 2, Name : 'task 1' },
                { leaf : true, Id : 4, StartDate : new Date(2010, 1, 4), Duration : 2, Name : 'task 4' },
                    { leaf : true, Id : 2, StartDate : new Date(2010, 1, 15), Duration : 3, Name : 'task 2' },
                        { leaf : true, Id : 3, StartDate : new Date(2010, 1, 15), Duration : 4, Name : 'task 3' },
                { leaf : true, Id : 5, StartDate : new Date(2010, 1, 11), Duration : 1, Name : 'task 5' }
            ]
        },
        proxy : 'memory',
        dependencyStore : new Gnt.data.DependencyStore({
            data : [
                { From : 1, To : 2, Type : 2, Lag : 2 },
                { From : 2, To : 3, Type : 2, Lag : -1 },
                { From : 4, To : 2, Type : 2, Lag : 0 }
            ]
        })
    });

    var format = "Y-m-d";

    var g = t.getGantt({
        renderTo        : Ext.getBody(),
        taskStore       : taskStore,
        dependencyStore : taskStore.getDependencyStore(),
        columns         : [
            { xtype : 'treecolumn', format : format },
            { xtype : 'earlystartdatecolumn', format : format },
            { xtype : 'earlyenddatecolumn', format : format },
            { xtype : 'latestartdatecolumn', format : format },
            { xtype : 'lateenddatecolumn', format : format },
            { xtype : 'slackcolumn', decimalPrecision : 2, useAbbreviation : false }
        ]
    });

    var task1 = taskStore.getNodeById(1);
    var task2 = taskStore.getNodeById(2);
    var task3 = taskStore.getNodeById(3);
    var task4 = taskStore.getNodeById(4);
    var task5 = taskStore.getNodeById(5);

    var earlyStartIndex, earlyEndIndex, lateStartIndex, lateEndIndex, slackIndex;

    // helper function to compare task cells contents vs actual record data
    var checkTaskCells = function (task) {
        t.diag(task.getName());

        var row = g.lockedGrid.getView().store.indexOf(task);

        t.matchGridCellContent(g.lockedGrid, row, earlyStartIndex, task.getDisplayStartDate(format, true, task.getEarlyStartDate()), 'Early Start rendered correctly');
        t.matchGridCellContent(g.lockedGrid, row, earlyEndIndex, task.getDisplayEndDate(format, true, task.getEarlyEndDate()), 'Early End rendered correctly');
        t.matchGridCellContent(g.lockedGrid, row, lateStartIndex, task.getDisplayStartDate(format, true, task.getLateStartDate()), 'Late Start rendered correctly');
        t.matchGridCellContent(g.lockedGrid, row, lateEndIndex, task.getDisplayEndDate(format, true, task.getLateEndDate()), 'Late End rendered correctly');

        var slack = task.getSlack();
        var slackStr = parseFloat(Ext.Number.toFixed(slack, 2)) + ' ' + Sch.util.Date.getReadableNameOfUnit('d', slack !== 1);
        t.matchGridCellContent(g.lockedGrid, row, slackIndex, slackStr, 'Slack rendered correctly');
    };

    t.waitForEventsToRender(g, function () {
        var items = g.lockedGrid.headerCt.items;

        // get cols indexes
        earlyStartIndex = items.indexOf(g.lockedGrid.down('earlystartdatecolumn'));
        earlyEndIndex   = items.indexOf(g.lockedGrid.down('earlyenddatecolumn'));
        lateStartIndex  = items.indexOf(g.lockedGrid.down('latestartdatecolumn'));
        lateEndIndex    = items.indexOf(g.lockedGrid.down('lateenddatecolumn'));
        slackIndex      = items.indexOf(g.lockedGrid.down('slackcolumn'));

        t.chain(
            function (next) {
                t.diag('Check initial columns content');

                checkTaskCells(task1);
                checkTaskCells(task2);
                checkTaskCells(task3);
                checkTaskCells(task4);
                checkTaskCells(task5);

                next();
            },
            function (next) {
                t.diag('Change task 2 start date');

                task2.setStartDate(new Date(2010, 1, 19));

                t.diag('Check columns values');

                // columns will start redrawing after g.refreshTimeout
                // wait for this time + 100 (to be sure) and then check
                t.waitFor(g.refreshTimeout + 100, function () {

                    checkTaskCells(task1);
                    checkTaskCells(task2);
                    checkTaskCells(task3);
                    checkTaskCells(task4);
                    checkTaskCells(task5);

                    next();
                });
            }
        );

    });
});
