StartTest(function (t) {

    function getActiveEditor () { return grid.cellEditing.getActiveEditor() && grid.cellEditing.getActiveEditor().field }

    function task (id) { return taskStore.getNodeById(id); }

    var dependencyStore = Ext.create("Gnt.data.DependencyStore", {
        transitiveDependencyValidation  : true,
        data : [
            {
                From : 3,
                To   : 4,
                Type : 2
            },
            {
                From : 4,
                To   : 2,
                Type : 1
            },
            {
                From : 1,
                To   : 2,
                Type : 2
            },
            {
                From : 5,
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
                    Id        : 1,
                    Name      : 'Task 1',
                    StartDate : new Date(2011, 6, 1),
                    EndDate   : new Date(2011, 6, 5),
                    leaf      : true
                },
                {
                    Id        : 3,
                    Name      : 'Task 3',
                    leaf      : true,
                    StartDate : new Date(2011, 6, 1),
                    EndDate   : new Date(2011, 6, 5)
                },
                {
                    Id        : 4,
                    Name      : 'Task 4',
                    leaf      : true,
                    StartDate : new Date(2011, 6, 1),
                    EndDate   : new Date(2011, 6, 5)
                },
                {
                    Id        : 2,
                    Name      : 'Task 2',
                    leaf      : true,
                    StartDate : new Date(2011, 6, 5),
                    EndDate   : new Date(2011, 6, 20)
                },
                {
                    Id        : 5,
                    Name      : 'Task 5',
                    leaf      : true,
                    StartDate : new Date(2011, 6, 5),
                    EndDate   : new Date(2011, 6, 20)
                },
                {
                    Id        : 6,
                    Name      : 'Task_6<img id=qwerty>',
                    leaf      : true,
                    StartDate : new Date(2011, 6, 5),
                    EndDate   : new Date(2011, 6, 20)
                },
                {
                    Id        : 7,
                    Name      : 'Task_7<img id=zxcvbn>',
                    leaf      : true,
                    StartDate : new Date(2011, 6, 5),
                    EndDate   : new Date(2011, 6, 20)
                },
                {
                    Id        : 8,
                    Name      : 'Task 8',
                    leaf      : true,
                    StartDate : new Date(2011, 6, 5),
                    EndDate   : new Date(2011, 6, 20)
                }
            ]
        }
    });

    var grid = new Gnt.widget.DependencyGrid({
        renderTo        : Ext.getBody(),
        width           : 400,
        title           : task(2).getName(),
        dependencyStore : dependencyStore,
        task            : task(2),
        taskModel       : taskStore.model
    });

    var selModel = grid.getSelectionModel();
    var editor, record;

    t.is(selModel.getCount(), 0, 'Grid: No rows are selected');

    t.is(grid.direction, 'predecessors', 'Grid: direction = "predecessors"');

    t.diag('Initially dependencies of Task 2 loaded');

    t.is(grid.task.getId(), 2, 'Grid: task Id = 2');
    t.is(grid.store.getCount(), 2, 'Grid: 2 dependencies displayed');

    t.it('Basic tests', function(t) {

        t.chain(
            { waitForRowsVisible : grid },

            function (next) {
                t.is(grid.store.getCount(), grid.getView().getNodes().length, 'Rendered all data in store ok');
                t.matchGridCellContent(grid, 0, 0, 4, 'Found 4 in [0,0] cell');
                t.matchGridCellContent(grid, 0, 1, 'Task 4', 'Found "Task 4" in [0,1] cell');

                t.matchGridCellContent(grid, 1, 0, 1, 'Found 1 in [1,0] cell');
                t.matchGridCellContent(grid, 1, 1, 'Task 1', 'Found "Task 1" in [1,1] cell');
                next();
            },

            { click : '.x-grid-row td:nth-child(2)', desc : 'start editing of task column' },
            { click : '.x-form-trigger', desc : 'let`s open picker' },

            function (next) {
                var editor      = getActiveEditor();
                var selected    = editor.getPicker().el.down('.x-boundlist-item.x-boundlist-selected').dom;

                selected = selected.innerText || selected.textContent;

                t.is(selected, 'Task 4', 'Picker highlighted proper item "Task 4"');

                t.isDeeplyUnordered(Ext.Array.map(editor.store.getRange(), function (i) { return i.originalRecord }),
                    [task(4), task(8), task(7), task(6)], 'proper set of records in tasks combo');

                t.notOk(document.getElementById('zxcvbn'), 'Combobox escapes HTML characters');

                next();
            },

            // test dependency adding
            function (next) {
                t.diag('Test dependency adding');
                record = grid.insertDependency()[0];

                t.ok(grid.store.getAt(0) === record, 'Added record is first at grid store');

                t.is(record.getType(), 2, 'Type=2 (End-to-Start)');
                t.is(record.getLag(), 0, 'Lag=0');
                t.is(record.getLagUnit(), 'd', 'LagUnit="d"');

                next()
            },

            { waitFor : getActiveEditor },

            // type "Task 3" to combo
            function (next) {
                t.diag('Lest`s type string "Task 8" to task combo');
                editor = grid.cellEditing.getActiveEditor();
                editor.field.inputEl.dom.value = 'Task 8';

                grid.cellEditing.completeEdit();

                next();
            },
            function (next) {
                t.is(editor.field.getValue(), 8, 'Proper value set');
                t.ok(record.isValid(), 'Field is valid');

                next();
            },

            // check grid.saveDependencies() to not save invalid records
            function (next) {
                t.diag('Check if grid.saveDependencies() will save invalid records');
                grid.saveDependencies();
                t.is(dependencyStore.getCount(), 5, 'dependencyStore number of records didn`t change (invalid field didn`t get to dependencyStore)');

                next();
            },

            { clickToEditCell : [grid, 0, 1] },

            function (next) {
                t.diag('Let`s type string "Task_6&lt;img id=qwerty&gt;" to task combo');
                editor = grid.cellEditing.getActiveEditor();
                editor.field.inputEl.dom.value = '';

                // in ext5 behavior of combobox has changed: when you hit space in input it picks first item from list
                // in order to not make changes to widget we just remove wrong part of name
                t.type(editor.field, 'Task_6<img id=qwerty>', next);
            },
            function (next) {
                grid.cellEditing.completeEdit();

                t.notOk(document.getElementById('qwerty'), 'Grid escapes HTML characters');

                t.is(editor.field.getValue(), 6, 'Proper value set');
                t.ok(record.isValid(), 'Field marked as valid');
                var cell = grid.getView().getCellByPosition({ row : 0, column : 1 });
                t.ok(!cell.getAttribute('data-errorqtip'), 'No error tooltip');

                next();
            },

            // check grid.saveDependencies() to save added record
            function (next) {
                t.diag('Check if grid.saveDependencies() will save added record');
                grid.saveDependencies();
                t.is(dependencyStore.getCount(), 5, 'dependencyStore number of records increased');
                t.ok(!!dependencyStore.getByTaskIds(6, 2), 'dependencyStore has added record');

                next();
            },

            // check grid.saveDependencies() to not save added record again
            function (next) {
                t.diag('Check if grid.saveDependencies() will save added record again');
                grid.saveDependencies();
                t.is(dependencyStore.getCount(), 5, 'dependencyStore number of records didn`t change');

                next();
            }
        );
    });

    t.describe('Load task by task', function(t) {

        // 1) load a task, 2) check grid.task property; 3) check grid rows number

        t.it('switch to task #1', function(t) {
            var task = taskStore.getNodeById(1);
            grid.loadDependencies(task);
            // set grid title ..just for nice look
            grid.setTitle(task.getName());

            t.is(grid.task.getId(), 1, 'Grid: task Id = 1');

            t.is(grid.store.getCount(), 0, 'Grid: no dependencies displayed');
            t.is(grid.store.getCount(), grid.getView().getNodes().length, 'Rendered all data in store ok');

        })

        t.it('switch to task #3', function(t) {
            var task = taskStore.getNodeById(3);
            grid.loadDependencies(task);
            // set grid title ..just for nice look
            grid.setTitle(task.getName());

            t.is(grid.task.getId(), 3, 'Grid: task Id = 3');

            t.is(grid.store.getCount(), 1, 'Grid: 1 dependency displayed');
            t.is(grid.store.getCount(), grid.getView().getNodes().length, 'Rendered all data in store ok');
        });

        t.it('switch to task #4', function(t) {
            var task = taskStore.getNodeById(4);
            grid.loadDependencies(task);
            // set grid title ..just for nice look
            grid.setTitle(task.getName());

            t.is(grid.task.getId(), 4, 'Grid: task Id = 4');

            t.is(grid.store.getCount(), 1, 'Grid: 1 dependency displayed');
            t.is(grid.store.getCount(), grid.getView().getNodes().length, 'Rendered all data in store ok');

            t.matchGridCellContent(grid, 0, 0, 3, 'Found 3 in [0,0] cell');
            t.matchGridCellContent(grid, 0, 1, 'Task 3', 'Found "Task 3" in [0,1] cell');
        });
    });

    t.it('Let`s type invalid string "smth" to task combo', function(t) {

        t.chain(
            // start editing of task column
            function (next) {
                grid.cellEditing.startEditByPosition({row : 0, column : 1});

                next();
            },

            { click : getActiveEditor },

            // type "smth" to input element
            function (next) {
                editor = grid.cellEditing.getActiveEditor();
                editor.field.inputEl.dom.value = 'smth';
                // imitate blur event on the field it should validate value
                // in the picker and not change value in the field
                next()
            },

            { type : '[TAB]' },

            function (next) {
                t.matchGridCellContent(grid, 0, 1, 'Task 3', 'Editor value still keeps 3');
            }

        );
    });

    // #1277
    t.it('Doesn`t raise exception when we call saveDependencies() for an unloaded grid', function(t) {
        var g   = new Gnt.widget.DependencyGrid();

        t.livesOk(function() { g.saveDependencies(); });
    });
});
