StartTest(function(t) {

    // Here we test Gnt.data.CrudManager class

    var someStore1 = Ext.create('Ext.data.Store', { fields : [], proxy : { type : 'memory' }}),
        someStore2 = Ext.create('Ext.data.Store', { fields : [], proxy : { type : 'memory' }});

    t.it('Constructor puts gantt specific stores in a proper order', function (t) {

        var crud = Ext.create('Gnt.data.CrudManager', {
            autoLoad        : true,
            resourceStore   : t.getResourceStore(),
            assignmentStore : t.getAssignmentStore(),
            dependencyStore : t.getDependencyStore(),
            taskStore       : t.getTaskStore(),
            stores          : [
                { store : someStore1, storeId : 'smth1' },
                { store : someStore2, storeId : 'smth2' }
            ],

            listeners : {
                beforeload  : function () {
                    t.is(this.stores.length, 6, 'correct stores list length');
                    return false;
                }
            }
        });

        t.is(crud.stores.length, 6, 'correct stores list length');

        t.is(crud.stores[0].storeId, 'smth1', 'correct 0 store');
        t.is(crud.stores[1].storeId, 'smth2', 'correct 1 store');
        t.is(crud.stores[2].storeId, 'resources', 'correct 2 store');
        t.is(crud.stores[3].storeId, 'assignments', 'correct 3 store');
        t.is(crud.stores[4].storeId, 'dependencies', 'correct 4 store');
        t.is(crud.stores[5].storeId, 'tasks', 'correct 5 store');

    });

    t.it('Constructor takes gantt specific stores from a TaskStore instance', function (t) {

        var taskStore = t.getTaskStore({
            resourceStore   : t.getResourceStore(),
            assignmentStore : t.getAssignmentStore(),
            dependencyStore : t.getDependencyStore()
        });

        var crud = Ext.create('Gnt.data.CrudManager', {
            autoLoad        : true,
            taskStore       : taskStore,
            stores          : [
                { store : someStore1, storeId : 'smth1' },
                { store : someStore2, storeId : 'smth2' }
            ],

            listeners : {
                beforeload  : function () {
                    t.is(this.stores.length, 6, 'correct stores list length');
                    return false;
                }
            }
        });

        t.is(crud.stores.length, 6, 'correct stores list length');

        t.is(crud.stores[0].storeId, 'smth1', 'correct 0 store');
        t.is(crud.stores[1].storeId, 'smth2', 'correct 1 store');
        t.is(crud.stores[2].storeId, 'resources', 'correct 2 store');
        t.is(crud.stores[3].storeId, 'assignments', 'correct 3 store');
        t.is(crud.stores[4].storeId, 'dependencies', 'correct 4 store');
        t.is(crud.stores[5].storeId, 'tasks', 'correct 5 store');

    });
});
