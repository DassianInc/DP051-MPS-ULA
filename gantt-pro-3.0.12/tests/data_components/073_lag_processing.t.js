StartTest(function(t) {

    var taskStore   = t.getTaskStore({
        dependencyStore : t.getDependencyStore({
            data    : [
                {
                    From        : 1,
                    To          : 2,
                    Type        : 2,
                    Lag         : 2,
                    LagUnit     : 'd',
                    Id          : 'dep1'
                }
            ]
        }),
        calendar        : new Gnt.data.calendar.BusinessTime(),
        cascadeChanges  : true,
        DATA            : [
            {
                Id          : 1,
                leaf        : true,
                StartDate   : new Date(2010, 1, 1, 8),
                EndDate     : new Date(2010, 1, 2, 17)
            },
            {
                Id          : 2,
                leaf        : true,
                StartDate   : new Date(2010, 1, 5, 8),
                EndDate     : new Date(2010, 1, 8, 17)
            }
        ]
    });

    t.verifyCachedDependenciesState(taskStore);

    t.ok(taskStore.getRootNode().childNodes.length, 'There are some tasks');

    var task1 = taskStore.getNodeById(1);
    var task2 = taskStore.getNodeById(2);

    t.is(task1.getStartDate(), new Date(2010, 1, 1, 8), 'Correct start date for `task1`');
    t.is(task1.getEndDate(), new Date(2010, 1, 2, 17), 'Correct end date for `task1`');
    t.is(task2.getStartDate(), new Date(2010, 1, 5, 8), 'Correct start date for `task2`');
    t.is(task2.getEndDate(), new Date(2010, 1, 8, 17), 'Correct end date for `task2`');

    t.diag('Let`s insert new non-working day during dependency lag period');

    taskStore.calendar.add({ Date : '2010-02-03', Name : 'smth' });

    t.is(task1.getStartDate(), new Date(2010, 1, 1, 8), 'Correct start date for `task1`');
    t.is(task1.getEndDate(), new Date(2010, 1, 2, 17), 'Correct end date for `task1`');
    t.is(task2.getStartDate(), new Date(2010, 1, 8, 8), 'Correct start date for `task2`');
    t.is(task2.getEndDate(), new Date(2010, 1, 9, 17), 'Correct end date for `task2`');

});
