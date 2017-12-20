StartTest(function(t) {

    var task = new Gnt.model.Task({
        StartDate   : new Date(2012, 7, 31),
        EndDate     : new Date(2012, 7, 31),
        Duration    : 0,
        leaf        : true
    });

    var endCol = new Gnt.column.EndDate({
        format                  : 'Y-m-d',
        adjustMilestones        : true
    });
    t.is(endCol.renderer(task.getEndDate(), {}, task), '2012-08-30', 'Milestone end should be rendered -1 day')

    var startCol = new Gnt.column.StartDate({
        format                  : 'Y-m-d',
        adjustMilestones        : true
    });
    t.is(startCol.renderer(task.getStartDate(), {}, task), '2012-08-30', 'Milestone start should be rendered -1 day')


    // Now let`s test the editors, which also need to use the previous day while editing
    var editor = Ext.create('Sch.plugin.TreeCellEditing');

    var g = t.getGantt({
        startDate       : new Date(2010, 1, 1),
        endDate         : new Date(2010, 2, 1),

        renderTo : document.body,
        plugins : editor,
        columns : [
            { xtype : 'treecolumn' },
            startCol,
            endCol
        ],

        root : {
            children : [
                task
            ]
        }
    });
    
    t.chain(
        { dblclick : '.x-grid-cell:nth-child(2)' },

        { waitForSelectorAtCursor : 'input' },

        function (next) {

            var field = editor.getActiveEditor().field;

            t.is(field.getRawValue(), '2012-08-30', '!Correct value found in date picker');

            field.setValue(new Date(2012, 7, 21));
            editor.completeEdit();

            t.is(task.getStartDate(), new Date(2012, 7, 21), 'Should find start date updated after start edit');
            t.is(task.getEndDate(), new Date(2012, 7, 21), 'Should find end date updated after start edit');

            next()
        },

        // End date verification
        { dblclick : '.x-grid-cell:nth-child(3)' },
        { waitForSelectorAtCursor : 'input' },

        function (next) {
            t.is(editor.getActiveEditor().field.getValue(), new Date(2012, 7, 21), 'Correct value found in date picker');

            editor.getActiveEditor().field.setValue(new Date(2012, 7, 21));
            editor.completeEdit();

            next()
        },

        function (next) {
            t.is(task.getEndDate(), new Date(2012, 7, 21), 'Should find end date updated after end edit');

            task.setStartEndDate(new Date(2012, 7, 21), new Date(2012, 7, 21));
            editor.completeEdit();
            next()
        },

        // If changing end date of a milestone, the start date should be refreshed too
        { dblclick : '.x-grid-cell:nth-child(3)' },
        { waitForSelectorAtCursor : 'input' },

        function (next) {

            var field = editor.getActiveEditor().field;

            field.setValue(new Date(2012, 7, 29));

            t.is(field.getRawValue(), '2012-08-28', 'Should find the correct value set in the editor');
            editor.getActiveEditor().completeEdit();
            next();
        },

        { waitForSelector : '.x-grid-cell:nth-child(2):contains(2012-08-21)', desc : 'Start date rendered correctly after updating milestone to regular task' }
    );
});
