StartTest(function(t) {

    // #971: test data provided by customer

    var resourceStore   = t.getResourceStore({
        data    : [
            { Id : 1, Name : 'test resource 1' }
        ]
    });

    var assignmentStore = t.getAssignmentStore({
        data    : [
            {
                ResourceId  : 1,
                TaskId      : 3,
                Units       : 80
            },
            {
                ResourceId  : 1,
                TaskId      : 4,
                Units       : 80
            },
            {
                ResourceId  : 1,
                TaskId      : 5,
                Units       : 80
            },
            {
                ResourceId  : 1,
                TaskId      : 14,
                Units       : 100
            },
            {
                ResourceId  : 1,
                TaskId      : 15,
                Units       : 100
            },
            {
                ResourceId  : 1,
                TaskId      : 16,
                Units       : 100
            }
        ]
    });

    var taskStore = t.getTaskStore({
        resourceStore   : resourceStore,
        assignmentStore : assignmentStore,
        DATA            : [
            {
                Id          : 3,
                StartDate   : new Date(2013, 7, 9, 18, 0, 0),
                EndDate     : new Date(2013, 7, 14, 6, 0, 0),
                leaf        : true
            },
            {
                Id          : 4,
                StartDate   : new Date(2013, 7, 14, 6, 0, 0),
                EndDate     : new Date(2013, 7, 14, 13, 30, 0),
                leaf        : true
            },
            {
                Id          : 5,
                StartDate   : new Date(2013, 7, 14, 13, 30, 0),
                EndDate     : new Date(2013, 7, 15, 12, 0, 0),
                leaf        : true
            },
            {
                Id          : 14,
                StartDate   : new Date(2013, 7, 15, 12, 0, 0),
                EndDate     : new Date(2013, 7, 16, 12, 0, 0),
                leaf        : true
            },
            {
                Id          : 15,
                StartDate   : new Date(2013, 7, 16, 12, 0, 0),
                EndDate     : new Date(2013, 7, 16, 18, 0, 0),
                leaf        : true
            },
            {
                Id          : 16,
                StartDate   : new Date(2013, 7, 16, 18, 0, 0),
                EndDate     : new Date(2013, 7, 17, 12, 0, 0),
                leaf        : true
            }
        ]
    });

    var allocationInfo = resourceStore.getById(1).getAllocationInfo({
        startDate   : new Date(2013, 7, 10),
        endDate     : new Date(2013, 7, 19)
    });

    t.it('Resource #1 calculates allocation report correctly', function (t) {
        t.is(allocationInfo.length, 10, 'Length is correct');

        t.is(allocationInfo[0].startDate, new Date(2013, 7, 12), '0: start date is correct');
        t.is(allocationInfo[0].endDate, new Date(2013, 7, 13), '0: end date is correct');
        t.is(allocationInfo[0].totalAllocation, 80, '0: allocation % is correct');

        t.is(allocationInfo[1].startDate, new Date(2013, 7, 13), '1: start date is correct');
        t.is(allocationInfo[1].endDate, new Date(2013, 7, 14), '1: end date is correct');
        t.is(allocationInfo[1].totalAllocation, 80, '1: allocation % is correct');

        t.is(allocationInfo[2].startDate, new Date(2013, 7, 14), '2: start date is correct');
        t.is(allocationInfo[2].endDate, new Date(2013, 7, 14, 6), '2: end date is correct');
        t.is(allocationInfo[2].totalAllocation, 80, '2: allocation % is correct');

        t.is(allocationInfo[3].startDate, new Date(2013, 7, 14, 6), '3: start date is correct');
        t.is(allocationInfo[3].endDate, new Date(2013, 7, 14, 13, 30), '3: end date is correct');
        t.is(allocationInfo[3].totalAllocation, 80, '3: allocation % is correct');

        t.is(allocationInfo[4].startDate, new Date(2013, 7, 14, 13, 30), '4: start date is correct');
        t.is(allocationInfo[4].endDate, new Date(2013, 7, 15), '4: end date is correct');
        t.is(allocationInfo[4].totalAllocation, 80, '4: allocation % is correct');

        t.is(allocationInfo[5].startDate, new Date(2013, 7, 15), '5: start date is correct');
        t.is(allocationInfo[5].endDate, new Date(2013, 7, 15, 12), '5: end date is correct');
        t.is(allocationInfo[5].totalAllocation, 80, '5: allocation % is correct');

        t.is(allocationInfo[6].startDate, new Date(2013, 7, 15, 12), '6: start date is correct');
        t.is(allocationInfo[6].endDate, new Date(2013, 7, 16), '6: end date is correct');
        t.is(allocationInfo[6].totalAllocation, 100, '6: allocation % is correct');

        t.is(allocationInfo[7].startDate, new Date(2013, 7, 16), '7: start date is correct');
        t.is(allocationInfo[7].endDate, new Date(2013, 7, 16, 12), '7: end date is correct');
        t.is(allocationInfo[7].totalAllocation, 100, '7: allocation % is correct');

        t.is(allocationInfo[8].startDate, new Date(2013, 7, 16, 12), '8: start date is correct');
        t.is(allocationInfo[8].endDate, new Date(2013, 7, 16, 18), '8: end date is correct');
        t.is(allocationInfo[8].totalAllocation, 100, '8: allocation % is correct');

        t.is(allocationInfo[9].startDate, new Date(2013, 7, 16, 18), '9: start date is correct');
        t.is(allocationInfo[9].endDate, new Date(2013, 7, 17), '9: end date is correct');
        t.is(allocationInfo[9].totalAllocation, 100, '9: allocation % is correct');
    });

});
