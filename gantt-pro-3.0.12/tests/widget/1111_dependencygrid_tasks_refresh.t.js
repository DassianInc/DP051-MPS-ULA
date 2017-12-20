StartTest(function (t) {

    // here we check if task store changes are reflected on dependency grid combobox store

    var dependencyStore = Ext.create("Gnt.data.DependencyStore", {
        proxy : {
            type   : 'memory',
            reader : {
                type : 'json'
            }
        },

        data : [
            {
                From : 2,
                To   : 3,
                Type : 2
            }
        ]
    });

    var taskStore = Ext.create("Gnt.data.TaskStore", {
        dependencyStore : dependencyStore,
        root            : {
            expanded : true,
            children : [
                {
                    Id        : 2,
                    Name      : 'Task 2',
                    leaf      : true,
                    StartDate : new Date(2011, 6, 5),
                    EndDate   : new Date(2011, 6, 20)
                },
                {
                    Id        : 3,
                    Name      : 'Task 3',
                    leaf      : true,
                    StartDate : new Date(2011, 6, 5),
                    EndDate   : new Date(2011, 6, 20)
                }
            ]
        }
    });

    taskStore.refreshNodeStoreContent(true);

    var task = taskStore.getNodeById(3), taskId, taskName;

    var grid = Ext.create('Gnt.widget.DependencyGrid', {
        renderTo       : Ext.getBody(),
        width          : 400,
        height         : 200,
        task           : task,
        refreshTimeout : 0,
        taskModel      : taskStore.model
    });

    t.waitForRowsVisible(grid, function () {
        t.chain(
            function (next) {
                task = taskStore.getRootNode().appendChild({
                    Id        : 5,
                    Name      : 'Task 5',
                    leaf      : true,
                    StartDate : new Date(2011, 6, 5),
                    EndDate   : new Date(2011, 6, 20)
                });
                next();
            },
            { waitFor : 100 },
            function (next) {
                t.ok(grid.tasksCombo.store.getById(task.getId()), 'Added record is in combobox store');
                next();
            },

            function (next) {
                task.setName('smth');
                next();
            },
            { waitFor : 100 },
            function (next) {
                t.is(grid.tasksCombo.store.getById(task.getId()).getName(), task.getName(), 'Updated record is reflected to combobox store');
                next();
            },

            function (next) {
                taskId = task.getId();
                task = task.remove();
                next();
            },
            { waitFor : 100 },
            function (next) {
                t.notOk(grid.tasksCombo.store.getById(taskId), 'Removed record is not in combobox store');
                next();
            }
        );
    });

});
