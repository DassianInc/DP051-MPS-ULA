StartTest(function(t) {
        
    var taskStore = t.getTaskStore(),
        dependencyStore = t.getDependencyStore({taskStore: taskStore}),
        newDependency,
        task1, 
        task2;

    taskStore.setDependencyStore(dependencyStore);

    ////////////////////////////////////////////////////////////////////////////////////////
    t.diag('Testing that parent nodes are moved along with their children after a cascade'); 

    t.is(taskStore.cascadeChanges, true, 'Cascade changes set');

    taskStore.getNodeById(120).setStartDate(new Date(1264982400000));

    newDependency = new Ext.create('Gnt.model.Dependency', {});
    newDependency.setSourceId(120);
    newDependency.setTargetId(114);
    newDependency.setType(2);

    dependencyStore.add(newDependency);

    task1 = taskStore.getNodeById(114);
    task2 = taskStore.getNodeById(116);

    t.todo(function(t) {
        t.isDateEqual(task1.getEndDate(), task2.getEndDate(), 'Parent and children end dates are equal');    
    });
});   
