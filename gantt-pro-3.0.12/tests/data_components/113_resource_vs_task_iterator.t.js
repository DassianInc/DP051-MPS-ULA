StartTest(function(t) {

    // Here we check that both task and resource iterators enumerate same set of intervals #1482

    var projectCalendar     = Ext.create('Gnt.data.calendar.BusinessTime', {
        calendarId          : 'project',
        defaultAvailability : ['00:00-06:00', '22:00-24:00']
    });

    Ext.create('Gnt.data.calendar.BusinessTime', {
        calendarId          : 'task2',
        defaultAvailability : ['03:00-09:00', '22:00-24:00']
    });

    Ext.create('Gnt.data.calendar.BusinessTime', {
        calendarId          : 'r1'
    });

    Ext.create('Gnt.data.calendar.BusinessTime', {
        calendarId          : 'r2'
    });

    var resourceStore   = t.getResourceStore({
        data: [
            { Id: 'r1', Name: 'Mike', CalendarId: 'r1' },
            { Id: 'r2', Name: 'Linda', CalendarId: 'r2' }
        ]
    });

    var assignmentStore = t.getAssignmentStore({
        data: [
            { Id: 'a1', ResourceId: 'r1', TaskId : 1, Units : 50 },
            { Id: 'a2', ResourceId: 'r2', TaskId : 2, Units : 50 }
        ]
    });

    var taskStore = t.getTaskStore({
        calendar        : projectCalendar,
        resourceStore   : resourceStore,
        assignmentStore : assignmentStore,
        DATA            : [
            {
                Id              : 1,
                Name            : 'task1',
                leaf            : true,
                StartDate       : new Date(2010, 0, 18),
                Duration        : 3
            },
            {
                Id              : 2,
                Name            : 'task2',
                leaf            : true,
                StartDate       : new Date(2010, 0, 18),
                Duration        : 3,
                CalendarId      : 'task2'
            }
        ]
    });

    t.it('Task "task1" and resource "r1" availability iterators enumerate same intervals', function (t) {

        // In this case effective intervals are calculated based on resource "r1" calendar only
        // Since "task1" has no an assigned calendar

        var task        = taskStore.getNodeById(1),
            resource    = resourceStore.getById('r1');

        var taskIntervals       = [],
            resourceIntervals   = [];

        task.forEachAvailabilityInterval({
            startDate   : task.getStartDate(),
            endDate     : task.getEndDate(),
            resources   : true
        }, function (from, till) {
            taskIntervals.push([ from - 0, till - 0 ]);
        });

        resource.forEachAvailabilityIntervalWithTasks({
            startDate   : task.getStartDate(),
            endDate     : task.getEndDate()
        }, function (from, till) {
            resourceIntervals.push([ from - 0, till - 0 ]);
        });

        t.isDeeply(taskIntervals, resourceIntervals, 'proper set of intervals given by "task1" and "r1" iterators');
    });

    t.it('Task "task2" and resource "r2" availability iterators enumerate same intervals', function (t) {

        // In this case effective intervals are calculated based on intersection of resource "r1" calendar and "task2" calendar.

        var task        = taskStore.getNodeById(2),
            resource    = resourceStore.getById('r2');

        var taskIntervals       = [],
            resourceIntervals   = [];

        task.forEachAvailabilityInterval({
            startDate   : task.getStartDate(),
            endDate     : task.getEndDate(),
            resources   : true
        }, function (from, till) {
            taskIntervals.push([ from - 0, till - 0 ]);
        });

        resource.forEachAvailabilityIntervalWithTasks({
            startDate   : task.getStartDate(),
            endDate     : task.getEndDate()
        }, function (from, till) {
            resourceIntervals.push([ from - 0, till - 0 ]);
        });

        t.isDeeply(taskIntervals, resourceIntervals, 'proper set of intervals given by "task2" and "r2" iterators');
    });
});
