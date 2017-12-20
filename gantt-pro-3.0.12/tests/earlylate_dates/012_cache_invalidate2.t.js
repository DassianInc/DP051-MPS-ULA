StartTest(function (t) {

    var task1, task2, task3, task4, task5;

    var getTaskStore = function () {
        var store = new Gnt.data.TaskStore({
            cascadeDelay   : 0,

            root : {
                expanded : true,
                children : [
                    { leaf : true, Id : 1, StartDate : new Date(2010, 1, 3), Duration : 2 },
                    { leaf : true, Id : 4, StartDate : new Date(2010, 1, 4), Duration : 2 },
                        { leaf : true, Id : 2, StartDate : new Date(2010, 1, 15), Duration : 3 },
                            { leaf : true, Id : 3, StartDate : new Date(2010, 1, 15), Duration : 4 },
                    { leaf : true, Id : 5, StartDate : new Date(2010, 1, 11), Duration : 1 }
                ]
            },
            proxy : 'memory',
            dependencyStore : new Gnt.data.DependencyStore({
                data : [
                    { From : 1, To : 2, Type : 2, Lag : 2 },
                    { From : 2, To : 3, Type : 2, Lag : -1 },
                    { From : 4, To : 2, Type : 2, Lag : 0 }
                ]
            })
        });

        var root = store.getRootNode();

        root.cascadeBy(function (node) {
            if (root !== node) {
                node.getEarlyStartDate();
                node.getEarlyEndDate();
                node.getLateStartDate();
                node.getLateEndDate();
            }
        });

        task1 = store.getById(1);
        task2 = store.getById(2);
        task3 = store.getById(3);
        task4 = store.getById(4);
        task5 = store.getById(5);

        return store;
    };

    var taskStore = getTaskStore();

    t.it('Refreshing cache on task removing', function(t) {
        task2.remove();

        t.diag("Task 3");
        t.is(task3.getEarlyStartDate(), new Date(2010, 1, 15), "Early Start Date is correct");
        t.is(task3.getEarlyEndDate(), new Date(2010, 1, 19), "Early End Date is correct");
        t.is(task3.getLateStartDate(), new Date(2010, 1, 15), "Late Start Date is correct");
        t.is(task3.getLateEndDate(), new Date(2010, 1, 19), "Late End Date is correct");

        t.diag("Task 4");
        t.is(task4.getEarlyStartDate(), new Date(2010, 1, 4), "Early Start Date is correct");
        t.is(task4.getEarlyEndDate(), new Date(2010, 1, 6), "Early End Date is correct");
        t.is(task4.getLateStartDate(), new Date(2010, 1, 17), "Late Start Date is correct");
        t.is(task4.getLateEndDate(), new Date(2010, 1, 19), "Late End Date is correct");

        t.diag("Task 1");
        t.is(task1.getEarlyStartDate(), new Date(2010, 1, 3), "Early Start Date is correct");
        t.is(task1.getEarlyEndDate(), new Date(2010, 1, 5), "Early End Date is correct");
        t.is(task1.getLateStartDate(), new Date(2010, 1, 17), "Late Start Date is correct");
        t.is(task1.getLateEndDate(), new Date(2010, 1, 19), "Late End Date is correct");

        t.diag("Task 5");
        t.is(task5.getEarlyStartDate(), new Date(2010, 1, 11), "Early Start Date is correct");
        t.is(task5.getEarlyEndDate(), new Date(2010, 1, 12), "Early End Date is correct");
        t.is(task5.getLateStartDate(), new Date(2010, 1, 18), "Late Start Date is correct");
        t.is(task5.getLateEndDate(), new Date(2010, 1, 19), "Late End Date is correct");
    });

    t.it('Refreshing cache on task inserting', function(t) {
        taskStore = getTaskStore();

        taskStore.append({ leaf : true, Id : 6, StartDate : new Date(2010, 1, 15), Duration : 5 });

        var task6 = taskStore.getNodeById(6);

        t.diag("Task 1");
        t.is(task1.getEarlyStartDate(), new Date(2010, 1, 3), "Early Start Date is correct");
        t.is(task1.getEarlyEndDate(), new Date(2010, 1, 5), "Early End Date is correct");
        t.is(task1.getLateStartDate(), new Date(2010, 1, 8), "Late Start Date is correct");
        t.is(task1.getLateEndDate(), new Date(2010, 1, 10), "Late End Date is correct");

        t.diag("Task 2");
        t.is(task2.getEarlyStartDate(), new Date(2010, 1, 9), "Early Start Date is correct");
        t.is(task2.getEarlyEndDate(), new Date(2010, 1, 12), "Early End Date is correct");
        t.is(task2.getLateStartDate(), new Date(2010, 1, 12), "Late Start Date is correct");
        t.is(task2.getLateEndDate(), new Date(2010, 1, 17), "Late End Date is correct");

        t.diag("Task 3");
        t.is(task3.getEarlyStartDate(), new Date(2010, 1, 11), "Early Start Date is correct");
        t.is(task3.getEarlyEndDate(), new Date(2010, 1, 17), "Early End Date is correct");
        t.is(task3.getLateStartDate(), new Date(2010, 1, 16), "Late Start Date is correct");
        t.is(task3.getLateEndDate(), new Date(2010, 1, 20), "Late End Date is correct");

        t.diag("Task 4");
        t.is(task4.getEarlyStartDate(), new Date(2010, 1, 4), "Early Start Date is correct");
        t.is(task4.getEarlyEndDate(), new Date(2010, 1, 6), "Early End Date is correct");
        t.is(task4.getLateStartDate(), new Date(2010, 1, 10), "Late Start Date is correct");
        t.is(task4.getLateEndDate(), new Date(2010, 1, 12), "Late End Date is correct");

        t.diag("Task 5");
        t.is(task5.getEarlyStartDate(), new Date(2010, 1, 11), "Early Start Date is correct");
        t.is(task5.getEarlyEndDate(), new Date(2010, 1, 12), "Early End Date is correct");
        t.is(task5.getLateStartDate(), new Date(2010, 1, 19), "Late Start Date is correct");
        t.is(task5.getLateEndDate(), new Date(2010, 1, 20), "Late End Date is correct");

        t.diag("Task 6");
        t.is(task6.getEarlyStartDate(), new Date(2010, 1, 15), "Early Start Date is correct");
        t.is(task6.getEarlyEndDate(), new Date(2010, 1, 20), "Early End Date is correct");
        t.is(task6.getLateStartDate(), new Date(2010, 1, 15), "Late Start Date is correct");
        t.is(task6.getLateEndDate(), new Date(2010, 1, 20), "Late End Date is correct");
    });
});
