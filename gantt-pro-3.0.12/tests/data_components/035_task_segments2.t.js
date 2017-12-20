StartTest(function(t) {

    // Checks that task availability iterator enumerates proper set of intervals for a business time calendar #1628
    t.it('forEachAvailabilityInterval takes split into account', function (t) {

        var taskStore   = t.getTaskStore({
            calendar    : new Gnt.data.calendar.BusinessTime(),

            DATA        : [{
                Id          : 1,
                StartDate   : '2012-09-03 08:00:00',
                Duration    : 9,
                Segments    : [
                    {
                        Id          : 1,
                        StartDate   : '2012-09-03 08:00:00',
                        Duration    : 2
                    }, {
                        Id          : 2,
                        StartDate   : '2012-09-06 08:00:00',
                        Duration    : 3
                    }, {
                        Id          : 3,
                        StartDate   : '2012-09-12 08:00:00',
                        Duration    : 4
                    }
                ],
                leaf        : true
            }]
        });

        var task    = taskStore.getNodeById(1);
        var time    = function (day, hour) { return new Date(2012, 8, day, hour) - 0; };

        var intervals   = [];

        task.forEachAvailabilityInterval({
            startDate   : task.getStartDate(),
            endDate     : task.getEndDate(),
            fn          : function (from, to) {
                intervals.push([ from, to ]);
            }
        });

        t.is(intervals.length, 18, 'correct number of intervals enumerated');
        t.isDeeply(intervals[0], [ time(3, 8),  time(3, 12) ], '0: correct interval');
        t.isDeeply(intervals[1], [ time(3, 13), time(3, 17) ], '1: correct interval');

        t.isDeeply(intervals[2], [ time(4, 8),  time(4, 12) ], '2: correct interval');
        t.isDeeply(intervals[3], [ time(4, 13), time(4, 17) ], '3: correct interval');

        t.isDeeply(intervals[4], [ time(6, 8),  time(6, 12) ], '4: correct interval');
        t.isDeeply(intervals[5], [ time(6, 13), time(6, 17) ], '5: correct interval');

        t.isDeeply(intervals[6], [ time(7, 8),  time(7, 12) ], '6: correct interval');
        t.isDeeply(intervals[7], [ time(7, 13), time(7, 17) ], '7: correct interval');

        t.isDeeply(intervals[8], [ time(10, 8),  time(10, 12) ], '8: correct interval');
        t.isDeeply(intervals[9], [ time(10, 13), time(10, 17) ], '9: correct interval');

        t.isDeeply(intervals[10], [ time(12, 8),  time(12, 12) ], '10: correct interval');
        t.isDeeply(intervals[11], [ time(12, 13), time(12, 17) ], '11: correct interval');
        t.isDeeply(intervals[12], [ time(13, 8),  time(13, 12) ], '12: correct interval');
        t.isDeeply(intervals[13], [ time(13, 13), time(13, 17) ], '13: correct interval');
        t.isDeeply(intervals[14], [ time(14, 8),  time(14, 12) ], '14: correct interval');
        t.isDeeply(intervals[15], [ time(14, 13), time(14, 17) ], '15: correct interval');
        t.isDeeply(intervals[16], [ time(17, 8),  time(17, 12) ], '16: correct interval');
        t.isDeeply(intervals[17], [ time(17, 13), time(17, 17) ], '17: correct interval');
    });

    // Makes sure that set('Segments', ...) call fills neighbour segments references #1894
    t.it('model.set method should set segments', function (t) {

        var task        = t.getTaskStore({
            DATA        : [{
                Id          : 1,
                StartDate   : '2012-09-03',
                Duration    : 9
            }]
        }).getNodeById(1);

        task.set('Segments', [
            {
                Id          : 1,
                StartDate   : '2012-09-03',
                Duration    : 2
            },
            {
                Id          : 2,
                StartDate   : '2012-09-06',
                Duration    : 3
            },
            {
                Id          : 3,
                StartDate   : '2012-09-12',
                Duration    : 4
            }
        ]);

        var segments = task.getSegments();

        t.notOk(segments[0].getPrevSegment(), 'Correct PreviousSegment for first segment');
        t.is(segments[0].getNextSegment(), segments[1], 'Correct NextSegment for first segment');

        t.is(segments[1].getPrevSegment(), segments[0], 'PreviousSegment for second segment');
        t.is(segments[1].getNextSegment(), segments[2], 'Correct NextSegment for second segment');

        t.is(segments[2].getPrevSegment(), segments[1], 'PreviousSegment for last segment');
        t.notOk(segments[2].getNextSegment(), 'Correct NextSegment for last segment');
    });

    t.it('Should move segmented task correctly', function (t) {
        var taskStore   = t.getTaskStore({
            DATA        : [{
                "Id"                : 1,
                "StartDate"         : "2010-01-18",
                "Duration"          : 10,
                "expanded"          : true,
                "children"          : [
                    {
                        "Id"                : 11,
                        "leaf"              : true,
                        "StartDate"         : "2010-01-18",
                        "Segments"          : [
                            {
                                "Id"                : 1,
                                "StartDate"         : "2010-01-18",
                                "Duration"          : 1
                            },
                            {
                                "Id"                : 2,
                                "StartDate"         : "2010-01-20",
                                "Duration"          : 2
                            },
                            {
                                "Id"                : 3,
                                "StartDate"         : "2010-01-25",
                                "Duration"          : 5
                            }
                        ]
                    },
                    {
                        "Id"                : 12,
                        "leaf"              : true,
                        "StartDate"         : "2010-01-18",
                        "Duration"          : 10
                    },
                    {
                        "Id"                : 13,
                        "leaf"              : true,
                        "ManuallyScheduled" : true,
                        "StartDate"         : "2010-01-18",
                        "Duration"          : 10
                    }
                ]
            }]
        });

        var getNode = function (id) { return taskStore.getNodeById(id); };

        var parent = getNode(1);
        var child1 = getNode(11);
        var child2 = getNode(12);
        var child3 = getNode(13);

        var assertDates = function (lag) {
            var date = new Date(2010, 0, 18);
            t.is(parent.getStartDate(), date);
            t.is(child1.getStartDate(), Ext.Date.add(date, 'd', lag), 'Segmented task moved correctly');
            t.is(child2.getStartDate(), Ext.Date.add(date, 'd', lag), 'Regular task moved correctly');
            t.is(child3.getStartDate(), date);
        };

        var newDate = new Date(2010, 0, 19);

        parent.setStartDate(newDate);
        assertDates(1);

        newDate = new Date(2010, 0, 20);

        parent.setStartDate(newDate);
        assertDates(3);
    });

    t.it('Segments should react to calendar changes', function (t) {
        var taskStore   = t.getTaskStore({
            DATA        : [
                {
                    leaf        : true,
                    StartDate   : new Date(2010, 0, 18),
                    Segments    : [
                        {
                            StartDate   : new Date(2010, 0, 18),
                            Duration    : 1
                        },
                        {
                            StartDate   : new Date(2010, 0, 20),
                            Duration    : 2
                        },
                        {
                            StartDate   : new Date(2010, 0, 25),
                            Duration    : 5
                        }
                    ]
                }
            ]
        });

        var calendar            = new Gnt.data.calendar.BusinessTime({
            calendarId          : 'foo',
            defaultAvailability : ["00:00-06:00", "22:00-24:00"]
        });

        var task = taskStore.getRootNode().firstChild;

        t.is(task.getLastSegment().getEndDate(), new Date(2010, 0, 30), 'Last segment end date is correct');

        task.setCalendar(calendar);

        t.is(task.getSegment(0).getStartDate(), new Date(2010, 0, 18), '0th segment start date is correct');
        t.is(task.getSegment(0).getEndDate(), new Date(2010, 0, 21), '0th segment end date is correct');

        t.is(task.getSegment(1).getStartDate(), new Date(2010, 0, 26), '0th segment start date is correct');
        t.is(task.getSegment(1).getEndDate(), new Date(2010, 1, 3), '0th segment end date is correct');

        t.is(task.getSegment(2).getStartDate(), new Date(2010, 1, 8), '0th segment start date is correct');
        t.is(task.getSegment(2).getEndDate(), new Date(2010, 1, 27), '0th segment end date is correct');

    });


    // #2505 - Segments not updated correctly after drag drop
    t.it('Last segments shift to the right adjusts master task properly', function (t) {
        var taskStore   = t.getTaskStore({
            DATA        : [
                {
                    leaf        : true,
                    StartDate   : new Date(2010, 0, 18),
                    Segments    : [
                        {
                            StartDate   : new Date(2010, 0, 18),
                            Duration    : 1
                        },
                        {
                            StartDate   : new Date(2010, 0, 20),
                            Duration    : 2
                        },
                        {
                            StartDate   : new Date(2010, 0, 25),
                            Duration    : 5
                        }
                    ]
                }
            ]
        });

        var task      = taskStore.getRootNode().firstChild,
            duration  = task.getDuration(),
            startDate = task.getStartDate();

        task.getLastSegment().setStartDate(new Date(2010, 1, 15));

        t.is(task.getStartDate(), startDate, 'correct master task start date');
        t.is(task.getEndDate(), new Date(2010, 1, 20), 'correct master task end date');
        t.is(task.getDuration(), duration, 'correct master task duration');
    });
});
