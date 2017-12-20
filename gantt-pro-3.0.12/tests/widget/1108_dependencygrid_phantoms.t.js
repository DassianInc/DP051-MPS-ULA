StartTest(function (t) {

    var dependencyStore = t.getDependencyStore();

    var taskStore = t.getTaskStore({
        dependencyStore : dependencyStore
    });

    taskStore.refreshNodeStoreContent(true);

    var task    = taskStore.getNodeById(115);

    var newTask1 = new Gnt.model.Task({
        Name            : 'Phantom task 1',
        PercentDone     : 30,
        StartDate       : new Date(2010, 1, 1),
        EndDate         : new Date(2010, 1, 7),
        leaf            : true
    });

    var newTask2 = new Gnt.model.Task({
        Name            : 'Phantom task 2',
        PercentDone     : 30,
        StartDate       : new Date(2010, 1, 1),
        EndDate         : new Date(2010, 1, 7),
        leaf            : true
    });

    task.addTaskAbove(newTask1);
    task.addTaskAbove(newTask2);

    var grid    = Ext.create('Gnt.widget.DependencyGrid', {
        renderTo    : Ext.getBody(),
        width       : 400,
        task        : task,
        taskModel   : taskStore.model
    });

    var selModel = grid.getSelectionModel();
    var editor, record;

    t.chain(
        { waitForRowsVisible : grid },

        function (next) {
            t.diag('Test dependency with phantom task adding');
            record  = grid.insertDependency()[0];

            // new record should be first at store
            t.ok(grid.store.getAt(0) === record, 'Added record is first at grid store');

            t.is(record.get(record.typeField), 2, 'Type=2 (End-to-Start)');
            t.is(record.get(record.lagField), 0, 'Lag=0');
            t.is(record.get(record.lagUnitField), 'd', 'LagUnit="d"');

            next();
        },

        { waitFor : function() { return grid.cellEditing.getActiveEditor(); }},

        // type "Phantom task 1" to combo
        function(next) {
            t.diag('Let`s type string "Phantom task 1" to task combo');
            editor  = grid.cellEditing.getActiveEditor();
            editor.field.inputEl.dom.value = 'Phantom task 1';
            grid.cellEditing.completeEdit();

            next();
        },

        function (next) {
            // TODO: I'm not sure if it's ok
            //t.is(record.get(record.fromField), newTask1.getPhantomId(), 'Phantom task id in from field');
            t.is(record.get(record.fromField), newTask1.getId(), 'Phantom task id in from field');

            t.diag('Persist dependencies');

            t.verifyCachedDependenciesState(taskStore)

            grid.saveDependencies();

            t.verifyCachedDependenciesState(taskStore)

            t.ok(dependencyStore.areTasksLinked(task, newTask1), 'New dependency saved');

            next();
        },

        function (next) {
            t.diag('Load dependencies of phantom task');
            grid.loadDependencies(newTask2);

            t.diag('Test dependency with phantom task adding');
            record  = grid.insertDependency()[0];

            // new record should be first at store
            t.ok(grid.store.getAt(0) === record, 'Added record is first at grid store');

            t.is(record.get(record.typeField), 2, 'Type=2 (End-to-Start)');
            t.is(record.get(record.lagField), 0, 'Lag=0');
            t.is(record.get(record.lagUnitField), 'd', 'LagUnit="d"');

            next();
        },

        { waitFor : function() { return grid.cellEditing.getActiveEditor(); }},

        // type "Phantom task 1" to combo
        function(next) {
            t.diag('Let`s type string "Phantom task 1" to task combo');
            editor  = grid.cellEditing.getActiveEditor();
            editor.field.inputEl.dom.value = 'Phantom task 1';
            grid.cellEditing.completeEdit();

            next();
        },

        function (next) {
            // TODO: I'm not sure if it's ok
            //t.is(record.get(record.fromField), newTask1.getPhantomId(), 'Phantom task id in from field');
            t.is(record.get(record.fromField), newTask1.getId(), 'Phantom task id in from field');

            t.diag('Persist dependencies');
            grid.saveDependencies();
            t.ok(dependencyStore.areTasksLinked(newTask2, newTask1), 'New dependency saved');
        }
    );
});
