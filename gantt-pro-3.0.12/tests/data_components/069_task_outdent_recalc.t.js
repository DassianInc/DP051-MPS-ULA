StartTest(function(t) {

    function getTaskStore() {

        return new Gnt.data.TaskStore({
            root : {
                expanded : true,
                children : [{
                    Id          : 1,
                    PercentDone : 40,
                    StartDate   : new Date(2010, 0, 18),
                    Duration    : 11,
                    expanded    : true,
                    children    : [
                        {
                            Id          : 11,
                            leaf        : true,
                            PercentDone : 30,
                            StartDate   : new Date(2010, 0, 18),
                            Duration    : 8,
                            Effort      : 1
                        },
                        {
                            Id          : 12,
                            leaf        : true,
                            PercentDone : 0,
                            StartDate   : new Date(2010, 0, 28),
                            Duration    : 3,
                            Effort      : 1
                        }
                    ]
                }]
            },
            cascadeDelay : 0,
            proxy        : 'memory'
        });
    }

    t.it('Calculate effort on outdent', function (t) {

        var taskStore   = getTaskStore(),
            task1       = taskStore.getNodeById(1),
            task11      = taskStore.getNodeById(11);

        t.isApprox(task1.getPercentDone(), 21.8, 0.02, "Task 1 percent is correct");
        t.is(task1.getEffort(), 2, "Task 1 effort is correct");

        t.diag("Outdent Task 1");

        task11.outdent();

        t.is(task1.getPercentDone(), 0, "Task 1 percent has changed");
        t.is(task1.getEffort(), 1, "Task 1 effort has changed");

    });

});
