StartTest(function(t) {

    var data    = [
        {
            expanded        : true,
            Id              : 1,
            StartDate       : '2014-12-17T00:00:00',
            Duration        : 6,
            SchedulingMode  : 'FixedDuration',
            children        : [
                {
                    leaf        : true,
                    Id          : 2,
                    StartDate   : '2010-02-03T00:00:00',
                    Duration    : 6
                },
                {
                    leaf        : true,
                    Id          : 3,
                    StartDate   : '2010-02-03T00:00:00',
                    Duration    : 6
                }
            ]
        },
        {
            leaf        : true,
            Id          : 4,
            StartDate   : '2014-12-17T00:00:00',
            Duration    : 2
        }
    ];

    t.it('Parent task should have normal schedulingmode when it has children after load', function (t) {

        var taskStore = t.getTaskStore({ DATA : data }, true);

        taskStore.on('load', function () {
            t.expect( taskStore.getNodeById(1).getSchedulingMode() ).toBe('Normal');
        });

        taskStore.load();
    });

    t.it('Parent task should have normal schedulingmode when it gets children', function (t) {

        var task        = t.getTaskStore({ DATA : data }).getNodeById(4);

        task.setSchedulingMode('FixedDuration');

        t.expect(task.getSchedulingMode()).toBe('FixedDuration');

        task.appendChild({
            leaf        : true,
            Id          : 5,

            StartDate   : "2014-12-17T00:00:00",
            Duration    : 2
        });

        t.expect(task.getSchedulingMode()).toBe('Normal');
    });

});
