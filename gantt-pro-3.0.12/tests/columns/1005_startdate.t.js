/* jshint withstmt: true */
/* globals g,taskStore,editing */
StartTest(function(t) {

    var setup   = function () {
        var editing = Ext.create('Sch.plugin.TreeCellEditing', { clicksToEdit: 1 });

        var g = t.getGantt({
            renderTo    : Ext.getBody(),
            columns : [
                { xtype : 'treecolumn', width : 40 },
                {
                    xtype       : 'startdatecolumn',
                    format      : 'M d/Y G:i',
                    width       : 110
                },
                {
                    xtype       : 'startdatecolumn',
                    format      : 'Y-m-d',
                    width       : 110
                },
                {
                    xtype       : 'enddatecolumn',
                    format      : 'M d/Y G:i',
                    width       : 110
                }
            ],
            plugins     : editing,
            startDate   : new Date(2010, 1, 1),
            endDate     : new Date(2010, 2, 1),
            taskStore   : t.getTaskStore({
                DATA    : [
                    {
                        "leaf": true,
                        "Id": 117,
                        "Name": "New task 1",
                        "StartDate": new Date(2010, 1, 1, 8),
                        "Duration": 0
                    },
                    {
                        "leaf": true,
                        "Id": 118,
                        "Name": "New task 2",
                        "StartDate": new Date(2010, 1, 10),
                        "Duration": 0
                    }
                ]
            })
        });

        return {
            taskStore   : g.taskStore,
            g           : g,
            editing     : editing
        }
    };

    t.it('Should edit start date', function (t) {
        with (setup()) {
            var lockedGrid  = g.lockedGrid;
            var firstTask   = taskStore.getRootNode().childNodes[0];
            var secondTask  = taskStore.getRootNode().childNodes[1];
            var view        = lockedGrid.getView();

            t.chain(
                { click : function () { return view.getCellByPosition({ row : 0, column : 1 }) } },

                {
                    waitForSelectorAtCursor : '.x-form-field'
                },

                function (next) {
                    editing.getActiveEditor().setValue(new Date(2010, 1, 2, 8));
                    editing.completeEdit();

                    t.is(firstTask.getStartDate(), new Date(2010, 1, 2, 8), 'StartDate moved one day');

                    firstTask.setStartEndDate(null, null);
                    firstTask.setDuration(null);

                    var innerCell = view.getCellByPosition({ row : 0, column : 1 }).down('.x-grid-cell-inner');

                    t.is(Ext.String.trim(innerCell.dom.innerHTML.replace('&nbsp;', '')), '', 'Cell rendered empty if start date is null');

                    next();
                },

                {
                    action  : 'click',
                    target  : function() { return view.getCellByPosition({ row : 0, column : 2 }); }
                },

                function (next) {
                    editing.getActiveEditor().setValue(new Date(2010, 1, 2));
                    editing.completeEdit();

                    t.is(firstTask.getEndDate(), null, 'EndDate intact (null) after start date edit');

                    t.is(firstTask.getStartDate(), new Date(2010, 1, 2), 'StartDate intact after edit, with null EndDate');

                    t.contentLike(view.getCellByPosition({ row : 0, column : 2 }), '2010-02-02', 'StartDate rendered ok');

                    next()
                },

                {
                    action  : 'click',
                    // activating editing of column with time
                    target  : function() { return view.getCellByPosition({ row : view.store.indexOf(secondTask), column : 1 }); }
                },
                {
                    waitFor : 'selectorAtCursor',
                    args    : '.x-form-field'
                },

                function (next) {
                    // setting a date value with non-zero time portion
                    editing.getActiveEditor().setValue(new Date(2010, 1, 12, 8));
                    editing.completeEdit();

                    // the value should not be messed up by column editor
                    t.is(secondTask.getStartDate(), new Date(2010, 1, 12, 8), 'StartDate was updated to 2012/02/12 08:00 correctly');
                    next();
                }
            )
        }
    });

    t.it('Should validate input when dates constrained', function (t) {
        with (setup()) {
            var secondTask  = taskStore.getRootNode().childNodes[1];
            var view        = g.lockedGrid.getView();
            var editor;

            t.chain(
                {
                    action  : 'click',
                    // activating editing of column with time
                    target  : function() { return view.getCellByPosition({ row : view.store.indexOf(secondTask), column : 1 }); }
                },
                function (next) {
                    editor = g.columns[1].getEditor();
                    editor.setMinValue(new Date(2010, 1, 1));
                    editor.setMaxValue(new Date(2010, 1, 12));
                    editor.inputEl.dom.value = "Jan 10/2010 8:00"
                    next();
                },

                { action : "type", text : "[LEFT]" },
                function (next) {
                    t.ok(editor.inputEl.hasCls('x-form-invalid-field'), 'Value does not pass minimum check')

                    editor.inputEl.dom.value = "Feb 10/2010 8:00"
                    next();
                },
                { action : "type", text : "[LEFT]" },
                function (next) {
                    t.ok(!editor.inputEl.hasCls('x-form-invalid-field'), 'Value pass both checks')

                    editor.inputEl.dom.value = "Mar 10/2010 8:00"
                    next();
                },
                { action : "type", text : "[LEFT]" },
                function (next) {
                    t.ok(editor.inputEl.hasCls('x-form-invalid-field'), 'Value does not pass maximum check')

                    editor.inputEl.dom.value = "Feb 11/2010 8:00";
                    next();
                },
                { action : "type", text : "[BACKSPACE]1" },

                {
                    action  : 'click',
                    // activating editing of column with time
                    target  : function() { return view.getCellByPosition({ row : view.store.indexOf(secondTask), column : 3 }); }
                },

                function (next) {
                    t.is(secondTask.getStartDate(), new Date(2010, 1, 11, 8, 1), 'Date set correctly');
                }
            );
        }
    });
});
