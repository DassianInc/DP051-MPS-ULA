StartTest(function(t) {

    var dependencyStore = Ext.create("Gnt.data.DependencyStore", {
        autoSync    : true,
        data : [
            { Id : 123, From : 1, To : 2, Type : 2 }
        ],
        proxy       : {
            type    : 'ajax',
            api : {
                create : 'create',
                read   : 'read',
                update : 'update',
                destroy: 'destroy'
            },
            reader  : {
                type    : 'json'
            }
        }
    });

    var taskStore = Ext.create("Gnt.data.TaskStore", {
        dependencyStore : dependencyStore,

        proxy       : {
            type    : 'memory',
            reader  : {
                type    : 'json'
            }
        },

        root        : {
            expanded    : false,

            children    : [
                {
                    Id          : 1,
                    leaf        : true,
                    StartDate   : new Date(2011, 6, 1),
                    EndDate     : new Date(2011, 6, 2)
                },
                {
                    Id          : 2,
                    leaf        : true,
                    StartDate   : new Date(2011, 6, 2),
                    EndDate     : new Date(2011, 6, 3)
                }
            ]
        }
    });

    t.isntCalled('create', dependencyStore.proxy, 'dependencyStore proxy create method not invoked');

    var task1 = taskStore.getRootNode().childNodes[0];
    var task2 = taskStore.getRootNode().childNodes[1];

    var newTask = new Gnt.model.Task();
    task1.addTaskAbove(newTask);

    var newDependency = new Gnt.model.Dependency();
    newDependency.setSourceTask(newTask);
    newDependency.setTargetTask(task1);
    dependencyStore.add(newDependency);

    t.notOk(newDependency.isPersistable(), 'dependency not persistable, one task is phantom');
    // This will trigger a sync "create" attempt which should not go through
    task2.remove();
})
