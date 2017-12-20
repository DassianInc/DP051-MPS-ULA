StartTest(function(t) {
    
    //======================================================================================================================================================================================================================================================
    t.diag('Setup')
    
    var dependencyStore = Ext.create("Gnt.data.DependencyStore", {
        autoLoad    : true,
        
        proxy       : {
            type    : 'ajax',
            url     : 'data/crud/get-dependencies.json',
            method  : 'GET',
            reader  : {
                type    : 'json'
            }
        }
    });
    
    var taskStore = Ext.create("Gnt.data.TaskStore", {
        dependencyStore : dependencyStore,
        
        cascadeChanges  : true,
        cascadeDelay    : 0,
        
        autoSync    : false,
        autoLoad    : false,
        clearOnLoad : true,
        
        proxy       : {
            type    : 'ajax',
            
            api     : {
                create  : 'data/crud/create-tasks.js',
                read    : 'data/crud/get-tasks.js',
                update  : 'data/crud/update-tasks.js',
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

    var g = t.getGantt({
        taskStore           : taskStore,
        dependencyStore     : dependencyStore,
        renderTo            : Ext.getBody()
    });
    
    t.needDone  = true
    
    t.waitForStoresToLoad(taskStore, dependencyStore, function () {
        
        t.is(taskStore.getRootNode().childNodes.length,  5, '5 top-level tasks ')
        
        t.waitForEventsToRender(g, function () {
            t.done()
        })
    })
})    
