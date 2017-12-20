StartTest(function(t) {
    var tasks = [
        {
            Id          : 1,
            StartDate   : '2013-08-19',
            Duration    : 4,
            children    : [
                {
                    Id          : 11,
                    Duration    : 2,
                    StartDate   : '2013-08-19'
                },
                {
                    Id          : 12,
                    Duration    : 2,
                    StartDate   : '2013-08-21'
                }
            ]
        },
        {
            Id          : 2,
            StartDate   : '2013-08-26',
            Duration    : 2,
            children    : [
                {
                    Id          : 21,
                    Duration    : 2,
                    StartDate   : '2013-08-26'
                }
            ]
        }
    ];

    var ts = new Gnt.data.TaskStore({
        root : {
            children : tasks
        }
    });

    ts.getNodeById(2).appendChild(ts.getNodeById(12));

    t.isStartEnd(ts.getNodeById(1), new Date(2013,7, 19), new Date(2013,7, 21), 'Old parent recalculated');
    t.isStartEnd(ts.getNodeById(2), new Date(2013,7, 21), new Date(2013,7, 28), 'New parent recalculated');
});
