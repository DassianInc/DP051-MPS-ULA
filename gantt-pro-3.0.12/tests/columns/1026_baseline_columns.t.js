StartTest(function(t) {

    // Checks baseline start/end columns

    var editing         = Ext.create('Sch.plugin.TreeCellEditing', { clicksToEdit: 1 });

    var g               = t.getGantt({
        startDate       : null,
        endDate         : null,
        showBaseline    : true,
        taskStore       : t.getTaskStore({
            DATA : [
                {
                    Id                  : 1,
                    leaf                : true,
                    StartDate           : '2015-05-20',
                    Duration            : 1,
                    BaselineStartDate   : '2015-05-20',
                    BaselineEndDate     : '2015-05-22'
                },
                {
                    Id                  : 2,
                    leaf                : true,
                    StartDate           : '2015-05-20',
                    Duration            : 0,
                    BaselineStartDate   : '2015-05-20',
                    BaselineEndDate     : '2015-05-21'
                },
                {
                    Id                  : 3,
                    leaf                : true,
                    StartDate           : '2015-05-20',
                    Duration            : 1,
                    BaselineStartDate   : '2015-05-20',
                    BaselineEndDate     : '2015-05-20'
                }
            ]
        }),
        renderTo    : Ext.getBody(),
        plugins     : editing,
        columns     : [
            {
                xtype : 'baselinestartdatecolumn'
            },
            {
                xtype : 'baselineenddatecolumn'
            }
        ]
    });

    t.waitForEventsToRender(g, function () {

        var taskStore   = g.taskStore,
            task1       = taskStore.getNodeById(1),
            lockedGrid  = g.lockedGrid;

        t.matchGridCellContent(lockedGrid, 0, 0, '05/20/2015', 'task#1: Start date rendered correctly');
        t.matchGridCellContent(lockedGrid, 0, 1, '05/21/2015', 'task#1: End date rendered correctly');
        t.matchGridCellContent(lockedGrid, 1, 0, '05/20/2015', 'task#2: Start date rendered correctly');
        t.matchGridCellContent(lockedGrid, 1, 1, '05/20/2015', 'task#2: End date rendered correctly');
        t.matchGridCellContent(lockedGrid, 2, 0, '05/19/2015', 'task#3: Start date rendered correctly');
        t.matchGridCellContent(lockedGrid, 2, 1, '05/19/2015', 'task#3: End date rendered correctly');

        var view        = lockedGrid.getView();

        t.chain(
            { click : view.getCellByPosition({ row : 0, column : 0 }) },

            { waitForCQVisible : 'baselinestartdatefield' },

            { click : view.getCellByPosition({ row : 0, column : 1 }) },

            function (next) {
                t.is(task1.getBaselineStartDate(), new Date(2015, 4, 20), 'StartDate was not changed when just clicking and blurring the editor');
                t.ok(!task1.dirty, 'Task is not dirty');

                next()
            },

            { click : view.getCellByPosition({ row : 1, column : 0 }) },

            function (next) {
                t.ok(!task1.dirty, 'EndDate was not changed when just clicking and blurring the editor');
                next();
            },

            { click : view.getCellByPosition({ row : 0, column : 0 }) },

            { waitForCQVisible : 'baselinestartdatefield' },

            function (next) {
                editing.getActiveEditor().field.setValue(new Date(2015, 4, 21));
                editing.completeEdit();

                t.is(task1.getBaselineStartDate(), new Date(2015, 4, 21), 'task#1: BaselineStartDate was bumped one day');

                next();
            },

            { waitForGridContent : [g.lockedGrid, 0, 0, '05/21/2015'] },

            { click : view.getCellByPosition({ row : 0, column : 1 }) },

            { waitForCQVisible : 'baselineenddatefield' },

            function (next) {
                editing.getActiveEditor().field.setRawValue('05/20/2015');
                editing.completeEdit();

                t.is(task1.getBaselineEndDate(), new Date(2015, 4, 21), 'task#1: BaselineEndDate was changed');

                next()
            },

            { waitForGridContent : [g.lockedGrid, 0, 0, '05/20/2015'] },
            { waitForGridContent : [g.lockedGrid, 0, 1, '05/20/2015'] }
        )
    })
});
