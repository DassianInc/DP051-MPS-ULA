StartTest(function (t) {

    var editing = Ext.create('Sch.plugin.TreeCellEditing', { clicksToEdit : 1 });

    t.beforeEach(function() {
        editing.completeEdit();
    })

    var g = t.getGantt({
        renderTo : Ext.getBody(),
        columns  : [
            { xtype : 'namecolumn' },
            { xtype : 'startdatecolumn' },
            { xtype : 'enddatecolumn', format : 'Y-m-d' }
        ],
        root : {
            children : [
                {
                    Id        : 1,
                    leaf      : true,
                    StartDate : '2015-01-05',
                    Duration  : 1
                },
                {
                    leaf      : true,
                    StartDate : '2015-01-05',
                    Duration  : 1
                },
                {
                    leaf      : true,
                    StartDate : '2015-01-05',
                    Duration  : 1
                },
                {
                    leaf      : true,
                    StartDate : '2015-01-05',
                    Duration  : 1
                }
            ]
        },

        plugins  : editing
    });

    var taskStore  = g.taskStore,
        lockedGrid = g.lockedGrid;

    t.it('StartDate should not change when just clicking and blurring the editor', function (t) {

        t.wontFire(taskStore, 'update');

        t.chain(
            { waitForRowsVisible : g },

            function(next) {
                t.matchGridCellContent(lockedGrid, 0, 2, '2015-01-05', 'End date rendered correctly');

                next();
            },
            { click : '.x-grid-cell:nth-child(2)' },

            { waitForSelectorAtCursor : 'input' },

            { click : '.x-grid-cell:nth-child(3)' }
        )
    })

    t.it('EndDate should not change when just clicking and blurring the editor', function (t) {

        t.wontFire(taskStore, 'update');

        t.chain(
            { click : '.x-grid-cell:nth-child(3)' },
            { click : '.x-grid-cell:nth-child(2)' }
        );
    });

    t.it('EndDate editing, rendering', function (t) {
        t.chain(
            { click : '.x-grid-cell:nth-child(3)' },
            { waitForSelectorAtCursor : 'input' },

            function (next) {
                var field    = editing.getActiveEditor().field;
                var task     = taskStore.getNodeById(1);

                field.setRawValue('2015-01-06');

                editing.completeEdit();

                t.is(field.getValue(), new Date(2015, 0, 7), 'EndDate was bumped one day');
                t.is(task.getEndDate(), new Date(2015, 0, 7), 'EndDate was bumped one day');
                t.matchGridCellContent(g.lockedGrid, 0, 2, '2015-01-06', 'Grid cell updated correctly');
                next()
            },

            { waitForSelector : '.x-grid-cell:contains(2015-01-06)', desc : 'Grid cell updated correctly' }
        );
    });

    t.it('EndDate editing, rendering #2', function (t) {
        t.chain(
            function(next) {
                var task     = taskStore.getNodeById(1);

                // Setting start/end to null, should not cause any issues while editing
                task.setStartDate(null);
                task.setDuration(null);
                task.setEndDate(null);
                next();
            },
            { click : '.x-grid-cell:nth-child(3)' },
            { waitForSelectorAtCursor : 'input' },

            function (next) {
                editing.getActiveEditor().field.setValue(new Date(2010, 1, 2));
                editing.completeEdit();
                t.is(taskStore.getNodeById(1).getEndDate(), new Date(2010, 1, 2), 'EndDate was set ok from null');
            }
        );
    });

    t.it('Click all date cells, which should not change any data', function (t) {
        taskStore.commitChanges();
        t.wontFire(taskStore, 'update');
        t.wontFire(g.lockedGrid.view, 'itemupdate');
        t.wontFire(g.normalGrid.view, 'itemupdate');
        t.wontFire(g.lockedGrid.view, 'refresh');
        t.wontFire(g.normalGrid.view, 'refresh');
        t.wontFire(g.getDependencyView(), 'refresh');

        t.chain(
            { click : '.x-grid-item:nth-child(1) .x-grid-cell:nth-child(3)' },
            { click : '.x-grid-item:nth-child(2) .x-grid-cell:nth-child(3)' },
            { click : '.x-grid-item:nth-child(3) .x-grid-cell:nth-child(3)' },
            { click : '.x-grid-item:nth-child(4) .x-grid-cell:nth-child(3)' }
        )
    });
});

