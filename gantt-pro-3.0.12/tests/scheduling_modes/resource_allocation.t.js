StartTest(function(t) {

    var dataSet             = t.getSampleDataSet1();

    var taskStore           = dataSet.taskStore;
    var resourceStore       = dataSet.resourceStore;

    var task1               = taskStore.getNodeById(1);
    var resource1           = resourceStore.getById('Res1');
    var assignment1         = task1.getAssignmentFor(resource1);

    t.isDeeply(
        resource1.getAllocationInfo({
            startDate               : new Date(2011, 6, 1, 3, 0),
            endDate                 : new Date(2011, 6, 4, 21, 0),
            includeAllIntervals     : true
        }),
        [
            {
                startDate                : new Date(2011, 6, 1, 3, 0),
                endDate                  : new Date(2011, 6, 1, 8, 0),

                assignments              : [],
                assignmentsHash          : {},
                effectiveAssignments     : [],
                effectiveAssignmentsHash : {},
                effectiveTotalAllocation : 0,
                totalAllocation          : 0,
                totalAllocationMS        : 0,
                inResourceCalendar       : false,
                inTasksCalendar          : false,
                inTaskCalendarHash       : {},
                inTask                   : 0
            },
            {
                startDate                : new Date(2011, 6, 1, 8, 0),
                endDate                  : new Date(2011, 6, 1, 12, 0),

                assignments              : [ assignment1 ],
                assignmentsHash          : { 1 : assignment1 },
                effectiveAssignments     : [ assignment1 ],
                effectiveAssignmentsHash : { 1 : assignment1 },
                effectiveTotalAllocation : 100,
                totalAllocation          : 100,
                totalAllocationMS        : 14400000,
                inResourceCalendar       : true,
                inTasksCalendar          : true,
                inTaskCalendarHash       : { 1 : true },
                inTask                   : 1
            },
            {
                startDate                : new Date(2011, 6, 1, 12, 0),
                endDate                  : new Date(2011, 6, 1, 13, 0),

                assignments              : [],
                assignmentsHash          : {},
                effectiveAssignments     : [],
                effectiveAssignmentsHash : {},
                effectiveTotalAllocation : 0,
                totalAllocation          : 0,
                totalAllocationMS        : 0,
                inResourceCalendar       : false,
                inTasksCalendar          : false,
                inTaskCalendarHash       : {},
                inTask                   : 1
            },
            {
                startDate                : new Date(2011, 6, 1, 13, 0),
                endDate                  : new Date(2011, 6, 1, 17, 0),

                assignments              : [ assignment1 ],
                assignmentsHash          : { 1 : assignment1 },
                effectiveAssignments     : [ assignment1 ],
                effectiveAssignmentsHash : { 1 : assignment1 },
                effectiveTotalAllocation : 100,
                totalAllocation          : 100,
                totalAllocationMS        : 14400000,
                inResourceCalendar       : true,
                inTasksCalendar          : true,
                inTaskCalendarHash       : { 1 : true },
                inTask                   : 1
            },
            {
                startDate                : new Date(2011, 6, 1, 17, 0),
                endDate                  : new Date(2011, 6, 4, 8, 0),

                assignments              : [],
                assignmentsHash          : {},
                effectiveAssignments     : [],
                effectiveAssignmentsHash : {},
                effectiveTotalAllocation : 0,
                totalAllocation          : 0,
                totalAllocationMS        : 0,
                inResourceCalendar       : false,
                inTasksCalendar          : false,
                inTaskCalendarHash       : {},
                inTask                   : 1
            },
            {
                startDate                : new Date(2011, 6, 4, 8, 0),
                endDate                  : new Date(2011, 6, 4, 12, 0),

                assignments              : [ assignment1 ],
                assignmentsHash          : { 1 : assignment1 },
                effectiveAssignments     : [ assignment1 ],
                effectiveAssignmentsHash : { 1 : assignment1 },
                effectiveTotalAllocation : 100,
                totalAllocation          : 100,
                totalAllocationMS        : 14400000,
                inResourceCalendar       : true,
                inTasksCalendar          : true,
                inTaskCalendarHash       : { 1 : true },
                inTask                   : 1
            },
            {
                startDate                : new Date(2011, 6, 4, 12, 0),
                endDate                  : new Date(2011, 6, 4, 13, 0),

                assignments              : [],
                assignmentsHash          : {},
                effectiveAssignments     : [],
                effectiveAssignmentsHash : {},
                effectiveTotalAllocation : 0,
                totalAllocation          : 0,
                totalAllocationMS        : 0,
                inResourceCalendar       : false,
                inTasksCalendar          : false,
                inTaskCalendarHash       : {},
                inTask                   : 1
            },
            {
                startDate                : new Date(2011, 6, 4, 13, 0),
                endDate                  : new Date(2011, 6, 4, 17, 0),

                assignments              : [ assignment1 ],
                assignmentsHash          : { 1 : assignment1 },
                effectiveAssignments     : [ assignment1 ],
                effectiveAssignmentsHash : { 1 : assignment1 },
                effectiveTotalAllocation : 100,
                totalAllocation          : 100,
                totalAllocationMS        : 14400000,
                inResourceCalendar       : true,
                inTasksCalendar          : true,
                inTaskCalendarHash       : { 1 : true },
                inTask                   : 1
            },
            {
                startDate                : new Date(2011, 6, 4, 17, 0),
                endDate                  : new Date(2011, 6, 4, 21, 0),

                assignments              : [],
                assignmentsHash          : {},
                effectiveAssignments     : [],
                effectiveAssignmentsHash : {},
                effectiveTotalAllocation : 0,
                totalAllocation          : 0,
                totalAllocationMS        : 0,
                inResourceCalendar       : false,
                inTasksCalendar          : false,
                inTaskCalendarHash       : {},
                inTask                   : 0
            }
        ],
        'Correct allocation information for Resource1 - with all intervals'
    );


    t.isDeeply(
        // total allocation w/o intervals out of resource availability
        resource1.getAllocationInfo({
            startDate               : new Date(2011, 6, 1, 3, 0),
            endDate                 : new Date(2011, 6, 4, 21, 0),
            includeAllIntervals     : false
        }),
        [
            {
                startDate                : new Date(2011, 6, 1, 8, 0),
                endDate                  : new Date(2011, 6, 1, 12, 0),

                assignments              : [ assignment1 ],
                assignmentsHash          : { 1 : assignment1 },
                effectiveAssignments     : [ assignment1 ],
                effectiveAssignmentsHash : { 1 : assignment1 },
                effectiveTotalAllocation : 100,
                totalAllocation          : 100,
                totalAllocationMS        : 14400000,
                inResourceCalendar       : true,
                inTasksCalendar          : true,
                inTaskCalendarHash       : { 1 : true },
                inTask                   : 1
            },
            {
                startDate                : new Date(2011, 6, 1, 13, 0),
                endDate                  : new Date(2011, 6, 1, 17, 0),

                assignments              : [ assignment1 ],
                assignmentsHash          : { 1 : assignment1 },
                effectiveAssignments     : [ assignment1 ],
                effectiveAssignmentsHash : { 1 : assignment1 },
                effectiveTotalAllocation : 100,
                totalAllocation          : 100,
                totalAllocationMS        : 14400000,
                inResourceCalendar       : true,
                inTasksCalendar          : true,
                inTaskCalendarHash       : { 1 : true },
                inTask                   : 1
            },
            {
                startDate                : new Date(2011, 6, 4, 8, 0),
                endDate                  : new Date(2011, 6, 4, 12, 0),

                assignments              : [ assignment1 ],
                assignmentsHash          : { 1 : assignment1 },
                effectiveAssignments     : [ assignment1 ],
                effectiveAssignmentsHash : { 1 : assignment1 },
                effectiveTotalAllocation : 100,
                totalAllocation          : 100,
                totalAllocationMS        : 14400000,
                inResourceCalendar       : true,
                inTasksCalendar          : true,
                inTaskCalendarHash       : { 1 : true },
                inTask                   : 1
            },
            {
                startDate                : new Date(2011, 6, 4, 13, 0),
                endDate                  : new Date(2011, 6, 4, 17, 0),

                assignments              : [ assignment1 ],
                assignmentsHash          : { 1 : assignment1 },
                effectiveAssignments     : [ assignment1 ],
                effectiveAssignmentsHash : { 1 : assignment1 },
                effectiveTotalAllocation : 100,
                totalAllocation          : 100,
                totalAllocationMS        : 14400000,
                inResourceCalendar       : true,
                inTasksCalendar          : true,
                inTaskCalendarHash       : { 1 : true },
                inTask                   : 1
            }
        ],
        'Correct allocation information for Resource1 - w/o any empty intervals'
    );


})
