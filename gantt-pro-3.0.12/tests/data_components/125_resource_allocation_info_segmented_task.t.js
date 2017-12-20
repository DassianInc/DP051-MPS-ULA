StartTest(function(t) {

    // Checks that getAllocationInfo() supports segmented tasks (#2004)

    var resourceStore   = t.getResourceStore({
        data    : [
            { Id: 1, Name: 'resource 1' }
        ]
    });

    var assignmentStore = t.getAssignmentStore({
        data    : [
            { ResourceId: 1, TaskId: 1, Units: 75 },
            { ResourceId: 1, TaskId: 2, Units: 25 }
        ]
    });

    var taskStore       = t.getTaskStore({
        resourceStore   : resourceStore,
        assignmentStore : assignmentStore,
        DATA            : [
            {
                Id          : 1,
                leaf        : true,
                Name        : "Task1",
                StartDate   : new Date(2013, 3, 1),
                Segments    : [
                    {
                        Id          : 1,
                        StartDate   : new Date(2013, 3, 1),
                        Duration    : 1
                    },
                    {
                        Id          : 2,
                        StartDate   : new Date(2013, 3, 3),
                        Duration    : 1
                    },
                    {
                        Id          : 3,
                        StartDate   : new Date(2013, 3, 5),
                        Duration    : 1
                    }
                ]
            },
            {
                Id          : 2,
                leaf        : true,
                Name        : "Task2",
                StartDate   : new Date(2013, 3, 3),
                Duration    : 2
            }
        ]
    });

    var allocationInfo = resourceStore.getById(1).getAllocationInfo({
        startDate   : new Date(2013, 2, 30),
        endDate     : new Date(2013, 3, 15)
    });

    t.it('Resource #1 calculates allocation report correctly', function (t) {
        t.is(allocationInfo.length, 4, 'Length is correct');

        t.is(allocationInfo[0].startDate, new Date(2013, 3, 1), '0: start date is correct');
        t.is(allocationInfo[0].endDate, new Date(2013, 3, 2), '0: end date is correct');
        t.is(allocationInfo[0].totalAllocation, 75, '0: allocation % is correct');

        t.is(allocationInfo[1].startDate, new Date(2013, 3, 3), '1: start date is correct');
        t.is(allocationInfo[1].endDate, new Date(2013, 3, 4), '1: end date is correct');
        t.is(allocationInfo[1].totalAllocation, 100, '1: allocation % is correct');

        t.is(allocationInfo[2].startDate, new Date(2013, 3, 4), '2: start date is correct');
        t.is(allocationInfo[2].endDate, new Date(2013, 3, 5), '2: end date is correct');
        t.is(allocationInfo[2].totalAllocation, 25, '2: allocation % is correct');

        t.is(allocationInfo[3].startDate, new Date(2013, 3, 5), '3: start date is correct');
        t.is(allocationInfo[3].endDate, new Date(2013, 3, 6), '3: end date is correct');
        t.is(allocationInfo[3].totalAllocation, 75, '3: allocation % is correct');
    });

});
