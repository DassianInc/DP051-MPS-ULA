StartTest(function(t) {

    var setup = function (tasks, dependencies) {
        return t.getAllStoresDataSet(
            tasks || [
                {
                    Id              : 1,
                    leaf            : true,
                    StartDate       : new Date(2014, 4, 1),
                    Segments        : [
                        {
                            Id          : 1,
                            StartDate   : new Date(2014, 4, 1),
                            Duration    : 1
                        },
                        {
                            Id          : 2,
                            StartDate   : new Date(2014, 4, 5),
                            Duration    : 2
                        },
                        {
                            Id          : 3,
                            StartDate   : new Date(2014, 4, 8),
                            Duration    : 2
                        }
                    ]
                },
                {
                    Id              : 2,
                    leaf            : true,
                    StartDate       : new Date(2014, 4, 12),
                    Duration        : 1,
                    ConstraintType  : 'finishnolaterthan',
                    ConstraintDate  : new Date(2014, 4, 13)
                }
            ],
            dependencies || [
                { Id : 1, From : 1, To : 2 }
            ]
        );
    };

    var checkSegments = function (t, task, dates, offsets, text) {
        var list    = task.getSegments();

        t.it(text || 'Task #'+ task.getId() +' has correct segments list', function (t) {

            t.is(list.length, dates.length, 'proper number of segments');

            for (var i = 0, l = list.length; i < l; i++) {
                var segment = list[i],
                    range   = dates[i],
                    offset  = offsets[i];

                t.is(segment.getStartDate(),    range[0],   '#'+ i +' proper start date');
                t.is(segment.getEndDate(),      range[1],   '#'+ i +' proper end date');

                t.is(segment.getStartOffset(),  offset[0]*24*3600000,  '#'+ i +' proper start offset');
                t.is(segment.getEndOffset(),    offset[1]*24*3600000,  '#'+ i +' proper end offset');

                t.is(segment.getNextSegment(),  list[i + 1], '#'+ i +' proper next segment');
                t.is(segment.getPrevSegment(),  list[i - 1], '#'+ i +' proper previous segment');
            }
        });

    };

    var originalState   = [
        [
            [ new Date(2014, 4, 1), new Date(2014, 4, 2) ],
            [ new Date(2014, 4, 5), new Date(2014, 4, 7) ],
            [ new Date(2014, 4, 8), new Date(2014, 4, 10) ]
        ],
        [
            [ 0, 1 ],
            [ 2, 4 ],
            [ 5, 7 ]
        ]
    ];

    t.it('Split results get reverted properly', function (t) {
        /* global task, taskStore */
        with (setup()) {
            taskStore.on('constraintconflict', function(task, resolutionContext) {
                t.pass("Got constraint conflict");
                resolutionContext.cancelAction();
            });

            task(1).split(new Date(2014, 4, 6));

            checkSegments(t, task(1), originalState[0], originalState[1]);
        }
    });

    t.it('Last segment move gets reverted properly', function (t) {
        /* global task, taskStore */
        with (setup()) {
            taskStore.on('constraintconflict', function(task, resolutionContext) {
                t.pass("Got constraint conflict");
                resolutionContext.cancelAction();
            });

            task(1).getSegment(2).setStartDate(new Date(2014, 4, 9));

            checkSegments(t, task(1), originalState[0], originalState[1]);
        }
    });

    t.it('Last segment resize gets reverted properly', function (t) {
        /* global task, taskStore */
        with (setup()) {
            taskStore.on('constraintconflict', function(task, resolutionContext) {
                t.pass("Got constraint conflict");
                resolutionContext.cancelAction();
            });

            task(1).getSegment(2).setEndDate(new Date(2014, 4, 13), false);

            checkSegments(t, task(1), originalState[0], originalState[1]);
        }
    });

    t.it('Last segment resize using `setDuration` gets reverted properly', function (t) {
        /* global task, taskStore */
        with (setup()) {
            taskStore.on('constraintconflict', function(task, resolutionContext) {
                t.pass("Got constraint conflict");
                resolutionContext.cancelAction();
            });

            task(1).getSegment(2).setDuration(3);

            checkSegments(t, task(1), originalState[0], originalState[1]);
        } 

    });

});
