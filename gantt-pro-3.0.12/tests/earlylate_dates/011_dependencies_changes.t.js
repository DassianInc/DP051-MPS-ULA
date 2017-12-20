StartTest(function (t) {

    var getTaskStore = function (taskData, dependencyData) {
        return new Gnt.data.TaskStore({
            // test was written with assumption of `cascadeChanges` : false
            cascadeChanges  : false,
            cascadeDelay   : 0,

            root : {
                expanded : true,
                children : taskData
            },
            proxy : 'memory',
            dependencyStore : new Gnt.data.DependencyStore({
                data : dependencyData
            })
        });
    };

    var taskStore = getTaskStore([
        { leaf : true, Id : 1, StartDate : new Date(2010, 1, 3), Duration : 2 },
        { leaf : true, Id : 2, StartDate : new Date(2010, 1, 4), Duration : 3 },
        { leaf : true, Id : 3, StartDate : new Date(2010, 1, 12), Duration : 4 },
        { leaf : true, Id : 4, StartDate : new Date(2010, 1, 4), Duration : 2 },
        { leaf : true, Id : 5, StartDate : new Date(2010, 1, 11), Duration : 1 }
    ], [
        { Id : 1, From : 1, To : 2, Type : 2, Lag : 2 },
        { Id : 2, From : 2, To : 3, Type : 2, Lag : 2 },
        { Id : 3, From : 4, To : 2, Type : 2, Lag : 0 }
    ]);

    var depStore = taskStore.getDependencyStore();
    var task2 = taskStore.getNodeById(2);
    var task3 = taskStore.getNodeById(3);

    t.it('Dependency removing should affect early/late dates', function (t) {

        t.is(task2.getEarlyStartDate(), new Date(2010, 1, 9), 'task 2: Correct early start date');
        t.is(task2.getEarlyEndDate(), new Date(2010, 1, 12), 'task 2: Correct early end date');
        t.is(task2.getLateStartDate(), new Date(2010, 1, 5), 'task 2: Correct late start date');
        t.is(task2.getLateEndDate(), new Date(2010, 1, 10), 'task 2: Correct late end date');

        t.is(task3.getEarlyStartDate(), new Date(2010, 1, 16), 'task 3: Correct early start date');
        t.is(task3.getEarlyEndDate(), new Date(2010, 1, 20), 'task 3: Correct early end date');
        t.is(task3.getLateStartDate(), new Date(2010, 1, 12), 'task 3: Correct late start date');
        t.is(task3.getLateEndDate(), new Date(2010, 1, 18), 'task 3: Correct late end date');

        t.diag('Removing dependency 1 -> 2');

        depStore.remove(depStore.getById(1));

        t.is(task2.getEarlyStartDate(), new Date(2010, 1, 8), 'task 2: Correct early start date');
        t.is(task2.getEarlyEndDate(), new Date(2010, 1, 11), 'task 2: Correct early end date');
        t.is(task2.getLateStartDate(), new Date(2010, 1, 5), 'task 2: Correct late start date');
        t.is(task2.getLateEndDate(), new Date(2010, 1, 10), 'task 2: Correct late end date');

        t.is(task3.getEarlyStartDate(), new Date(2010, 1, 15), 'task 3: Correct early start date');
        t.is(task3.getEarlyEndDate(), new Date(2010, 1, 19), 'task 3: Correct early end date');
        t.is(task3.getLateStartDate(), new Date(2010, 1, 12), 'task 3: Correct late start date');
        t.is(task3.getLateEndDate(), new Date(2010, 1, 18), 'task 3: Correct late end date');

        t.diag('Removing dependency 2 -> 3');

        depStore.remove(depStore.getById(2));

        t.is(task2.getEarlyStartDate(), new Date(2010, 1, 8), 'task 2: Correct early start date');
        t.is(task2.getEarlyEndDate(), new Date(2010, 1, 11), 'task 2: Correct early end date');
        t.is(task2.getLateStartDate(), new Date(2010, 1, 15), 'task 2: Correct late start date');
        t.is(task2.getLateEndDate(), new Date(2010, 1, 18), 'task 2: Correct late end date');

        t.is(task3.getEarlyStartDate(), new Date(2010, 1, 12), 'task 3: Correct early start date');
        t.is(task3.getEarlyEndDate(), new Date(2010, 1, 18), 'task 3: Correct early end date');
        t.is(task3.getLateStartDate(), new Date(2010, 1, 12), 'task 3: Correct late start date');
        t.is(task3.getLateEndDate(), new Date(2010, 1, 18), 'task 3: Correct late end date');
    });

    t.it('Dependency inserting should affect early/late dates', function (t) {

        t.diag('Inserting dependency 2 -> 3 back');

        depStore.add({ Id : 2, From : 2, To : 3, Type : 2, Lag : 2 });

        t.is(task2.getEarlyStartDate(), new Date(2010, 1, 8), 'task 2: Correct early start date');
        t.is(task2.getEarlyEndDate(), new Date(2010, 1, 11), 'task 2: Correct early end date');
        t.is(task2.getLateStartDate(), new Date(2010, 1, 5), 'task 2: Correct late start date');
        t.is(task2.getLateEndDate(), new Date(2010, 1, 10), 'task 2: Correct late end date');

        t.is(task3.getEarlyStartDate(), new Date(2010, 1, 15), 'task 3: Correct early start date');
        t.is(task3.getEarlyEndDate(), new Date(2010, 1, 19), 'task 3: Correct early end date');
        t.is(task3.getLateStartDate(), new Date(2010, 1, 12), 'task 3: Correct late start date');
        t.is(task3.getLateEndDate(), new Date(2010, 1, 18), 'task 3: Correct late end date');
    });

    t.it('Dependency updating should affect early/late dates', function (t) {

        t.diag('Updating dependency 2 -> 3');

        depStore.getById(2).setLag(3);

        t.is(task2.getEarlyStartDate(), new Date(2010, 1, 8), 'task 2: Correct early start date');
        t.is(task2.getEarlyEndDate(), new Date(2010, 1, 11), 'task 2: Correct early end date');
        t.is(task2.getLateStartDate(), new Date(2010, 1, 4), 'task 2: Correct late start date');
        t.is(task2.getLateEndDate(), new Date(2010, 1, 9), 'task 2: Correct late end date');

        t.is(task3.getEarlyStartDate(), new Date(2010, 1, 16), 'task 3: Correct early start date');
        t.is(task3.getEarlyEndDate(), new Date(2010, 1, 20), 'task 3: Correct early end date');
        t.is(task3.getLateStartDate(), new Date(2010, 1, 12), 'task 3: Correct late start date');
        t.is(task3.getLateEndDate(), new Date(2010, 1, 18), 'task 3: Correct late end date');
    });
});
