StartTest(function (t) {

    var resourceStore = new Gnt.data.ResourceStore({
        data : [
            {"Id" : 1, "Name" : "Mats" }
        ]
    });

    var assignmentStore = Ext.create("Gnt.data.AssignmentStore", {
        data : [

        ]
    });

    var taskStore = t.getTaskStore({
        resourceStore   : resourceStore,
        assignmentStore : assignmentStore
    });

    var task = taskStore.getRootNode().firstChild;
    var resource = resourceStore.first();

    t.is(assignmentStore.getCount(), 0, 'AssignmentStore should be empty')

    resource.assignTo(task);
    t.is(assignmentStore.getCount(), 1, 'AssignmentStore should be contain 1 entry after 1 assignment')
    t.is(assignmentStore.first().getTask(), task, 'Should be able to lookup task using getTask method')
    t.is(assignmentStore.first().getUnits(), 100, 'Should be assigned 100 % if no units are defined')
    t.ok(assignmentStore.first().isPersistable(), 'Should be able to save assignment linked to normal task')

    resource.unassignFrom(task);

    t.is(assignmentStore.getCount(), 0, 'AssignmentStore should be contain no entry after unassignment')

    resource.assignTo(task, 40);
    t.is(assignmentStore.first().getUnits(), 40, 'Should be assigned 40 %')
    resource.unassignFrom(task);

    var phantomTask = new taskStore.model();
    taskStore.getRootNode().appendChild(phantomTask);

    resource.assignTo(phantomTask);
    t.is(assignmentStore.first().getTask(), phantomTask, 'Should be able to lookup phantom task using getTask method')
    t.notOk(assignmentStore.first().isPersistable(), 'Should not be able to save assignment linked to phantom task')

    resource.unassignFrom(phantomTask);

    t.it('Removing a single resource record should clear its assignments', function (t) {

        taskStore.setRootNode({
            children : [
                { Id : 1 },
                { Id : 2 },
                { Id : 3 }
            ]
        });

        resourceStore.loadData(
            [
                { Id : 1 },
                { Id : 2 },
                { Id : 3 }
            ]
        );

        assignmentStore.loadData(
            [
                { ResourceId : 1, TaskId : 1, Units : 50 },
                { ResourceId : 1, TaskId : 2, Units : 50 },
                { ResourceId : 2, TaskId : 1, Units : 50 }
            ]
        )

        resourceStore.removeAt(0);

        t.is(assignmentStore.getCount(), 1, 'Assignment store reacted to resource remove')
        t.is(assignmentStore.first().getResourceId(), 2, 'Assignment store reacted to resource remove #2')
    });
})
