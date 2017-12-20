StartTest(function(t) {
    t.diag('When using autoSync, updating records during a sync operation should not attempt another sync');

    var dependencyStore = Ext.create("Gnt.data.DependencyStore");
    
    var taskStore = Ext.create("Gnt.data.TaskStore", {
        autoSync    : true,
        autoLoad    : false,
        
        proxy       : {
            type    : 'ajax',
            
            api     : {
                create  : 'data/crud/create-tasks.js',
                read    : 'data/crud/get-tasks.js'
            },
            reader  : {
                type    : 'json'
            }
        },
        
        root        : {
            expanded    : true
        }
    });
    
    t.getGantt({
        dependencyStore : dependencyStore,
        taskStore : taskStore,
        renderTo : Ext.getBody()
    });

    var originalData;
    
    t.chain(
        { waitForStoresToLoad : taskStore },

        function(next) {

            taskStore.on('beforesync', function(operations) {
                taskStore.on('beforesync', verify, null, { single : true });
                
                // Second add should trigger another sync action, including the first record which is not desirable
                taskStore.getRootNode().appendChild(new Gnt.model.Task({ Name : 'new' }));
            }, null, { single : true });

            // This add should trigger the sync method
            taskStore.getRootNode().appendChild(new Gnt.model.Task({ Name : 'old' }));
        }
    );

    function verify(operations) {
        t.is(operations.create.length, 1, '1 record to write');
        t.is(operations.create[0].getName(), 'new', 'Correct record found');
    }
})    
