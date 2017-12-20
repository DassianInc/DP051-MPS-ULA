StartTest(function(t) {

    // Checks that histogram gets timespan based on task store data (if not specified) #1528

    var resourceStore   = t.getResourceStore({
        data: [
            { Id: 'r1', Name: 'Mike' },
            { Id: 'r2', Name: 'Linda', CalendarId : 'custom' }
        ]
    });

    var calendar        = t.getBusinessTimeCalendar();

    var customCalendar  = t.getBusinessTimeCalendar({
        calendarId  : 'custom',
        data        : [
            {
                Date            : new Date(2013, 3, 4),
                Availability    : [ '09:00-13:00' ]
            }
        ]
    });

    var assignmentStore = t.getAssignmentStore({
        data: [
            { Id: 'a1', ResourceId: 'r1', TaskId : 1, Units : 50 },
            { Id: 'a2', ResourceId: 'r1', TaskId : 2 },
            { Id: 'a3', ResourceId: 'r2', TaskId : 3 },
            { Id: 'a4', ResourceId: 'r2', TaskId : 4 }
        ]
    });

    var dependencyStore = t.getDependencyStore();

    var taskStore       = t.getTaskStore({
        resourceStore   : resourceStore,
        assignmentStore : assignmentStore,
        dependencyStore : dependencyStore,
        calendar        : calendar,
        cascadeChanges  : true,
        DATA            : [
            {
                Id              : 1,
                leaf            : true,
                Name            : "Task1",
                StartDate       : new Date(2013, 3, 2, 8),
                Duration        : 4
            }
        ]
    });

    var histogram       = new Gnt.panel.ResourceHistogram({
        taskStore           : taskStore,
        resourceStore       : resourceStore,
        assignmentStore     : assignmentStore
    });

    t.is(histogram.getStart(), new Date(2013, 3, 1), 'proper start date'); // set based on task #1 start floored to week start
    t.is(histogram.getEnd(), new Date(2013, 3, 8), 'proper end date'); // set based on task #1 end rounded to week start
});
