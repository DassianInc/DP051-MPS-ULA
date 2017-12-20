StartTest(function(t) {

    // Check if editor loses its position after locked grid refresh (#841)

    var cellEditing = new Sch.plugin.TreeCellEditing({ clicksToEdit : 1 });
    var position;

    var g = t.getGantt({
        cascadeChanges  : true,
        renderTo        : Ext.getBody(),
        plugins         : cellEditing,
        taskStore       : new Gnt.data.TaskStore({
            root : {
                children : [
                    {
                        Id          : 3,
                        StartDate   : new Date(2010, 1, 1),
                        Duration    : 1,
                        leaf        : false,
                        expanded    : true,
                        children    : [
                            {
                                Id          : 4,
                                StartDate   : new Date(2010, 1, 1),
                                Duration    : 1,
                                leaf        : true
                            },
                            {
                                Id          : 5,
                                StartDate   : new Date(2010, 1, 1),
                                Duration    : 1,
                                leaf        : true
                            },
                            {
                                Id          : 6,
                                StartDate   : new Date(2010, 1, 1),
                                Duration    : 1,
                                leaf        : true
                            }
                        ]
                    }
                ]
            }
        }),
        dependencyStore : new Gnt.data.DependencyStore({
            data : [
                {
                    Id    : 'd1',
                    From  : 4,
                    To    : 5,
                    Type  : 2
                },
                {
                    Id    : 'd2',
                    From  : 5,
                    To    : 6,
                    Type  : 2
                }
            ]
        }),
        columns : [
            {
                xtype : 'treecolumn'
            },
            {
                xtype : 'durationcolumn',
                tdCls : 'dur'
            }
        ]
    });

    t.chain(
        { waitFor : 'rowsVisible', args : g},

        { action : 'click', target : function () { return g.lockedGrid.getView().getCellByPosition({ column : 1, row : 1 })} },

        { waitFor : 'selector', args : '.x-form-spinner-up' },

        function (next) {
            position = cellEditing.getActiveEditor().field.getPosition();
            next();
        },

        { action : 'click', target : '.x-form-spinner-up' },
        { action : 'click', target : '.x-form-spinner-up' },

        { waitFor : 100},

        function (next) {
            t.isDeeply(position, cellEditing.getActiveEditor().field.getPosition(), 'Editor position is the same')
            next();
        }

    )
});
