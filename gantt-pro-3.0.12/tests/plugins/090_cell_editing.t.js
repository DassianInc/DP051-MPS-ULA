StartTest(function(t) {

    t.it('Should edit cell', function (t) {
        var ed = Ext.create('Sch.plugin.TreeCellEditing', { clicksToEdit: 1 });

        var g = t.getGantt({
            viewPreset      : 'weekAndDayLetter',
            renderTo        : Ext.getBody(),
            plugins         : ed,
            columns         : [
                {
                    xtype       : 'namecolumn',
                    width       : 100,
                    editor      : {}
                },
                {
                    xtype : 'durationcolumn'
                }
            ]
        });

        var editor = g.lockedGrid.headerCt.getHeaderAtIndex(0).getEditor();

        var editorElXY, record;

        t.chain(
            { waitForEventsToRender : g },

            { click : Ext.grid.View.prototype.itemSelector + ':nth-child(2) .x-grid-cell' },

            { waitForComponentVisible : editor },

            function (next) {
                record      = g.taskStore.getRoot().firstChild.firstChild;

                editorElXY  = editor.el.getXY();

                // Make sure the editor is visible
                t.elementIsTopElement(editor.el, true, 'Editor visible after cell click');

                // Now we call refreshSize() which eventually flushes layouts
                g.lockedGrid.getView().refreshSize();

                next();
            },

            { waitFor : 500 },

            function (next) {
                t.elementIsAt(editor.el.dom, editorElXY, 'Editor kept its position after layouts flushing');

                editor.setValue('foo');

                ed.completeEdit();

                t.is(record.getName(), 'foo', 'Could edit name and update value');

                g.setReadOnly(true);

                next();
            },

            { click : Ext.grid.View.prototype.itemSelector + ':nth-child(2) .x-grid-cell' },
            { waitFor : 500 },

            function () {
                t.elementIsNotVisible(editor.el, 'Editor is not displayed. ReadOnly working for locked grid.');
                g.destroy();
            }
        );
    });

    t.it('Should edit segmented task correctly', function (t) {
        var ed = Ext.create('Sch.plugin.TreeCellEditing', { clicksToEdit: 1 });

        var g = t.getGantt({
            renderTo        : Ext.getBody(),
            plugins         : ed,
            startDate       : new Date(2010, 1, 1),
            columns         : [
                { xtype   : 'enddatecolumn' },
                { xtype   : 'durationcolumn' }
            ],
            taskStore       : t.getTaskStore({
                DATA : [{
                    "Id"                : 1,
                    "leaf"              : true,
                    "Name"              : "Investigate",
                    "PercentDone"       : 50,
                    "StartDate"         : "2010-02-01",
                    "Segments"          : [
                        {
                            "Id"                : 1,
                            "StartDate"         : "2010-02-01",
                            "Duration"          : 1
                        },
                        {
                            "Id"                : 2,
                            "StartDate"         : "2010-02-03",
                            "Duration"          : 2
                        }
                    ]
                }]
            })
        });

        var task = g.taskStore.getNodeById(1);

        t.chain(
            { waitForEventsToRender : g },
            { click : Ext.grid.View.prototype.itemSelector + ':nth-child(1) .x-grid-cell' },
            { waitForCQVisible : 'enddatefield' },
            // clicking on view does not stop editing in 5.1.2, click on header
            // https://www.sencha.com/forum/showthread.php?308045-Container-click-will-not-stop-editing
            { click : '.sch-column-header' },
            function (next) {
                t.notOk(task.dirty, 'Task should not be dirty');
                t.ok(Ext.Object.isEmpty(task.modified), 'Task has no modified fields');
                task.reject();
                next();
            },
            { click : Ext.grid.View.prototype.itemSelector + ':nth-child(1) .x-grid-cell:nth-child(2)' },
            { waitForCQVisible : 'durationfield' },
            { click : '.sch-column-header' },
            function (next) {
                t.notOk(task.dirty, 'Task should not be dirty');
                t.ok(Ext.Object.isEmpty(task.modified), 'Task has no modified fields');
                task.reject();
                next();
            }
        );
    });
});
