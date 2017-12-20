StartTest(function(t) {

    // #1977 Checks that no parent task raises no exception when set its StartDate to NULL

    var setup = function (config) {
        config = config || {};

        return t.getTaskStore(Ext.apply({

            dependencyStore     : t.getDependencyStore({
                data : [
                    { From : 111, To : 112 },
                    { From : 111, To : 113 }
                ]
            }),

            DATA                : config.tasks || [
                {
                    Id          : 1,
                    StartDate   : "2010-01-19",
                    Duration    : 8,
                    expanded    : true,
                    children    : [
                        {
                            Id          : 11,
                            StartDate   : "2010-01-19",
                            Duration    : 8,
                            expanded    : true,
                            children    : [
                                {
                                    Id          : 111,
                                    StartDate   : "2010-01-19",
                                    Duration    : 8,
                                    leaf        : true
                                },
                                {
                                    Id          : 112,
                                    StartDate   : "2010-01-20",
                                    Duration    : 8,
                                    leaf        : true
                                },
                                {
                                    Id          : 113,
                                    StartDate   : "2010-01-21",
                                    Duration    : 0,
                                    ManuallyScheduled : true,
                                    leaf        : true
                                }
                            ]
                        }
                    ]
                }
            ]
        }, config.taskStore));

    };

    t.it('Sets parent task start date to null', function (t) {
        var taskStore = setup();

        t.livesOk(function () {
            taskStore.getNodeById(11).setStartDate(null);
        }, 'no exception raised');
    });

});
