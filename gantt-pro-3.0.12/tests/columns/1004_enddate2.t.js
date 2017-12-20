/* jshint withstmt: true */
/* globals g,editing */
StartTest(function(t) {
    var setup;

    t.beforeEach(function() {
        var editing = Ext.create('Sch.plugin.TreeCellEditing', { clicksToEdit: 1 });

        var g = t.getGantt({
            startDate   : new Date(2010, 1, 1),
            endDate     : new Date(2010, 2, 1),
            taskStore   : t.getTaskStore({
                DATA    : {
                    "children": [{
                        "leaf"      : true,
                        "Id"        : 1,
                        "StartDate" : "2010-02-02T00:00:00",
                        "EndDate"   : "2010-02-04T00:00:00",
                        "Name"      : "New task 1"
                    }]
                }
            }),
            renderTo    : Ext.getBody(),
            plugins     : editing
        });

        setup       = {
            g       : g,
            editing : editing
        }
    })

    t.it('Should edit end date', function (t) {
        with (setup) {
            var lockedGrid  = g.lockedGrid;
            var view        = lockedGrid.getView();
            var endDateHeader, endDateColIndex, startDateColIndex;


            t.chain(
                { waitForEventsToRender : g },
                function (next) {
                    endDateHeader       = lockedGrid.down('enddatecolumn');
                    endDateColIndex     = lockedGrid.headerCt.items.indexOf(endDateHeader);
                    startDateColIndex   = lockedGrid.headerCt.items.indexOf(lockedGrid.down('startdatecolumn'));

                    next();
                },

                { click : function () { return view.getCellByPosition({ row : 0, column : endDateColIndex }) } },
                { waitForSelectorAtCursor : '.x-form-field' },

                function (next) {
                    editing.getActiveEditor().field.setValue(new Date(2010, 1, 3));
                    editing.completeEdit();

                    var firstTask = t.getFirstLeafTask(g.taskStore);

                    t.is(firstTask.getEndDate(), new Date(2010, 1, 3), 'Setting end date = start date should bump it 1 day');
                    t.is(firstTask.getDuration(), 1, 'Setting end date = start date should mean a 1 day duration');
                    t.ok(!firstTask.isMilestone(), 'Task not converted into a milestone if end is set to start date');

                    t.is(view.getCellByPosition({
                            row    : 0,
                            column : startDateColIndex
                        }).child('.x-grid-cell-inner').dom.innerHTML,
                        view.getCellByPosition({
                            row    : 0,
                            column : endDateColIndex
                        }).child('.x-grid-cell-inner').dom.innerHTML,
                        'Both start and end date cells should be the same');
                    next();
                },
                { waitForSelector : '.x-grid-cell:nth-child(3):contains(02/02/2010)' }
            );
        }
    });

    t.it('Should validate input when dates constrained', function (t) {
        with (setup) {
            var editor, view = g.lockedGrid.getView();

            t.chain(
                { waitForEventsToRender : g },
                {
                    action  : 'click',
                    // activating editing of column with time
                    target  : function() { return view.getCellByPosition({ row : 0, column : 2 }); }
                },
                function (next) {
                    t.diag('Should constrain dates for editor (end date)');
                    editor = g.columns[2].getEditor();
                    editor.setMinValue(new Date(2010, 1, 13));
                    editor.setMaxValue(new Date(2010, 1, 15));
                    editor.inputEl.dom.value = "01/15/2010";
                    next();
                },

                { action : "type", text : "[LEFT]" },
                function (next) {
                    t.ok(editor.inputEl.hasCls('x-form-invalid-field'), 'Value does not pass minimum check')

                    editor.inputEl.dom.value = "02/15/2010";
                    next();
                },
                { action : "type", text : "[LEFT]" },
                function (next) {
                    t.ok(!editor.inputEl.hasCls('x-form-invalid-field'), 'Value pass both checks')

                    editor.inputEl.dom.value = "03/15/2010";
                    next();
                },
                { action : "type", text : "[LEFT]" },
                function (next) {
                    t.ok(editor.inputEl.hasCls('x-form-invalid-field'), 'Value does not pass maximum check')
                    editor.inputEl.dom.value = ""
                    next();
                },
                { action : "type", text : "02/15/2010[RETURN]" },
                {
                    action  : 'click',
                    // activating editing of column with time
                    target  : function() { return view.getCellByPosition({ row : 0, column : 1 }); }
                },
                function (next) {
                    var firstTask   = t.getFirstLeafTask(g.taskStore);
                    t.is(firstTask.getEndDate(), new Date(2010, 1, 16), 'Date set correctly');
                }
            );
        }
    });
});
