StartTest(function(t) {
    // for the first 2 tasks in this test we'll verify, that when user selects some specific _day_ in the day picker
    // the actual start/end date will also contain time information. Time information is appeneded to a day as the
    // earliest/latest availability time for that day (from the calendar)
    // this happens only if editor has format w/o hours/mins information

    //======================================================================================================================================================================================================================================================
    t.diag('Setup');

    var editing = Ext.create('Sch.plugin.TreeCellEditing', { clicksToEdit: 1 });

    var taskStore = new Gnt.data.TaskStore({
        calendar        : t.getBusinessTimeCalendar(),

        cascadeChanges  : true,
        cascadeDelay    : 0,

        proxy           : {
            type    : 'memory',
            data    : [
                {
                    Id          : 1,
                    Name        : "Task1",
                    StartDate   : new Date(2010, 1, 3),
                    Duration    : 2,
                    leaf        : true
                },
                {
                    Id          : 2,
                    Name        : "Task2",
                    StartDate   : new Date(2010, 1, 8),
                    EndDate     : new Date(2010, 1, 10),
                    leaf        : true
                }
            ]
        },

        root: {
            Id          : 'Root',
            loaded      : true,
            expanded    : true
        }
    });

    taskStore.load()

    var gantt = t.getGantt({
        renderTo    : Ext.getBody(),

        taskStore   : taskStore,

        columns : [
            { xtype : 'treecolumn', width : 40 },
            {
                xtype       : 'startdatecolumn',
                format      : 'Y-m-d',
                width       : 90
            },
            {
                xtype       : 'enddatecolumn',
                format      : 'Y-m-d',
                width       : 90
            }
        ],
        plugins     : editing,
        startDate   : new Date(2010, 1, 1),
        endDate     : new Date(2010, 2, 1)
    });


    var task1   = taskStore.getRootNode().childNodes[ 0 ],
        task2   = taskStore.getRootNode().childNodes[ 1 ]

    var lockedGrid      = gantt.lockedGrid;

    var startDate       = task1.getStartDate();
    var startCol        = lockedGrid.headerCt.items.getAt(1);

    var view            = lockedGrid.getView();

    t.chain(
        {
            waitFor     : 'EventsToRender',
            args        : gantt
        },
        'waitFor(100)',
        // 1st task - start date
        {
            click   : function () { return view.getCellByPosition({ row : 0, column : 1 }) }
        },
        {
            waitFor : 'selectorAtCursor',
            args    : '.x-form-field'
        },
        function (next) {
            editing.getActiveEditor().setValue(new Date(2010, 1, 9));
            editing.completeEdit();

            t.is(task1.getStartDate(), new Date(2010, 1, 9, 8), 'Entering whole day into start date editor was adjusted to the earliest availability time for that day');

            next();
        },

        // 2nd task - end date
        {
            click   : function () { return view.getCellByPosition({ row : 1, column : 2 }) }
        },
        {
            waitFor : 'selectorAtCursor',
            args    : '.x-form-field'
        },
        function (next) {
            editing.getActiveEditor().field.setValue(new Date(2010, 1, 12));
            editing.completeEdit();

            t.is(task2.getEndDate(), new Date(2010, 1, 11, 17), 'Entering whole day into end date editor was adjusted to the latest availability time for that day');

            next();
        }
    )
});
