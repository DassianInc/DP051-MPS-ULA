StartTest(function(t) {
    
    t.diag('Setup')
    
    var dependencyStore = Ext.create("Gnt.data.DependencyStore");
    
    var taskStore = Ext.create("Gnt.data.TaskStore", {
        autoSync    : true,
        dependencyStore : dependencyStore,

        proxy       : {
            type    : 'ajax',
            
            api     : {
                create  : 'data/crud/create-tasks.js',
                read    : 'data/crud/get-tasks.js',
                update  : 'data/crud/update-tasks3.js',
                destroy : 'data/crud/delete-tasks.js'
            },
            reader  : {
                type    : 'json'
            }
        },
        
        root        : {
            expanded    : true
        }
    });

    t.waitForStoresToLoad(taskStore, function() {
        var first = taskStore.getRootNode().firstChild;
        var nbrChildren = first.childNodes.length;
        var leaf = first.lastChild;
        t.ok(leaf.isLeaf(), 'Task is a leaf');

        t.willFireNTimes(taskStore, 'beforesync', 2, 'Expect 1 sync call for add, one for remove');

        // 1 write for creating the successor task, 1 write to update its parent end date
        t.willFireNTimes(taskStore, 'write', 4, 'Expect 4 sync calls for add, parent update, node remove => causing parent to change again');
        var writes = 0;

        taskStore.on('write', evaluate);
        //taskStore.on('beforesync', function() { debugger; });

        leaf.addSubtask(new Gnt.model.Task({ Name : 'Foo', EndDate : new Date(2020, 1, 1) }));


        function evaluate() {
            writes++;

            if (writes === 4) {
                t.is(first.childNodes.length, nbrChildren-1, '1 child node removed');
            }

            if (writes === 2) {
                t.is(leaf.childNodes.length, 1, '1 child node added');
                
                // Server responds 'New task' => name
                t.is(leaf.firstChild.getId(), 122, 'New node has correct Id');
                t.is(leaf.firstChild.get('Name'), 'New task', 'New node has correct name');
                t.ok(leaf.firstChild.isLeaf(), 'New node is a leaf');
                
                leaf.remove();
            }
        }
    });
})    
