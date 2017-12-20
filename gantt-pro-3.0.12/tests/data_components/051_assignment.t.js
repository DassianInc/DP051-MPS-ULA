StartTest(function (t) {

    // Here we check the following scenario (#1885):
    // 1) make a phantom assignment to a phantom task
    // 2) update the task w/ real Id
    // 3) update the assignment w/ the proper task Id
    // 4) ensure that the task assignments cache is in a proper state
    t.it('Updating a phantom assignment for a phantom task gets reflected in assignments cache', function (t) {
        var resourceStore   = new Gnt.data.ResourceStore({
            data : [
                { Id : 1, Name : "Mats" }
            ]
        });

        var assignmentStore = new Gnt.data.AssignmentStore({ data : [] });

        var taskStore       = t.getTaskStore({
            DATA            : [],
            resourceStore   : resourceStore,
            assignmentStore : assignmentStore
        });

        var task        = taskStore.getRootNode().appendChild({}),
            assignment,
            getRangeSpy;

        getRangeSpy = t.spyOn(taskStore.getAssignmentStore(), 'getRange').and.callThrough();

        // Assignment store will be iterated twice during this call
        // - by event assignments cache get() method
        // - by resource assignments cache get() method
        task.assign(resourceStore.getAt(0));

        t.expect(getRangeSpy).toHaveBeenCalled(2);

        assignment  = assignmentStore.getAt(0);

        // Assignment store will be iterated once more during this call
        // - by event assignments cache when cache will be searching for all assignments for event with id == 1
        task.setId(1);
        //assignment.setTaskId(1); - this will be done by IdConsistencyManager

        t.isDeeply(task.getAssignments(), [ assignment ], 'task has proper assignments');
        t.expect(getRangeSpy).toHaveBeenCalled("<=3");
    });

    t.it('Reassign should also copy units value', function (t) {
        var resourceStore = new Gnt.data.ResourceStore({
            data    : [
                { Id : 1, Name : 'Albert' },
                { Id : 2, Name : 'Ben' }
            ]
        });

        var assignmentStore = new Gnt.data.AssignmentStore();

        var taskStore = t.getTaskStore({
            resourceStore : resourceStore,
            assignmentStore : assignmentStore
        });

        var task = taskStore.getRoot().firstChild;

        resourceStore.first().assignTo(task, 37);

        t.is(assignmentStore.first().getTask(), task, 'Task is correct');
        t.is(assignmentStore.first().getResource(), resourceStore.first(), 'Resource is correct');
        t.is(assignmentStore.first().getUnits(), '37', 'Correct units value');

        task.reassign(resourceStore.first(), resourceStore.last());

        t.is(assignmentStore.first().getTask(), task, 'Task is correct');
        t.is(assignmentStore.first().getResource(), resourceStore.last(), 'Resource is correct');
        t.is(assignmentStore.first().getUnits(), '37', 'Correct units value');

    });
});
