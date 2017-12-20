StartTest(function(t) {

    var gantt;
    var task;
    var editing;

    function setup (config) {
        gantt && gantt.destroy();

        config  = config || {};
        editing = Ext.create('Sch.plugin.TreeCellEditing');

        gantt = t.getGantt({
            renderTo    : Ext.getBody(),
            taskStore   : new Gnt.data.TaskStore({
                root : {
                    children : [
                        {
                            Id              : 1,
                            leaf            : true,
                            Note            : '<p>Test</p>',
                            StartDate       : new Date(2015, 4, 15, 11),
                            Duration        : 2
                        }
                    ]
                }
            }),
            plugins : editing,
            columns : [
                Ext.apply({
                    xtype : 'notecolumn'
                }, config.column)
            ]
        });

        task    = gantt.getTaskStore().getNodeById(1);
    }

    t.it('Column works properly w/o previewFn provided', function (t) {

        setup()

        t.waitForRowsVisible(gantt, function () {

            var locked = gantt.lockedGrid;

            t.matchGridCellContent(locked, 0, 0, 'Test', 'Column displays stripped tags');

            editing.startEdit(task, locked.headerCt.down('notecolumn'));

            t.chain(
                { waitFor : function () { return editing.getActiveEditor(); } },

                function (next) {

                    editing.getActiveEditor().setValue('');
                    editing.completeEdit();
                    next();
                },

                { waitForGridContent : [locked, 0, 0, ''] },

                function (next) {
                    t.is(task.getNote(), '', 'task value is empty');

                    editing.startEdit(task, locked.headerCt.down('notecolumn'));
                    next();
                },

                { waitFor : function () { return editing.getActiveEditor(); } },

                function (next) {

                    editing.getActiveEditor().setValue('Foo');
                    editing.completeEdit();
                    t.is(task.getNote(), 'Foo', 'task value is empty');

                    next();
                },

                { waitForGridContent : [gantt.lockedGrid, 0, 0, 'Foo'] }
            );
        });

    });

    t.it('Column works properly with previewFn provided', function (t) {

        setup({
            column   : {
                previewFn : function (value) {
                    return Ext.isEmpty(value) ? 'empty' : 'notempty';
                }
            }
        });

        t.waitForRowsVisible(gantt, function () {

            var locked = gantt.lockedGrid;

            t.matchGridCellContent(locked, 0, 0, 'notempty', 'Column uses previewFn');

            editing.startEdit(task, locked.headerCt.down('notecolumn'));

            t.chain(
                { waitFor : function () { return editing.getActiveEditor(); } },

                function (next) {
                    editing.getActiveEditor().setValue('');
                    t.is(task.getNote(), '<p>Test</p>', 'task still not updated');
                    editing.completeEdit();
                    t.matchGridCellContent(locked, 0, 0, 'empty', 'Column displays "empty"');
                    t.is(task.getNote(), '', 'task value is empty');

                    editing.startEdit(task, locked.headerCt.down('notecolumn'));
                    next();
                },

                { waitFor : function () { return editing.getActiveEditor(); } },

                function (next) {
                    editing.getActiveEditor().setValue('Foo');
                    editing.completeEdit();

                    t.is(task.getNote(), 'Foo', 'task value is empty');
                    t.matchGridCellContent(locked, 0, 0, 'notempty', 'Column displays "notempty"');
                }
            );
        });

    });

});