StartTest(function(t) {
    var dependencyStore = Ext.create("Gnt.data.DependencyStore");
    
    var taskStore = Ext.create("Gnt.data.TaskStore", {
        autoSync    : false,
        dependencyStore : dependencyStore,

        proxy       : {
            type    : 'ajax',
            
            api     : {
                create  : 'data/crud/create-tasks4.js'
            },
            reader  : {
                type    : 'json'
            }
        },
        
        root        : {
            expanded    : true,
            children    : []
        }
    });
    
    var root = taskStore.getRootNode();

    t.willFireNTimes(taskStore, 'beforesync', 1);

    t.willFireNTimes(taskStore, 'write', 1);
       
    var lvl0Parent = new Gnt.model.Task({ leaf : false });
    var lvl1Parent = new Gnt.model.Task({ leaf : false });
    var lvl2Child = new Gnt.model.Task({ leaf : true });

    taskStore.on('beforesync', function(hash) {
        t.is(hash.create.length, 3, '3 items found in "create" array');
    });

    taskStore.on('write',  function (store, operation) {
        t.is(operation.action, 'create', 'Create operation completed')
        t.is(operation.getRecords().length, 3, '3 records were created')
        t.is(taskStore.getNewRecords().length, 0, 'No new records after write')
    });

    lvl0Parent.appendChild(lvl1Parent);
    lvl1Parent.appendChild(lvl2Child);
    root.appendChild(lvl0Parent);
    
    t.ok(lvl0Parent.get('PhantomId'),       'PhantomId found in lvl0Parent');
    t.ok(lvl1Parent.get('PhantomId'),       'PhantomId found in lvl1Parent');
    t.ok(lvl1Parent.get('PhantomParentId'), 'PhantomParentId found in lvl1Parent');
    t.ok(lvl2Child.get('PhantomParentId'),  'PhantomParentId found in lvl2Child');
    t.is(lvl1Parent.get('PhantomParentId'), lvl0Parent.get('PhantomId'), 'PhantomParentId correctly set on lvl1Parent');

    taskStore.sync();
})    
