StartTest(function (t) {

    // Make sure that incoming dependencies correctly constrain their successor #1543

    var getDataSet = function () {
        var dependencyStore = t.getDependencyStore({
            data : [
                { From : 1, To : 5, Type : Gnt.model.Dependency.Type.EndToStart },
                { From : 2, To : 5, Type : Gnt.model.Dependency.Type.EndToEnd },
                { From : 3, To : 5, Type : Gnt.model.Dependency.Type.StartToStart },
                { From : 4, To : 5, Type : Gnt.model.Dependency.Type.StartToEnd }
            ]
        });

        var taskStore = t.getTaskStore({
            dependencyStore : dependencyStore,
            DATA : [
                {
                    Id        : 1,
                    Name      : 'FS',
                    leaf      : true,
                    StartDate : new Date(2010, 0, 13),
                    Duration  : 6
                },
                {
                    Id        : 2,
                    Name      : 'FF',
                    leaf      : true,
                    StartDate : new Date(2010, 0, 13),
                    Duration  : 4
                },
                {
                    Id        : 3,
                    Name      : 'SS',
                    leaf      : true,
                    StartDate : new Date(2010, 0, 13),
                    Duration  : 5
                },
                {
                    Id        : 4,
                    Name      : 'SF',
                    leaf      : true,
                    StartDate : new Date(2010, 0, 13),
                    Duration  : 10
                },
                {
                    Id        : 5,
                    Name      : 'successor',
                    leaf      : true,
                    StartDate : new Date(2010, 0, 21),
                    Duration  : 5
                }
            ]
        });

        return {
            taskStore       : taskStore,
            dependencyStore : dependencyStore
        };
    };

    var dataSet         = getDataSet();
    var taskStore       = dataSet.taskStore;
    var task            = function (id) { return taskStore.getById(id); };

    t.it('Task `FS` modifications correctly affect on task `successor`', function (t) {

        task(1).setDuration(7);

        t.is(task(5).getStartDate(), new Date(2010, 0, 22), 'start date got changed');

        task(1).setDuration(5);

        t.is(task(5).getStartDate(), new Date(2010, 0, 20), 'start date got changed');

        task(1).setDuration(6);

        t.is(task(5).getStartDate(), new Date(2010, 0, 21), 'start date got changed');

        task(1).setStartDate(new Date(2010, 0, 5));

        t.is(task(5).getStartDate(), new Date(2010, 0, 13), 'start date got changed');

        task(1).setStartDate(new Date(2010, 0, 4));

        t.is(task(5).getStartDate(), new Date(2010, 0, 13), 'start date is intact');

        task(1).setStartDate(new Date(2010, 0, 13));
    });

    t.it('Task `FF` modifications correctly affect on task `successor`', function (t) {

        task(2).setDuration(7);

        t.is(task(5).getStartDate(), new Date(2010, 0, 21), 'start date is intact');

        task(2).setDuration(12);

        t.is(task(5).getStartDate(), new Date(2010, 0, 22), 'start date got changed');

        task(2).setDuration(4);
    });

    t.it('Task `SS` modifications correctly affect on task `successor`', function (t) {

        task(3).setStartDate(new Date(2010, 0, 12));

        t.is(task(5).getStartDate(), new Date(2010, 0, 21), 'start date is intact');

        task(3).setStartDate(new Date(2010, 0, 21));

        t.is(task(5).getStartDate(), new Date(2010, 0, 21), 'start date is intact');

        task(3).setStartDate(new Date(2010, 0, 22));

        t.is(task(5).getStartDate(), new Date(2010, 0, 22), 'start date got changed');

        task(3).setStartDate(new Date(2010, 0, 13));
    });


    t.it('Task `SF` modifications correctly affect on task `successor`', function (t) {

        task(4).setDuration(9);

        t.is(task(5).getStartDate(), new Date(2010, 0, 21), 'start date is intact');

        task(4).setStartDate(new Date(2010, 0, 21));

        t.is(task(5).getStartDate(), new Date(2010, 0, 21), 'start date is intact');

        task(4).setStartDate(new Date(2010, 0, 28));

        t.is(task(5).getStartDate(), new Date(2010, 0, 21), 'start date is intact');

        task(4).setStartDate(new Date(2010, 0, 29));

        t.is(task(5).getStartDate(), new Date(2010, 0, 22), 'start date got changed');

        task(4).setStartDate(new Date(2010, 0, 13));
    });

});
