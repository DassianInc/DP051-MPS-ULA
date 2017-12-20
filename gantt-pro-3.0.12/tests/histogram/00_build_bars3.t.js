StartTest(function(t) {

    // Here we check that histogram correctly handles a task having a custom calendar

    function setup (config) {
        config  = config || {};

        new Gnt.data.Calendar({
            calendarId          : 'calendar1',
            defaultAvailability : [ '14:00-16:00']
        });

        var resourceStore   = new Gnt.data.ResourceStore({
            data : config.resources || [
                { Id : 1, Name : 'Mike' },
                { Id : 2, Name : 'Dan' }
            ]
        });

        var assignmentStore = new Gnt.data.AssignmentStore({
            data            : config.assignments || [
                { TaskId : 1, ResourceId : 1, Units : 50 },
                { TaskId : 2, ResourceId : 1, Units : 50 },
                { TaskId : 3, ResourceId : 2 },
                { TaskId : 4, ResourceId : 2 }
            ]
        });

        var taskStore       = t.getTaskStore({
            resourceStore   : resourceStore,
            assignmentStore : assignmentStore,
            DATA            : config.tasks || [
                {
                    Id          : 1,
                    Name        : 'Task 1',
                    StartDate   : new Date(2015, 5, 8),
                    Duration    : 3
                },
                {
                    Id          : 2,
                    Name        : 'Task 2',
                    StartDate   : new Date(2015, 5, 8),
                    Duration    : 5
                },
                {
                    Id              : 3,
                    Name            : 'Task 3',
                    StartDate       : new Date(2015, 5, 8),
                    Duration        : 6,
                    DurationUnit    : 'h',
                    CalendarId      : 'calendar1'
                },
                {
                    Id          : 4,
                    Name        : 'Task 4',
                    StartDate   : new Date(2015, 5, 8),
                    Duration    : 5
                }
            ]
        })

        return taskStore;
    }


    t.it('Render bars properly', function (t) {
        var taskStore       = setup();

        var histogram       = new Gnt.panel.ResourceHistogram({
            taskStore           : taskStore,
            resourceStore       : taskStore.resourceStore,
            assignmentStore     : taskStore.assignmentStore,
            startDate           : taskStore.getProjectStartDate(),
            endDate             : taskStore.getProjectEndDate(),
            renderTo            : Ext.getBody(),
            height              : 500
        });

        t.it('Histogram processes resource #1 allocation info correctly', function (t) {

            t.waitForRowsVisible(histogram, function () {
                var data = histogram.allocationData[1];

                t.is(data.bars.length, 2, '2 bars found');

                t.is(data.bars[0].startDate, taskStore.getNodeById(1).getStartDate(), '1st bar starts at "Task1" start date');
                t.is(data.bars[0].totalAllocation, 100, '1st bar allocation is correct');

                t.is(data.bars[1].startDate, taskStore.getNodeById(1).getEndDate(), '2nd bar starts at "Task1" end date');
                t.is(data.bars[1].totalAllocation, 50, '2nd bar allocation is correct');

            });
        });


        t.it('Histogram processes resource #2 allocation info correctly', function (t) {

            t.waitForRowsVisible(histogram, function () {
                var data = histogram.allocationData[2];

                t.is(data.bars.length, 2, '2 bars found');

                t.is(data.bars[0].startDate, taskStore.getNodeById(3).getStartDate(), '0th bar start is correct');
                t.is(data.bars[0].totalAllocation, 200, '0th bar allocation is correct');
                t.is(data.bars[0].allocationMS/3600000, 26, '0th bar allocation time is correct');

                t.is(data.bars[1].startDate, new Date(2015, 5, 11), '1st bar start is correct');
                t.is(data.bars[1].endDate, taskStore.getNodeById(4).getEndDate(), '1st bar end is correct');
                t.is(data.bars[1].totalAllocation, 100, '1st bar allocation is correct');
                t.is(data.bars[1].allocationMS/3600000, 24, '1st bar allocation time is correct');

            });
        });

    });
});
