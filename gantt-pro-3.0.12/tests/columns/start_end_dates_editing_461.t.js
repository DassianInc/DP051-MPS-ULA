StartTest(function(t) {
    // we'll verify #461 bug - setting start date of milestone to prevValue + 1 day didn't change start date

    //======================================================================================================================================================================================================================================================
    t.diag('Setup');

    var editing = Ext.create('Sch.plugin.TreeCellEditing', { clicksToEdit: 1 });

    var taskStore = new Gnt.data.TaskStore({
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
                },
                {
                    Id          : 3,
                    Name        : "Task3",
                    StartDate   : new Date(2010, 1, 8),
                    EndDate     : new Date(2010, 1, 8),
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
        task2   = taskStore.getRootNode().childNodes[ 1 ],
        task3   = taskStore.getRootNode().childNodes[ 2 ]

    var lockedGrid      = gantt.lockedGrid;

    var startDate       = task1.getStartDate();
    var startCol        = lockedGrid.headerCt.items.getAt(1);

    var view            = lockedGrid.getView();

    t.chain(
        // 3rd task
        {
            action  : 'click',
            target  : function () { return view.getCellByPosition({ row : 2, column : 1 }) }
        },
        {
            waitFor : 'selectorAtCursor',
            args    : '.x-form-field'
        },

        function (next) {
            editing.getActiveEditor().field.setValue(new Date(2010, 1, 9));
            editing.completeEdit();

            t.is(task3.getEndDate(), new Date(2010, 1, 9), 'Entering whole day into end date editor was adjusted to the latest availability time for that day');

            next();
        }
    )
});
