StartTest(function(t) {
    
    var dependencyStore = Ext.create("Gnt.data.DependencyStore");
    
    var taskStore = Ext.create("Gnt.data.TaskStore", {
        // test was written with assumption of `cascadeChanges` : false
        cascadeChanges  : false,
        
        autoSync        : true,
        dependencyStore : dependencyStore,

        proxy       : {
            type    : 'ajax',
            
            api     : {
                create  : 'data/065_autosync_predecessor/create-tasks.js',
                read    : 'data/065_autosync_predecessor/get-tasks.js',
                update  : 'data/065_autosync_predecessor/update-tasks2.js'
            },
            reader  :'json'
        },
        
        root        : {
            expanded    : true
        }
    });

    t.waitForStoresToLoad(taskStore, function() {
        var first       = taskStore.getRootNode().firstChild;
        var nbrChildren = first.childNodes.length;
        var leaf        = first.firstChild;

        t.ok(leaf.isLeaf(), 'Task is a leaf');

        t.willFireNTimes(taskStore, 'beforesync', 1);

        // 1 write for creating the predecessor task, 1 write to update its parent end date
        t.willFireNTimes(taskStore, 'write', 2);
        var writes = 0;

        var as = t.beginAsync();
        taskStore.on('write', function() {
            writes++; 
            if (writes === 2) { evaluate(); }
        }, null, {delay : 100 });

        leaf.addPredecessor(new Gnt.model.Task({ Name : 'Foo' }));

        function evaluate() {
            t.endAsync(as);

            t.is(first.childNodes.length, nbrChildren+1, '1 child node added');
            t.is(dependencyStore.getCount(), 1, '1 record added to dependency store');

            // Server responds 'New task' => name
            t.is(first.firstChild.get('Name'), 'New task', 'New node has correct name');
            t.ok(first.firstChild.isLeaf(), 'New node is a leaf');

            t.is(first.getStartDate(), new Date(2010, 1, 3), 'Updated parent start date ok');
            t.is(first.getDuration(), 7, 'Updated parent duration ok');
        }
    });
})    
