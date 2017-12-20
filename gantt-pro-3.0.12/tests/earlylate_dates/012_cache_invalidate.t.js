StartTest(function (t) {

    var getTaskStore = function (taskData, dependencyData) {
        return new Gnt.data.TaskStore({
            // test was written with assumption of `cascadeChanges` : false
            cascadeChanges  : false,
            cascadeDelay    : 0,

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
        { leaf : true, Id : 4, StartDate : new Date(2010, 1, 4), Duration : 2 },
            { leaf : true, Id : 2, StartDate : new Date(2010, 1, 15), Duration : 3 },
                { leaf : true, Id : 3, StartDate : new Date(2010, 1, 15), Duration : 4 },
        { leaf : true, Id : 5, StartDate : new Date(2010, 1, 11), Duration : 1 }
    ], [
        { From : 1, To : 2, Type : 2, Lag : 2 },
        { From : 2, To : 3, Type : 2, Lag : -1 },
        { From : 4, To : 2, Type : 2, Lag : 0 }
    ]);

    var task1 = taskStore.getNodeById(1);
    var task2 = taskStore.getNodeById(2);
    var task3 = taskStore.getNodeById(3);
    var task4 = taskStore.getNodeById(4);
    var task5 = taskStore.getNodeById(5);

    t.it('Initial set of tasks', function (t) {
        t.diag("Task 1");
        t.is(task1.getEarlyStartDate(), new Date(2010, 1, 3), "Early Start Date is correct");
        t.is(task1.getEarlyEndDate(), new Date(2010, 1, 5), "Early End Date is correct");
        t.is(task1.getLateStartDate(), new Date(2010, 1, 5), "Late Start Date is correct");
        t.is(task1.getLateEndDate(), new Date(2010, 1, 9), "Late End Date is correct");
        t.is(task1.getSlack(), 2, "slack is 2");

        t.diag("Task 2");
        t.is(task2.getEarlyStartDate(), new Date(2010, 1, 9), "Early Start Date is correct");
        t.is(task2.getEarlyEndDate(), new Date(2010, 1, 12), "Early End Date is correct");
        t.is(task2.getLateStartDate(), new Date(2010, 1, 11), "Late Start Date is correct");
        t.is(task2.getLateEndDate(), new Date(2010, 1, 16), "Late End Date is correct");
        t.is(task2.getSlack(), 2, "slack is 2");

        t.diag("Task 3");
        t.is(task3.getEarlyStartDate(), new Date(2010, 1, 11), "Early Start Date is correct");
        t.is(task3.getEarlyEndDate(), new Date(2010, 1, 17), "Early End Date is correct");
        t.is(task3.getLateStartDate(), new Date(2010, 1, 15), "Late Start Date is correct");
        t.is(task3.getLateEndDate(), new Date(2010, 1, 19), "Late End Date is correct");
        t.is(task3.getSlack(), 2, "slack is 2");

        t.diag("Task 4");
        t.is(task4.getEarlyStartDate(), new Date(2010, 1, 4), "Early Start Date is correct");
        t.is(task4.getEarlyEndDate(), new Date(2010, 1, 6), "Early End Date is correct");
        t.is(task4.getLateStartDate(), new Date(2010, 1, 9), "Late Start Date is correct");
        t.is(task4.getLateEndDate(), new Date(2010, 1, 11), "Late End Date is correct");
        t.is(task4.getSlack(), 3, "slack is 3");

        t.diag("Task 5");
        t.is(task5.getEarlyStartDate(), new Date(2010, 1, 11), "Early Start Date is correct");
        t.is(task5.getEarlyEndDate(), new Date(2010, 1, 12), "Early End Date is correct");
        t.is(task5.getLateStartDate(), new Date(2010, 1, 18), "Late Start Date is correct");
        t.is(task5.getLateEndDate(), new Date(2010, 1, 19), "Late End Date is correct");
        t.is(task5.getSlack(), 5, "slack is zero");
    });

    t.it('Refreshing cache on latest task change', function(t) {
        task2.setStartDate(new Date(2010, 1, 19));

        t.diag("Task 3");
        t.is(task3.getEarlyStartDate(), new Date(2010, 1, 11), "Early Start Date is correct");
        t.is(task3.getEarlyEndDate(), new Date(2010, 1, 17), "Early End Date is correct");
        t.is(task3.getLateStartDate(), new Date(2010, 1, 18), "Late Start Date is correct");
        t.is(task3.getLateEndDate(), new Date(2010, 1, 24), "Late End Date is correct");

        t.diag("Task 2");
        t.is(task2.getEarlyStartDate(), new Date(2010, 1, 9), "Early Start Date is correct");
        t.is(task2.getEarlyEndDate(), new Date(2010, 1, 12), "Early End Date is correct");
        t.is(task2.getLateStartDate(), new Date(2010, 1, 16), "Late Start Date is correct");
        t.is(task2.getLateEndDate(), new Date(2010, 1, 19), "Late End Date is correct");

        t.diag("Task 4");
        t.is(task4.getEarlyStartDate(), new Date(2010, 1, 4), "Early Start Date is correct");
        t.is(task4.getEarlyEndDate(), new Date(2010, 1, 6), "Early End Date is correct");
        t.is(task4.getLateStartDate(), new Date(2010, 1, 12), "Late Start Date is correct");
        t.is(task4.getLateEndDate(), new Date(2010, 1, 16), "Late End Date is correct");

        t.diag("Task 1");
        t.is(task1.getEarlyStartDate(), new Date(2010, 1, 3), "Early Start Date is correct");
        t.is(task1.getEarlyEndDate(), new Date(2010, 1, 5), "Early End Date is correct");
        t.is(task1.getLateStartDate(), new Date(2010, 1, 10), "Late Start Date is correct");
        t.is(task1.getLateEndDate(), new Date(2010, 1, 12), "Late End Date is correct");

        t.diag("Task 5");
        t.is(task5.getEarlyStartDate(), new Date(2010, 1, 11), "Early Start Date is correct");
        t.is(task5.getEarlyEndDate(), new Date(2010, 1, 12), "Early End Date is correct");
        t.is(task5.getLateStartDate(), new Date(2010, 1, 23), "Late Start Date is correct");
        t.is(task5.getLateEndDate(), new Date(2010, 1, 24), "Late End Date is correct");
    });

    t.it('Refreshing cache on earliest task change', function(t) {
        task1.setStartDate(new Date(2010, 1, 5));

        t.diag("Task 1");
        t.is(task1.getEarlyStartDate(), new Date(2010, 1, 5), "Early Start Date is correct");
        t.is(task1.getEarlyEndDate(), new Date(2010, 1, 9), "Early End Date is correct");
        t.is(task1.getLateStartDate(), new Date(2010, 1, 10), "Late Start Date is correct");
        t.is(task1.getLateEndDate(), new Date(2010, 1, 12), "Late End Date is correct");

        t.diag("Task 4");
        t.is(task4.getEarlyStartDate(), new Date(2010, 1, 4), "Early Start Date is correct");
        t.is(task4.getEarlyEndDate(), new Date(2010, 1, 6), "Early End Date is correct");
        t.is(task4.getLateStartDate(), new Date(2010, 1, 12), "Late Start Date is correct");
        t.is(task4.getLateEndDate(), new Date(2010, 1, 16), "Late End Date is correct");

        t.diag("Task 2");
        t.is(task2.getEarlyStartDate(), new Date(2010, 1, 11), "Early Start Date is correct");
        t.is(task2.getEarlyEndDate(), new Date(2010, 1, 16), "Early End Date is correct");
        t.is(task2.getLateStartDate(), new Date(2010, 1, 16), "Late Start Date is correct");
        t.is(task2.getLateEndDate(), new Date(2010, 1, 19), "Late End Date is correct");

        t.diag("Task 3");
        t.is(task3.getEarlyStartDate(), new Date(2010, 1, 15), "Early Start Date is correct");
        t.is(task3.getEarlyEndDate(), new Date(2010, 1, 19), "Early End Date is correct");
        t.is(task3.getLateStartDate(), new Date(2010, 1, 18), "Late Start Date is correct");
        t.is(task3.getLateEndDate(), new Date(2010, 1, 24), "Late End Date is correct");

        t.diag("Task 5");
        t.is(task5.getEarlyStartDate(), new Date(2010, 1, 11), "Early Start Date is correct");
        t.is(task5.getEarlyEndDate(), new Date(2010, 1, 12), "Early End Date is correct");
        t.is(task5.getLateStartDate(), new Date(2010, 1, 23), "Late Start Date is correct");
        t.is(task5.getLateEndDate(), new Date(2010, 1, 24), "Late End Date is correct");
    });

    t.it('Refreshing cache on middle task duration change', function(t) {
        task2.setDuration(4);

        t.diag("Task 3");
        t.is(task3.getEarlyStartDate(), new Date(2010, 1, 16), "Early Start Date is correct");
        t.is(task3.getEarlyEndDate(), new Date(2010, 1, 20), "Early End Date is correct");
        t.is(task3.getLateStartDate(), new Date(2010, 1, 19), "Late Start Date is correct");
        t.is(task3.getLateEndDate(), new Date(2010, 1, 25), "Late End Date is correct");

        t.diag("Task 2");
        t.is(task2.getEarlyStartDate(), new Date(2010, 1, 11), "Early Start Date is correct");
        t.is(task2.getEarlyEndDate(), new Date(2010, 1, 17), "Early End Date is correct");
        t.is(task2.getLateStartDate(), new Date(2010, 1, 16), "Late Start Date is correct");
        t.is(task2.getLateEndDate(), new Date(2010, 1, 20), "Late End Date is correct");

        t.diag("Task 4");
        t.is(task4.getEarlyStartDate(), new Date(2010, 1, 4), "Early Start Date is correct");
        t.is(task4.getEarlyEndDate(), new Date(2010, 1, 6), "Early End Date is correct");
        t.is(task4.getLateStartDate(), new Date(2010, 1, 12), "Late Start Date is correct");
        t.is(task4.getLateEndDate(), new Date(2010, 1, 16), "Late End Date is correct");

        t.diag("Task 1");
        t.is(task1.getEarlyStartDate(), new Date(2010, 1, 5), "Early Start Date is correct");
        t.is(task1.getEarlyEndDate(), new Date(2010, 1, 9), "Early End Date is correct");
        t.is(task1.getLateStartDate(), new Date(2010, 1, 10), "Late Start Date is correct");
        t.is(task1.getLateEndDate(), new Date(2010, 1, 12), "Late End Date is correct");

        t.diag("Task 5");
        t.is(task5.getEarlyStartDate(), new Date(2010, 1, 11), "Early Start Date is correct");
        t.is(task5.getEarlyEndDate(), new Date(2010, 1, 12), "Early End Date is correct");
        t.is(task5.getLateStartDate(), new Date(2010, 1, 24), "Late Start Date is correct");
        t.is(task5.getLateEndDate(), new Date(2010, 1, 25), "Late End Date is correct");
    });

    t.it('Refreshing cache on middle task duration change', function(t) {
        // we change task 5 start date to set project end date to 25-Feb-2010
        task5.setStartDate(new Date(2010, 1, 24));

        task2.setDuration(1);

        t.diag("Task 3");
        t.is(task3.getEarlyStartDate(), new Date(2010, 1, 11), "Early Start Date is correct");
        t.is(task3.getEarlyEndDate(), new Date(2010, 1, 17), "Early End Date is correct");
        t.is(task3.getLateStartDate(), new Date(2010, 1, 19), "Late Start Date is correct");
        t.is(task3.getLateEndDate(), new Date(2010, 1, 25), "Late End Date is correct");

        t.diag("Task 2");
        t.is(task2.getEarlyStartDate(), new Date(2010, 1, 11), "Early Start Date is correct");
        t.is(task2.getEarlyEndDate(), new Date(2010, 1, 12), "Early End Date is correct");
        t.is(task2.getLateStartDate(), new Date(2010, 1, 19), "Late Start Date is correct");
        t.is(task2.getLateEndDate(), new Date(2010, 1, 20), "Late End Date is correct");

        t.diag("Task 4");
        t.is(task4.getEarlyStartDate(), new Date(2010, 1, 4), "Early Start Date is correct");
        t.is(task4.getEarlyEndDate(), new Date(2010, 1, 6), "Early End Date is correct");
        t.is(task4.getLateStartDate(), new Date(2010, 1, 17), "Late Start Date is correct");
        t.is(task4.getLateEndDate(), new Date(2010, 1, 19), "Late End Date is correct");

        t.diag("Task 1");
        t.is(task1.getEarlyStartDate(), new Date(2010, 1, 5), "Early Start Date is correct");
        t.is(task1.getEarlyEndDate(), new Date(2010, 1, 9), "Early End Date is correct");
        t.is(task1.getLateStartDate(), new Date(2010, 1, 15), "Late Start Date is correct");
        t.is(task1.getLateEndDate(), new Date(2010, 1, 17), "Late End Date is correct");

        t.diag("Task 5");
        t.is(task5.getEarlyStartDate(), new Date(2010, 1, 24), "Early Start Date is correct");
        t.is(task5.getEarlyEndDate(), new Date(2010, 1, 25), "Early End Date is correct");
        t.is(task5.getLateStartDate(), new Date(2010, 1, 24), "Late Start Date is correct");
        t.is(task5.getLateEndDate(), new Date(2010, 1, 25), "Late End Date is correct");
    });
});
