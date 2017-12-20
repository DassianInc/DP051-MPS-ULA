StartTest(function(t) {
    
    var taskStore = Ext.create("Gnt.data.TaskStore", {
        autoSync    : true,
        batchSync   : false,

        proxy       : {
            type    : 'ajax',
            
            api     : {
                create  : 'data/067_phantom_parent/create-parent.js',
                read    : 'data/067_phantom_parent/get-tasks.js'
            },
            reader  : 'json',
            writer  : {
                writeAllFields : false
            }
        },

        root        : {
            expanded    : true
        }
    });

    t.willFireNTimes(taskStore, 'beforesync', 2);

    // 1 write for creating the parent task, 1 write to create the child task
    t.willFireNTimes(taskStore, 'write', 2);

    var i = 0;

    t.waitForStoresToLoad(taskStore, function() {
        var root = taskStore.getRootNode();
        var newParent = new Gnt.model.Task({
            Name : 'Parent'
        });
        var newChild = new Gnt.model.Task({
            leaf : true,
            Name : 'Leaf'
        });

        taskStore.on('beforesync', function(hash) {
            if (i === 0) {
                t.diag('First request - parent task')
                t.is(hash.create.length, 1, 'Only 1 item found in "create" array');
                t.is(hash.create[0].data, newParent.data, 'Should find parent in "create" array');

            } else {
                taskStore.getProxy().api.create = 'data/067_phantom_parent/create-leaf.js';

                t.diag('Second request - child task')
                t.is(hash.create.length, 1, 'Only 1 items found in "create" array');
                t.is(hash.create[0].data, newChild.data, 'New child can now be persisted');
            }

            i++;
        });

        newParent.appendChild(newChild);
        root.appendChild(newParent);
    });
})    
