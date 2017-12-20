StartTest(function(t) {

    // Here we check if cascade changes are applied to task when we switch task scheduling mode from 'Manual'

    var resourceStore   = t.getResourceStore();

    var calendar        = t.getBusinessTimeCalendar();

    var assignmentStore = t.getAssignmentStore();

    var dependencyStore   = t.getDependencyStore({
        data : [{ From : 1, To : 2, Id : 1, Type : 2 }]
    });

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
                Name            : 'Task1',
                StartDate       : new Date(2011, 6, 25, 8),
                Duration        : 3,
                SchedulingMode  : 'Normal'
            },
            {
                Id              : 2,
                leaf            : true,
                Name            : 'Task2',
                StartDate       : new Date(2011, 6, 28, 8),
                Duration        : 2,
                SchedulingMode  : 'Normal'
            }
        ]
    });

    var task1 = taskStore.getNodeById(1);
    var task2 = taskStore.getNodeById(2);

    t.diag('Change Task 2 scheduling mode to Manual');
    task2.setManuallyScheduled(true);

    t.diag('Change Task 2 start date to 2011-7-18');
    task2.setStartDate(new Date(2011, 6, 18, 8));

    t.diag('Change Task 2 scheduling mode back to Normal');
    task2.setManuallyScheduled(false);

    t.is(task2.getStartDate(), new Date(2011, 6, 28, 8), 'Start date restored to proper value');
});
