StartTest(function(t) {

    // Here we check how start date of effort driven task changes when we add/remove assignments

    var resourceStore   = t.getResourceStore();

    var calendar        = t.getBusinessTimeCalendar();

    var assignmentStore = t.getAssignmentStore();

    var dependencyStore   = t.getDependencyStore();

    var taskStore = t.getTaskStore({
        resourceStore   : resourceStore,
        assignmentStore : assignmentStore,
        dependencyStore : dependencyStore,
        calendar        : calendar,
        cascadeChanges  : true,
        DATA            : [
            {
                Id              : 1,
                leaf            : true,
                Name            : "Task1",
                StartDate       : new Date(2011, 6, 25, 8),
                Effort          : 16,
                SchedulingMode  : 'EffortDriven'
            },
            {
                Id              : 2,
                leaf            : true,
                Name            : "Task2",
                StartDate       : new Date(2011, 6, 25, 8),
                Effort          : 16,
                SchedulingMode  : 'EffortDriven'
            }
        ]
    });

    var task1 = taskStore.getNodeById(1);
    var task2 = taskStore.getNodeById(2);

    t.diag('Assign resource to Task 1');

    assignmentStore.add({ Id: 'a1', ResourceId: 'r1', TaskId : 1, Units : 100 });

    t.is(task1.getEndDate(), new Date(2011, 6, 26, 17), 'Task 1 end date is correct');

    t.diag('Make dependency between tasks');

    dependencyStore.add({ Id: 1, From: 1, To: 2, Type: 2 });

    t.is(task2.getStartDate(), task1.getEndDate(), 'Task 2 start date equals to Task 1 end date');
    t.is(task2.getEndDate(), task1.getEndDate(), 'Task 2 end date equals to Task 1 end date');
    t.ok(task2.isMilestone(), 'Task 2 is milestone');

    t.diag('Assign resource to Task 2');

    var added = assignmentStore.add({ Id: 'a2', ResourceId: 'r1', TaskId : 2, Units : 100 });

    t.is(task2.getStartDate(), new Date(2011, 6, 27, 8), 'Task 2 start date is correct');
    t.is(task2.getEndDate(), new Date(2011, 6, 28, 17), 'Task 2 end date is correct');
    t.notOk(task2.isMilestone(), 'Task 2 is not milestone');

    t.diag('Remove resource from Task 2');

    assignmentStore.remove(added);

    t.is(task2.getStartDate(), task1.getEndDate(), 'Task 2 start date equals to Task 1 end date');
    t.is(task2.getEndDate(), task1.getEndDate(), 'Task 2 end date equals to Task 1 end date');
    t.ok(task2.isMilestone(), 'Task 2 is milestone');

});
