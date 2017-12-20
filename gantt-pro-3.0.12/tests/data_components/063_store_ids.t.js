StartTest(function(t) {
    Ext.create('Gnt.data.TaskStore', {
        storeId : 'task',
        root : {    
        }
    }); 

    Ext.create('Gnt.data.DependencyStore', {
        storeId : 'dependency'
    }); 

    Ext.create('Gnt.data.ResourceStore', {
        storeId : 'resource'
    }); 

    Ext.create('Gnt.data.AssignmentStore', {
        storeId : 'assignment'
    }); 
    
    t.livesOk(function() {
        var p = t.getGantt({
            taskStore : 'task',
            assignmentStore : 'assignment',
            dependencyStore : 'dependency',
            resourceStore : 'resource'
        }); 
    
        t.ok(p.getTaskStore() instanceof Gnt.data.TaskStore, 'Task store initialized ok');   
        t.ok(p.getResourceStore() instanceof Gnt.data.ResourceStore, 'Resource store initialized ok');   
        t.ok(p.getDependencyStore() instanceof Gnt.data.DependencyStore, 'Dependency store initialized ok');   
        t.ok(p.getAssignmentStore() instanceof Gnt.data.AssignmentStore, 'Assignment store initialized ok');   
    }, 'Gantt instantiated ok');
})    
