StartTest(function (t) {

    var getTaskStore = function (taskData, dependencyData) {
        return new Gnt.data.TaskStore({
            cascadeChanges : true,
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

    t.it('Simple sanity check', function (t) {
        var taskStore = getTaskStore([
            { leaf : true, Id : 1, StartDate : new Date(2010, 1, 3), Duration : 2 },
            { leaf : true, Id : 2, StartDate : new Date(2010, 1, 5), Duration : 2 }
        ], [ { From : 1, To : 2, Type : 2} ]);

        var task1 = taskStore.getNodeById(1);

        var task2 = taskStore.getNodeById(2);


        t.diag("Task 1");
        t.is(task1.getEarlyStartDate(), new Date(2010, 1, 3), "Early Start Date is correct");
        t.is(task1.getEarlyEndDate(), new Date(2010, 1, 5), "Early End Date is correct");
        t.is(task1.getLateStartDate(), new Date(2010, 1, 3), "Late Start Date is correct");
        t.is(task1.getLateEndDate(), new Date(2010, 1, 5), "Late End Date is correct");

        t.diag("Task 2");
        t.is(task2.getEarlyStartDate(), new Date(2010, 1, 5), "Early Start Date is correct");
        t.is(task2.getEarlyEndDate(), new Date(2010, 1, 9), "Early End Date is correct");
        t.is(task2.getLateStartDate(), new Date(2010, 1, 5), "Late Start Date is correct");
        t.is(task2.getLateEndDate(), new Date(2010, 1, 9), "Late End Date is correct");
    });

    t.it('Set 1. Critical path (3 tasks) + linked 1 side task + standalone task. End-To-Start dependencies', function (t) {
        var taskStore = getTaskStore([
            { leaf : true, Id : 1, StartDate : new Date(2010, 1, 3), Duration : 2 },
            { leaf : true, Id : 2, StartDate : new Date(2010, 1, 9), Duration : 3 },
            { leaf : true, Id : 3, StartDate : new Date(2010, 1, 11), Duration : 4 },
            { leaf : true, Id : 4, StartDate : new Date(2010, 1, 4), Duration : 2 },
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

        t.diag("Task 1");
        t.is(task1.getEarlyStartDate(), new Date(2010, 1, 3), "Early Start Date is correct");
        t.is(task1.getEarlyEndDate(), new Date(2010, 1, 5), "Early End Date is correct");
        t.is(task1.getLateStartDate(), new Date(2010, 1, 3), "Late Start Date is correct");
        t.is(task1.getLateEndDate(), new Date(2010, 1, 5), "Late End Date is correct");
        t.is(task1.getSlack(), 0, "slack is zero");

        t.diag("Task 2");
        t.is(task2.getEarlyStartDate(), new Date(2010, 1, 9), "Early Start Date is correct");
        t.is(task2.getEarlyEndDate(), new Date(2010, 1, 12), "Early End Date is correct");
        t.is(task2.getLateStartDate(), new Date(2010, 1, 9), "Late Start Date is correct");
        t.is(task2.getLateEndDate(), new Date(2010, 1, 12), "Late End Date is correct");
        t.is(task2.getSlack(), 0, "slack is zero");

        t.diag("Task 3");
        t.is(task3.getEarlyStartDate(), new Date(2010, 1, 11), "Early Start Date is correct");
        t.is(task3.getEarlyEndDate(), new Date(2010, 1, 17), "Early End Date is correct");
        t.is(task3.getLateStartDate(), new Date(2010, 1, 11), "Late Start Date is correct");
        t.is(task3.getLateEndDate(), new Date(2010, 1, 17), "Late End Date is correct");
        t.is(task3.getSlack(), 0, "slack is zero");

        t.diag("Task 4");
        t.is(task4.getEarlyStartDate(), new Date(2010, 1, 4), "Early Start Date is correct");
        t.is(task4.getEarlyEndDate(), new Date(2010, 1, 6), "Early End Date is correct");
        t.is(task4.getLateStartDate(), new Date(2010, 1, 5), "Late Start Date is correct");
        t.is(task4.getLateEndDate(), new Date(2010, 1, 9), "Late End Date is correct");
        t.is(task4.getSlack(), 1, "slack is 1");

        t.diag("Task 5");
        t.is(task5.getEarlyStartDate(), new Date(2010, 1, 11), "Early Start Date is correct");
        t.is(task5.getEarlyEndDate(), new Date(2010, 1, 12), "Early End Date is correct");
        t.is(task5.getLateStartDate(), new Date(2010, 1, 16), "Late Start Date is correct");
        t.is(task5.getLateEndDate(), new Date(2010, 1, 17), "Late End Date is correct");
        t.is(task5.getSlack(), 3, "slack is 3");
    });

    t.it('Set 2. Different types of dependencies', function (t) {
        var taskStore = getTaskStore([
            { leaf : true, Id : 1, StartDate : new Date(2010, 1, 3), Duration : 2 },
            { leaf : true, Id : 2, StartDate : new Date(2010, 1, 5), Duration : 3 },
            { leaf : true, Id : 3, StartDate : new Date(2010, 1, 8), Duration : 4 },
            { leaf : true, Id : 4, StartDate : new Date(2010, 1, 4), Duration : 2 },
            { leaf : true, Id : 5, StartDate : new Date(2010, 1, 8), Duration : 1 }
        ], [
            { From : 1, To : 2, Type : 0, Lag : 2 },
            { From : 2, To : 3, Type : 0, Lag : 1 },
            { From : 4, To : 2, Type : 3, Lag : 0 },
            { From : 4, To : 5, Type : 1, Lag : 0 }
        ]);

        var task1 = taskStore.getNodeById(1);
        var task2 = taskStore.getNodeById(2);
        var task3 = taskStore.getNodeById(3);
        var task4 = taskStore.getNodeById(4);
        var task5 = taskStore.getNodeById(5);

        t.diag("Task 1");
        t.is(task1.getEarlyStartDate(), new Date(2010, 1, 3), "Early Start Date is correct");
        t.is(task1.getEarlyEndDate(), new Date(2010, 1, 5), "Early End Date is correct");
        t.is(task1.getLateStartDate(), new Date(2010, 1, 3), "Late Start Date is correct");
        t.is(task1.getLateEndDate(), new Date(2010, 1, 5), "Late End Date is correct");
        t.is(task1.getSlack(), 0, "slack is zero");

        t.diag("Task 2");
        t.is(task2.getEarlyStartDate(), new Date(2010, 1, 5), "Early Start Date is correct");
        t.is(task2.getEarlyEndDate(), new Date(2010, 1, 10), "Early End Date is correct");
        t.is(task2.getLateStartDate(), new Date(2010, 1, 5), "Late Start Date is correct");
        t.is(task2.getLateEndDate(), new Date(2010, 1, 10), "Late End Date is correct");
        t.is(task2.getSlack(), 0, "slack is zero");

        t.diag("Task 3");
        t.is(task3.getEarlyStartDate(), new Date(2010, 1, 8), "Early Start Date is correct");
        t.is(task3.getEarlyEndDate(), new Date(2010, 1, 12), "Early End Date is correct");
        t.is(task3.getLateStartDate(), new Date(2010, 1, 8), "Late Start Date is correct");
        t.is(task3.getLateEndDate(), new Date(2010, 1, 12), "Late End Date is correct");
        t.is(task3.getSlack(), 0, "slack is zero");

        t.diag("Task 4");
        t.is(task4.getEarlyStartDate(), new Date(2010, 1, 4), "Early Start Date is correct");
        t.is(task4.getEarlyEndDate(), new Date(2010, 1, 6), "Early End Date is correct");
        t.is(task4.getLateStartDate(), new Date(2010, 1, 8), "Late Start Date is correct");
        t.is(task4.getLateEndDate(), new Date(2010, 1, 10), "Late End Date is correct");
        t.is(task4.getSlack(), 2, "slack is 2");

        t.diag("Task 5");
        t.is(task5.getEarlyStartDate(), new Date(2010, 1, 3), "Early Start Date is correct");
        t.is(task5.getEarlyEndDate(), new Date(2010, 1, 4), "Early End Date is correct");
        t.is(task5.getLateStartDate(), new Date(2010, 1, 11), "Late Start Date is correct");
        t.is(task5.getLateEndDate(), new Date(2010, 1, 12), "Late End Date is correct");
        t.is(task5.getSlack(), 6, "slack is 6");
    });

    t.it('Set 3. Different types of dependencies + Parent task', function (t) {
        var taskStore = getTaskStore([
            {
                Id : 1,
                StartDate : new Date(2010, 1, 3),
                children : [
                    { leaf : true, Id : 2, StartDate : new Date(2010, 1, 3), Duration : 2 },
                    { leaf : true, Id : 3, StartDate : new Date(2010, 1, 5), Duration : 3 },
                    { leaf : true, Id : 4, StartDate : new Date(2010, 1, 8), Duration : 4 },
                    { leaf : true, Id : 5, StartDate : new Date(2010, 1, 4), Duration : 2 },
                    { leaf : true, Id : 6, StartDate : new Date(2010, 1, 8), Duration : 1 }
                ]
            }
        ], [
            { From : 2, To : 3, Type : 0, Lag : 2 },
            { From : 3, To : 4, Type : 0, Lag : 1 },
            { From : 5, To : 3, Type : 3, Lag : 0 },
            { From : 5, To : 6, Type : 1, Lag : 0 }
        ]);

        var task1 = taskStore.getNodeById(1);
        var task2 = taskStore.getNodeById(2);
        var task3 = taskStore.getNodeById(3);
        var task4 = taskStore.getNodeById(4);
        var task5 = taskStore.getNodeById(5);
        var task6 = taskStore.getNodeById(6);

        t.diag("Task 1 (parent task)");
        t.is(task1.getEarlyStartDate(), new Date(2010, 1, 3), "Early Start Date is correct");
        t.is(task1.getEarlyEndDate(), new Date(2010, 1, 12), "Early End Date is correct");
        t.is(task1.getLateStartDate(), new Date(2010, 1, 3), "Late Start Date is correct");
        t.is(task1.getLateEndDate(), new Date(2010, 1, 12), "Late End Date is correct");
        t.is(task1.getSlack(), 0, "slack is zero");

        t.diag("Task 2");
        t.is(task2.getEarlyStartDate(), new Date(2010, 1, 3), "Early Start Date is correct");
        t.is(task2.getEarlyEndDate(), new Date(2010, 1, 5), "Early End Date is correct");
        t.is(task2.getLateStartDate(), new Date(2010, 1, 3), "Late Start Date is correct");
        t.is(task2.getLateEndDate(), new Date(2010, 1, 5), "Late End Date is correct");
        t.is(task2.getSlack(), 0, "slack is zero");

        t.diag("Task 3");
        t.is(task3.getEarlyStartDate(), new Date(2010, 1, 5), "Early Start Date is correct");
        t.is(task3.getEarlyEndDate(), new Date(2010, 1, 10), "Early End Date is correct");
        t.is(task3.getLateStartDate(), new Date(2010, 1, 5), "Late Start Date is correct");
        t.is(task3.getLateEndDate(), new Date(2010, 1, 10), "Late End Date is correct");
        t.is(task3.getSlack(), 0, "slack is zero");

        t.diag("Task 4");
        t.is(task4.getEarlyStartDate(), new Date(2010, 1, 8), "Early Start Date is correct");
        t.is(task4.getEarlyEndDate(), new Date(2010, 1, 12), "Early End Date is correct");
        t.is(task4.getLateStartDate(), new Date(2010, 1, 8), "Late Start Date is correct");
        t.is(task4.getLateEndDate(), new Date(2010, 1, 12), "Late End Date is correct");
        t.is(task4.getSlack(), 0, "slack is zero");

        t.diag("Task 5");
        t.is(task5.getEarlyStartDate(), new Date(2010, 1, 4), "Early Start Date is correct");
        t.is(task5.getEarlyEndDate(), new Date(2010, 1, 6), "Early End Date is correct");
        t.is(task5.getLateStartDate(), new Date(2010, 1, 8), "Late Start Date is correct");
        t.is(task5.getLateEndDate(), new Date(2010, 1, 10), "Late End Date is correct");
        t.is(task5.getSlack(), 2, "slack is 2");

        t.diag("Task 6");
        t.is(task6.getEarlyStartDate(), new Date(2010, 1, 3), "Early Start Date is correct");
        t.is(task6.getEarlyEndDate(), new Date(2010, 1, 4), "Early End Date is correct");
        t.is(task6.getLateStartDate(), new Date(2010, 1, 11), "Late Start Date is correct");
        t.is(task6.getLateEndDate(), new Date(2010, 1, 12), "Late End Date is correct");
        t.is(task6.getSlack(), 6, "slack is 6");
    });
});
