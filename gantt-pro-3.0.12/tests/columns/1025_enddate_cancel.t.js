StartTest(function(t) {

    // Checks that EndDate field when used as column editor allows to cancel editing after selecting a date in its picker #2041

    var setup = function () {
        var editing = Ext.create('Sch.plugin.TreeCellEditing', { clicksToEdit: 1 });

        var g           = t.getGantt({
            taskStore   : t.getTaskStore({
                DATA : [{
                    StartDate   : '2015-05-19',
                    Duration    : 1
                }]
            }),
            startDate   : null,
            endDate     : null,
            columns     : [{ xtype : 'enddatecolumn' }],
            renderTo    : Ext.getBody(),
            plugins     : editing
        });

        return {
            gantt   : g,
            editing : editing
        }
    };

    var getDateCell      = function (title) {
        return '[aria-label="' + title + '"]';
    };

    t.it('Saves original value into a task after editing cancel', function (t) {

        var context = setup(),
            gantt   = context.gantt,
            editing = context.editing;

        t.waitForEventsToRender(gantt, function () {
            var view    = gantt.lockedGrid.getView(),
                task    = gantt.taskStore.getRoot().firstChild,
                input;

            t.chain(
                {
                    click : function () {
                        return view.getCellByPosition({ row : 0, column : 0 });
                    }
                },

                { waitForCQVisible : 'enddatefield' },

                function (next) {
                    // keep reference to the element at cursor to use it later in "waitForElementNotVisible"
                    editing.getActiveEditor().field.expand();

                    t.click(getDateCell('May 20'), function () {
                        // Note: seems the field intentionally persists its value to the task
                        // when we select date in the picker
                        t.is(task.getEndDate(), new Date(2015, 4, 21), 'value saved to the task');

                        next();
                    });
                },

                { type : '[ESCAPE]' },

                { waitForSelectorAtCursor : ':not(input)'},

                function () {
                    t.is(task.getDuration(), 1, 'task value restored back');

                }
            );


        });
    });
});
