StartTest(function(t) {

    // #1938 Checks that parent task keeps its aligning after move when "recalculateParents" is "false"

    var setup = function (config) {
        config = config || {};

        return t.getTaskStore(Ext.apply({
            recalculateParents  : false,
            DATA                : config.tasks || [
                {
                    Id          : 1,
                    StartDate   : "2010-01-30",
                    Duration    : 0,
                    expanded    : true,
                    children    : [
                        {
                            Id          : 11,
                            leaf        : true,
                            StartDate   : "2010-01-18",
                            Segments    : [
                                {
                                    Id          : 1,
                                    StartDate   : "2010-01-18",
                                    Duration    : 1
                                },
                                {
                                    Id          : 2,
                                    StartDate   : "2010-01-20",
                                    Duration    : 2
                                },
                                {
                                    Id          : 3,
                                    StartDate   : "2010-01-25",
                                    Duration    : 5
                                }
                            ]
                        },
                        {
                            Id          : 12,
                            leaf        : true,
                            StartDate   : "2010-01-19",
                            Duration    : 8
                        },
                        {
                            Id          : 13,
                            leaf        : true,
                            StartDate   : "2010-01-20",
                            Duration    : 9
                        }
                    ]
                }
            ]
        }, config.taskStore));

    };

    t.it('Keeps child tasks aligned properly after parent task move', function (t) {
        var taskStore = setup();

        taskStore.getNodeById(1).setStartDate(new Date(2010, 1, 3));

        t.is(taskStore.getNodeById(11).getStartDate(), new Date(2010, 0, 20), 'task11: proper start');
        t.is(taskStore.getNodeById(11).getEndDate(), new Date(2010, 1, 3), 'task11: proper finish');
        t.is(taskStore.getNodeById(12).getStartDate(), new Date(2010, 0, 21), 'task12: proper start');
        t.is(taskStore.getNodeById(12).getEndDate(), new Date(2010, 1, 2), 'task12: proper finish');
        t.is(taskStore.getNodeById(13).getStartDate(), new Date(2010, 0, 22), 'task13: proper start');
        t.is(taskStore.getNodeById(13).getEndDate(), new Date(2010, 1, 4), 'task13: proper finish');
    });

});
