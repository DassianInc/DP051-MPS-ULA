StartTest(function (t) {

    function setup (config) {
        config  = config || {};

        var ts  = t.getTaskStore(Ext.apply({
            resourceStore : t.getResourceStore(config.resourceStore)
        }, config.taskStore));

        var field = new Gnt.widget.AssignmentField(Ext.apply({
            margin          : 10,
            renderTo        : Ext.getBody(),
            allowDecimals   : false,
            gridConfig      : {
                cls : 'foo'
            }
        }, config.field));

        return {
            taskStore   : ts,
            field       : field
        };
    }

    function scenario (data, t) {

        var ts      = data.taskStore;
        var field   = data.field;
        var task    = ts.getRootNode().firstChild;

        task.assign(ts.getResourceStore().first());

        field.setTask(task);

        var grid;

        t.chain(
            { click : field },

            { waitForCQVisible : 'assignmentgrid' },

            // Wait for the assignment data to be loaded, should happen as you trigger the picker to show
            { waitFor : function() { return field.picker.store.findBy(function(as) { return as.getUnits() > 0; }) >= 0; } },

            function (next) {
                grid = field.picker;

                t.is(field.getValue(), 'Mike [100%]', 'Correct initial value');

                t.ok(grid.hasCls('foo'), 'Should be able to configure the grid via gridConfig');

                var unitColIndex = grid.headerCt.items.indexOf(grid.headerCt.down('assignmentunitscolumn'));

                t.click(t.getCell(grid, 0, unitColIndex), next);
            },

            { waitForSelectorAtCursor : 'input' },

            function (next) {
                t.waitForComponentNotVisible(t.cq1('editor'), next);
                t.click([0,0], Ext.emptyFn);
            },

            { click : field },

            { waitForCQVisible : 'assignmentgrid' },

            function (next, result) {
                grid = result[0];
                var unitColIndex = grid.headerCt.items.indexOf(grid.headerCt.down('assignmentunitscolumn'));

                t.click(t.getCell(grid, 0, unitColIndex), next);
            },

            { waitForCQVisible : 'numberfield' },

            { action : 'click' },

            function (next) {
                t.ok(grid.isVisible(), 'Grid still visible after clicking number cell');
                next();
            },

            { moveCursorTo : '>>assignmentunitscolumn' },

            { click : 'assignmentunitscolumn => .x-column-header-trigger' },

            { click : '.x-menu-item' },

            function (next) {
                t.ok(grid.isVisible(), 'Grid still visible after clicking number cell');
                next();
            },

            { click : '>>grid button[text^=Save]' },

            function (next) {
                t.notOk(grid.isVisible(), 'Grid not visible after clicking button');
                field.destroy();
            }
        );
    }

    t.it('Assignment grid interacts properly', function (t) { scenario(setup(), t); });

    t.it('Assignment grid interacts properly if we define custom field names for the Assignment model', function (t) {

        t.expectGlobals('MyAssignment');

        Ext.define('MyAssignment', {
            extend          : 'Gnt.model.Assignment',
            resourceIdField : 'ResourceId2',
            taskIdField     : 'TaskId2',
            unitsField      : 'Units2'
        });

        scenario(setup({
            taskStore : {
                assignmentStore : t.getAssignmentStore({
                    model   : 'MyAssignment',
                    data    : []
                })
            }
        }), t);

    });
});
