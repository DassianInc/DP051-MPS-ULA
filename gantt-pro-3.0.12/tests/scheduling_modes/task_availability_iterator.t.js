StartTest(function(t) {

    // check that forEachAvailabilityInterval() enumerates proper set of intervals when we provide resources/assignments #1623

    var calendar1   = new Gnt.data.calendar.BusinessTime({
        calendarId  : 'Calendar1'
    });

    var resourceStore   = new Gnt.data.ResourceStore({
        proxy       : 'memory',
        data    : [
            {
                Id          : 'Resource1',
                CalendarId  : 'Calendar1'
            }
        ]
    });

    var assignmentStore   = new Gnt.data.AssignmentStore({
        proxy       : 'memory',
        data        : [
            {
                "Id"            : "Assignment1",
                "TaskId"        : "Task1",
                "ResourceId"    : 'Resource1',
                "Units"         : 100
            }
        ]
    });

    var taskStore           = new Gnt.data.TaskStore({
        resourceStore       : resourceStore,
        assignmentStore     : assignmentStore,
        calendar            : calendar1,
        proxy               : 'memory',
        root                : {
            expanded    : true,

            children    : [
                {
                    Id              : "Task1",
                    leaf            : true,
                    StartDate       : new Date(2014, 8, 1, 14, 0),
                    Duration        : 4
                }
            ]
        }
    });

    var task1       = taskStore.getNodeById('Task1');
    var time        = function (day, hour) { return new Date(2014, 8, day, hour) - 0; };


    t.it('forEachAvailabilityInterval enumerates correct set of intervals', function (t) {
        var intervals   = [];

        task1.forEachAvailabilityInterval({
            startDate   : new Date(2014, 8, 1, 14, 0),
            endDate     : new Date(2014, 8, 4),
            resources   : true
        }, function (from, till) {
            intervals.push([ from, till ]);
        });

        t.is(intervals.length, 5, 'correct number of intervals enumerated');
        t.isDeeply(intervals[0], [ time(1, 14), time(1, 17) ], '0: correct interval');

        t.isDeeply(intervals[1], [ time(2, 8),  time(2, 12) ], '1: correct interval');
        t.isDeeply(intervals[2], [ time(2, 13), time(2, 17) ], '2: correct interval');

        t.isDeeply(intervals[3], [ time(3, 8),  time(3, 12) ], '3: correct interval');
        t.isDeeply(intervals[4], [ time(3, 13), time(3, 17) ], '4: correct interval');
    });


    t.it('forEachAvailabilityInterval accepts list of resources and assignments', function (t) {

        var calendar2   = new Gnt.data.calendar.BusinessTime({
            calendarId          : 'Calendar2',
            defaultAvailability : ['00:00-06:00', '22:00-24:00']
        });

        var resource2   = new Gnt.model.Resource({
            Id          : 'Resource2',
            CalendarId  : calendar2.calendarId
        });

        var assignment2 = new Gnt.model.Assignment({
            Id          : "Assignment2",
            TaskId      : "Task1",
            ResourceId  : 'Resource2',
            Units       : 100
        });

        var intervals   = [];

        task1.forEachAvailabilityInterval({
            startDate   : new Date(2014, 8, 1, 14, 0),
            endDate     : new Date(2014, 8, 4),
            resources   : task1.getResources().concat(resource2),
            assignments : [].concat(task1.getAssignments(), assignment2)
        }, function (from, till) {
            intervals.push([ from, till ]);
        });

        t.is(intervals.length, 10, 'correct number of intervals enumerated');
        t.isDeeply(intervals[0], [ time(1, 14), time(1, 17) ], '0: correct interval');
        t.isDeeply(intervals[1], [ time(1, 22), time(1, 24) ], '1: correct interval');

        t.isDeeply(intervals[2], [ time(2, 0),  time(2, 6) ], '2: correct interval');
        t.isDeeply(intervals[3], [ time(2, 8),  time(2, 12) ], '3: correct interval');
        t.isDeeply(intervals[4], [ time(2, 13), time(2, 17) ], '4: correct interval');
        t.isDeeply(intervals[5], [ time(2, 22), time(2, 24) ], '5: correct interval');

        t.isDeeply(intervals[6], [ time(3, 0),  time(3, 6) ], '6: correct interval');
        t.isDeeply(intervals[7], [ time(3, 8),  time(3, 12) ], '7: correct interval');
        t.isDeeply(intervals[8], [ time(3, 13), time(3, 17) ], '8: correct interval');
        t.isDeeply(intervals[9], [ time(3, 22), time(3, 24) ], '9: correct interval');
    });
});
