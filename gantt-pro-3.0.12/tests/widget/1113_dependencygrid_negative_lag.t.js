StartTest(function (t) {

    var dependencyStore = Ext.create("Gnt.data.DependencyStore", {
        data    : [
            {
                Id          : 'd2',
                From        : 4,
                To          : 2,
                Type        : 1
            },
            {
                Id          : 'd3',
                From        : 1,
                To          : 2,
                Type        : 2
            }
        ]
    });

    var taskStore = Ext.create("Gnt.data.TaskStore", {
        dependencyStore : dependencyStore,
        root            : {
            expanded    : true,
            children    : [
                {
                    Id          : 1,
                    Name        : 'Task 1',
                    expanded    : true,
                    children    : [
                        {
                            Id          : 4,
                            Name        : 'Task 4',
                            leaf        : true
                        }
                    ]
                },
                {
                    Id          : 2,
                    Name        : 'Task 2',
                    leaf        : true
                }
            ]
        }
    });

    taskStore.refreshNodeStoreContent(true);

    var task    = taskStore.getNodeById(2);

    var grid    = Ext.create('Gnt.widget.DependencyGrid', {
        renderTo    : Ext.getBody(),
        width       : 400,
        task        : task,
        taskModel   : taskStore.model
    });

    t.diag('Initially dependencies of Task 2 loaded');

    t.is(grid.store.getCount(), 2, 'Grid: 2 dependencies displayed');
    
    var steps = [
        { waitForRowsVisible : grid },
        
        // attempt to monkey-patch the sporadic failures
        { waitFor : 300 },
    
        // start editing of lag column
        { clickToEditCell : [ grid, 0, 3 ] },
        
        //click spinner down 4 times
        {
            click       : function () { return grid.lagEditor.el.down('.x-form-spinner-down').dom; }
        },
        { action : 'click' },
        { action : 'click' },
        { action : 'click' }
    ];
    
    steps.push.apply(steps, [
        { type        : '[ENTER]'   },

        // check grid.saveDependencies() to save added record
        function (next) {
            t.diag('Check if grid.saveDependencies() will save record');
            
            grid.saveDependencies();
            t.is(dependencyStore.getById('d2').getLag(), -4, 'Lag updated ok');
        }
    ]);

    t.chain(steps);
});
