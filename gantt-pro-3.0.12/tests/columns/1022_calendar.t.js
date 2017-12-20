StartTest(function(t) {

    var employee_calendar = new Gnt.data.calendar.BusinessTime({
        calendarId  : 'employee',
        name        : 'Employee calendar'
    });

    new Gnt.data.Calendar({
        calendarId          : 'minion',
        name                : 'Minion calendar',
        weekendsAreWorkdays : true
    });

    function getGantt () {
        return t.getGantt({
            renderTo        : Ext.getBody(),
            plugins         : [{ ptype : 'scheduler_treecellediting', clicksToEdit : 1 }],
            columns         : [
                {
                    xtype : 'namecolumn'
                },
                {
                    xtype : 'calendarcolumn',
                    tdCls : 'calcolcell'
                }
            ],
            taskStore       : new Gnt.data.TaskStore({
                root        : {
                    children : [
                        {
                            leaf        : true,
                            Id          : 1,
                            StartDate   : new Date(2010, 0, 4),
                            Duration    : 7
                        }
                    ]
                },
                calendar    : employee_calendar
            })
        });
    }


    t.describe('A task column', function(t) {

        var gantt   = getGantt(),
            task    = gantt.store.getNodeById(1);

        t.it('Should display task assigned calendar initially', function(t) {

            t.waitForSelector('.calcolcell', function () {
                t.matchGridCellContent(gantt.lockedGrid, 0, 1, 'Employee calendar');
                t.is(task.getEndDate(), new Date(2010, 0, 12, 17), 'Being employee a person should finish the task by Jan 12th, 2010 17:00');
            });

        });

        t.it('Should allow changing calendars', function(t) {

            t.chain(
                { click : '.calcolcell' },

                { waitForSelectorAtCursor : 'input' },

                { type : 'Minion calendar[ENTER]' },

                { waitForGridContent : [gantt.lockedGrid, 0, 1, 'Minion calendar'] },

                function (next) {
                    t.is(task.getEndDate(), new Date(2010, 0, 6, 8), 'To be an evil minion means working on 24 hours/day, so the task will be done way faster');
                }
            );
        });
    });
});
