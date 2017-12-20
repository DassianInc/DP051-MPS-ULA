StartTest(function (t) {
    var g;

    t.beforeEach(function() {
        g && g.destroy();

        var resourceStore = t.getResourceStore({
                data : [
                    { Id : 1, Name : 'Mike'},
                    { Id : 2, Name : 'Kate'}
                ]
            }),
            assignmentStore = t.getAssignmentStore({
                data          : [
                    { ResourceId : 1, TaskId : 1, Units : 50 },
                    { ResourceId : 1, TaskId : 2 },
                    { ResourceId : 2, TaskId : 1, Units : 0 },
                    { ResourceId : 2, TaskId : 3 }
                ]
            });

        var plug = new Sch.plugin.TreeCellEditing();

        g = t.getGantt({
            margin          : 40,
            renderTo        : Ext.getBody(),
            height          : 200,
            plugins         : plug,
            taskStore       : new Gnt.data.TaskStore({
                resourceStore   : resourceStore,
                assignmentStore : assignmentStore,
                root : {
                    children : [
                        { Id : 1 },
                        { Id : 2 },
                        { Id : 3, leaf : true }
                    ]
                }
            }),
            columns         : [
                {
                    xtype : 'treecolumn'
                },
                {
                    tdCls : 'assignmentcell',
                    xtype : 'resourceassignmentcolumn'
                }
            ]
        });
    });

    t.it('Basic rendering', function(t) {

        t.chain(
            { waitFor : 'rowsVisible', args : g},

            function (next) {
                var locked = g.lockedGrid;

                t.matchGridCellContent(locked, 0, 1, 'Mike [50%]', 'Mike is assigned to 50% #1');
                t.matchGridCellContent(locked, 1, 1, 'Mike', 'Mike is assigned to #2');

                t.matchGridCellContent(locked, 2, 1, 'Kate', 'Kate is assigned to #3');
                t.notOk(t.getCell(locked, 0, 1).dom.innerHTML.match('Kate'), 'Should not render a 0% assignment');

                g.destroy();
            }
        )
    });

    t.it('Editing assignments in the gridshould not cause refreshes', function(t) {
        g.assignmentStore.removeAll();

        t.wontFire(g.lockedGrid.view, 'refresh', 'locked refresh');
        t.wontFire(g.normalGrid.view, 'refresh', 'normal refresh');

        t.firesOnce(g.lockedGrid.view, 'itemupdate', 'itemupdate locked');
        t.firesOnce(g.normalGrid.view, 'itemupdate', 'itemupdate normal');

        t.chain(
            { doubleclick           : '.assignmentcell' },

            { waitForCQVisible : 'assignmentgrid' },

            { click                 : '.x-column-header-checkbox' },

            function(next) {
                var field = t.cq1('assignmentfield');
                var grid = field.getPicker();

                var assignmentCell = t.getCell(g.lockedGrid, 0, 1).down('.x-grid-cell-inner');

                t.is(Ext.String.trim(assignmentCell.dom.innerHTML.replace('&nbsp;', '')), '', 'Assignment cell empty')

                grid.getSelectionModel().deselectAll();

                grid.getSelectionModel().select(grid.store.first());

                t.waitFor(function() {
                    return grid.store.first().getUnits() === 100;
                }, function() {

                    field.onSaveClick();

                    next();
                })
            },

            { waitFor : 500 },

            function() {
                t.matchGridCellContent(g.lockedGrid, 0, 1, '100')
            }
        )
    })

    // https://www.assembla.com/spaces/bryntum/tickets/2209-
    t.it('Clicking first checkbox should work', function(t) {
        g.assignmentStore.removeAll();

        t.chain(
            { doubleclick : '.assignmentcell' },

            { waitForCQVisible : 'assignmentgrid' },

            { click : 'assignmentgrid => .x-grid-cell' },

            { waitForTarget : 'assignmentgrid => .x-grid-item-selected .x-grid-row-checker' }
        )
    });

    t.it('Updating single assignment record', function(t) {
        t.waitForRowsVisible(g, function() {
            t.wontFire(g.lockedGrid.view, 'refresh', 'locked refresh');
            t.wontFire(g.normalGrid.view, 'refresh', 'normal refresh');

            t.firesOnce(g.lockedGrid.view, 'itemupdate', 'itemupdate locked');
            t.firesOnce(g.normalGrid.view, 'itemupdate', 'itemupdate normal');

            g.assignmentStore.first().setUnits(99)

            t.hasCls(t.getCell(g.lockedGrid, 0, 1), g.lockedGrid.view.dirtyCls, 'Assignment cell got dirty');

            t.matchGridCellContent(g.lockedGrid, 0, 1, '99%')
        });
    });

    t.it('Updating single resource record', function(t) {
        g.assignmentStore.loadData(
            [
                { ResourceId : 1, TaskId : 1, Units : 50 },
                { ResourceId : 1, TaskId : 2, Units : 50 }
            ]
        )

        t.waitForRowsVisible(g, function() {

            t.wontFire(g.lockedGrid.view, 'refresh', 'locked refresh');
            t.wontFire(g.normalGrid.view, 'refresh', 'normal refresh');

            // Resource is assigned to 2 tasks, 2 row refreshes expected
            t.willFireNTimes(g.lockedGrid.view, 'itemupdate', 2, 'itemupdate locked');
            t.willFireNTimes(g.normalGrid.view, 'itemupdate', 2, 'itemupdate normal');

            g.resourceStore.first().setName('BOO');

            t.matchGridCellContent(g.lockedGrid, 0, 1, 'BOO [50%]')
        })

    });

    t.it('Removing a single resource record', function(t) {
        g.assignmentStore.loadData(
            [
                { Id : 1, ResourceId : 1, TaskId : 1, Units : 50 },
                { Id : 2, ResourceId : 1, TaskId : 2, Units : 50 },
                { Id : 3, ResourceId : 2, TaskId : 1, Units : 50 }
            ]
        )

        t.chain(
            { waitFor : 'rowsVisible' },

            function() {

                // One update triggered by removing the resource, another by clearing the assignments for that resource
                t.willFireNTimes(g.lockedGrid.view, 'refresh', 2, 'locked refresh');
                t.willFireNTimes(g.normalGrid.view, 'refresh', 2, 'normal refresh');

                t.wontFire(g.lockedGrid.view, 'itemupdate', 'itemupdate locked');
                t.wontFire(g.normalGrid.view, 'itemupdate', 'itemupdate normal');

                t.matchGridCellContent(g.lockedGrid, 0, 1, 'Mike [50%]');

                g.resourceStore.remove(g.resourceStore.first());

                t.is(g.assignmentStore.getCount(), 1, 'Assignment store updated');
                t.is(g.assignmentStore.first().getResourceId(), 2, 'Correct assignment left in the store');

                var assignmentCell = t.getCell(g.lockedGrid, 0, 1);
                t.contentLike(assignmentCell, 'Kate [50%]', 'Assignment cell updated');
                t.hasCls(assignmentCell, g.lockedGrid.view.dirtyCls, 'Assignment cell is dirty');
            }
        );

    });

    t.it('Adding single assignment record', function(t) {

        g.assignmentStore.loadData([{ Id : 1, ResourceId : 1, TaskId : 1, Units : 50 }]);

        t.waitForRowsVisible(g, function() {
            var added   = g.assignmentStore.add({ ResourceId : 2, TaskId : 1, Units : 50 });

            var cell    = t.getCell(g.lockedGrid, 0, 1);
            t.hasCls(cell, g.lockedGrid.view.dirtyCls, 'Assignment cell got dirty');
            t.contentLike(cell, 'Mike [50%], Kate [50%]', 'Assignment cell updated');

            added[0].commit();

            t.hasNotCls(t.getCell(g.lockedGrid, 0, 1), g.lockedGrid.view.dirtyCls, 'Assignment cleared dirty state');
        });
    });

});
