StartTest(function(t) {

    // Checks that CRUD manager supports stores defined on prototype level

    t.it('Gnt.data.CrudManager supports "stores" from prototype', function (t) {

        t.expectGlobal('TestCrudManager2');

        var resourceStore   = t.getResourceStore(),
            assignmentStore = t.getAssignmentStore({ resourceStore : resourceStore }),
            dependencyStore = t.getDependencyStore(),
            taskStore       = t.getTaskStore({
                resourceStore   : resourceStore,
                assignmentStore : assignmentStore,
                dependencyStore : dependencyStore
            }),
            fooStore        = t.getResourceStore({ storeId : 'foo' }),
            barStore        = t.getResourceStore({ storeId : 'bar' });

        Ext.define('TestCrudManager2', {
            extend          : 'Gnt.data.CrudManager',

            resourceStore   : 'resources',
            assignmentStore : 'assignments',
            dependencyStore : 'dependencies',
            taskStore       : 'tasks',

            stores          : ['foo', 'bar']
        });

        var crud    = Ext.create('TestCrudManager2');

        t.is(crud.stores.length, 6, 'proper number of stores');
        t.is(crud.getResourceStore(), resourceStore, 'resourceStore found');
        t.is(crud.getAssignmentStore(), assignmentStore, 'assignmentStore found');
        t.is(crud.getDependencyStore(), dependencyStore, 'dependencyStore found');
        t.is(crud.getTaskStore(), taskStore, 'taskStore found');
        t.is(crud.getStore('resources'), resourceStore, 'resourceStore found');
        t.is(crud.getStore('assignments'), assignmentStore, 'assignmentStore found');
        t.is(crud.getStore('dependencies'), dependencyStore, 'dependencyStore found');
        t.is(crud.getStore('tasks'), taskStore, 'taskStore found');
        t.is(crud.getStore('foo'), fooStore, 'fooStore found');
        t.is(crud.getStore('bar'), barStore, 'barStore found');
        t.is(crud.stores[0].store, fooStore, 'fooStore is 0th');
        t.is(crud.stores[1].store, barStore, 'barStore is 1st');
        t.is(crud.stores[2].store, resourceStore, 'correct 2 store');
        t.is(crud.stores[3].store, assignmentStore, 'correct 3 store');
        t.is(crud.stores[4].store, dependencyStore, 'correct 4 store');
        t.is(crud.stores[5].store, taskStore, 'correct 5 store');
    });
});
