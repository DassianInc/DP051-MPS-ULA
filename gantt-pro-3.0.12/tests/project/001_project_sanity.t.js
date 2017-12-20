/* global Foo */
StartTest(function (t) {

    t.expectGlobals('Foo');

    Ext.define('Foo.Task', {
        extend  : 'Gnt.model.Task'
    });

    Ext.define('Foo.Project', {
        extend  : 'Gnt.model.Project'
    });


    function getTaskStore (config) {
        config  = config || {};

        return t.getTaskStore(Ext.apply({
            DATA : t.getProjectData(config ? config.noOfProjects : 1)
        }, config), !config.autoLoad);
    }

    t.it('Assert Project model fields and properties', function (t) {

        var project = Ext.create('Gnt.model.Project', t.getProject('Foo'));

        t.is(project.getName(), 'Foo', 'Project has correct name');
        t.is(project.getDescription(), 'Foo description', 'Project has correct description');

        t.notOk(project.getReadOnly(), 'Project is editable');

        project.setReadOnly(true);
        t.ok(project.getReadOnly(), 'Project is not editable');
        t.ok(project.isEditable('ReadOnly'), 'Readonly field is editable');

        t.notOk(project.isEditable('ManuallyScheduled'), 'Non project field is not editable');
        t.notOk(project.getAllowDependencies(), 'Project does not allow dependencies');

        t.notOk(project.getProject(), 'Project doesnot have an upper level project');

    });

    t.it('taskStore loads project models', function (t) {

        t.it('taskStore loads Gnt.model.Project by default', function (t) {

            var store       = getTaskStore({
                autoLoad    : true,
                model       : 'Foo.Task',
                DATA        : t.getProjectData(1)
            });

            t.is(store.getNodeById('Project_0').self, Gnt.model.Project, 'project class is correct');
            t.isInstanceOf(store.getNodeById('Project_0_task_1'), Foo.Task, 'childtask class is correct');
            t.isInstanceOf(store.getNodeById('Project_0_task_2'), Foo.Task, 'childtask class is correct');
        });

    });

    t.it('Sync heterogenous taskstore', function (t) {

        var store       = getTaskStore({
            listeners   : {
                update : function (store, record, operation) {
                    if (operation === Ext.data.Model.COMMIT) {
                        store.fireEvent('testupdate');
                    }
                },
                write : function (store, operation) {
                    store.fireEvent('testwrite');

                    var records = operation.getRecords();
                    t.is(records.length, 2, 'Operation contains 2 records');
                    t.isInstanceOf(records[0], Gnt.model.Project, 'project task is project');
                    t.isInstanceOf(records[1], Gnt.model.Task, 'childtask is task');
                }
            }
        });

        t.willFireNTimes(store, 'testupdate', 2, 'Store fires two updates');
        t.firesOnce(store, 'testwrite', 'Store writes data once');

        store.load();

        var project = store.getById('Project_0');
        project.set('Name', 'ChangedProject');

        var task = store.getById('Project_0_task_1');
        task.set('Name', 'ChangedTask');

        store.sync();

    });

    t.it('Assert allowed dependencies', function (t) {
        var taskStore       = getTaskStore({
            autoLoad        : true,
            noOfProjects    : 2
        });

        var depStore    = taskStore.getDependencyStore(),
            project1    = taskStore.getNodeById('Project_0'),
            project2    = taskStore.getNodeById('Project_1'),
            task1       = taskStore.getNodeById('Project_0_task_1'),
            task2       = taskStore.getNodeById('Project_1_task_1');

        t.notOk(depStore.isValidDependency(project1.getId(), project2.getId()), 'Dependencies between projects are invalid');
        t.notOk(depStore.isValidDependency(task1.getId(), task2.getId()), 'Dependencies between tasks from different projects are invalid');

        project1.setAllowDependencies(true);
        project2.setAllowDependencies(true);

        t.notOk(depStore.isValidDependency(project1.getId(), project2.getId()), 'Dependencies between projects are invalid');
        t.ok(depStore.isValidDependency(task1.getId(), task2.getId()), 'Dependencies between tasks from different projects were allowed');
    });


    t.it('Assert projects are transformed into tasks when not placed under root', function (t) {

        var store       = getTaskStore({
            model       : 'Foo.Task',
            autoLoad    : true
        });

        store.getRoot().appendChild({
            Id          : 'Foo1',
            TaskType    : 'Gnt.model.Project'
        });

        var project = store.getNodeById('Foo1');
        t.isInstanceOf(project, Gnt.model.Project, 'Project is project under root');

        project.appendChild({
            Id          : 'FooChild',
            TaskType    : 'Gnt.model.Project'
        });

        t.notOk(store.getNodeById('FooChild'), 'Cannot append a project under other project');

        project.appendChild(new Gnt.model.Project({
            Id : 'FooChild2'
        }));

        t.notOk(store.getNodeById('FooChild2'), 'Cannot append a project under other project');

        project.appendChild({
            Id          : 'FooTask'
        });

        t.ok(store.getNodeById('FooTask'), 'appends a task under a project');

        store.getNodeById('FooTask').appendChild({
            Id          : 'FooChild',
            TaskType    : 'Gnt.model.Project'
        });

        t.notOk(store.getNodeById('FooChild'), 'Cannot append a project under a task');
    });

    t.it('Assert that readonly project makes subtask isEditable to return false', function (t) {

        var store           = getTaskStore({
            autoLoad        : true,
            noOfProjects    : 2
        });

        store.getNodeById('Project_0').setReadOnly(true);

        t.notOk(store.getNodeById('Project_0_task_1').isEditable('Name'), 'Task field in readonly project is not editable');
        t.ok(store.getNodeById('Project_1_task_1').isEditable('Name'), 'Task field in editable project is editable')
    })

});
