StartTest(function(t) {
    
    //======================================================================================================================================================================================================================================================
    t.diag('Setup')
    
    var calendar1   = Ext.create('Gnt.data.calendar.BusinessTime', {
        calendarId      : 'Calendar1',
        
        data    : [
            {
                Date            : new Date(2013, 2, 1)
            }
        ]
    })
    
    var resourceStore   = Ext.create("Gnt.data.ResourceStore", {
        proxy       : { type    : 'memory', reader  : { type    : 'json' } },
        
        data    : [
            {
                Id          : 'Resource1',
                CalendarId  : 'Calendar1'
            }
        ]
    });
    
    var assignmentStore   = Ext.create("Gnt.data.AssignmentStore", {
        proxy       : { type    : 'memory', reader  : { type    : 'json' } },
        data        : [
            {
                "Id"            : "Assignment1",
                "TaskId"        : "Task1",
                "ResourceId"    : 'Resource1',
                "Units"         : 100
            }
        ]
    });

    var taskStore = Ext.create("Gnt.data.TaskStore", {
        resourceStore               : resourceStore,
        assignmentStore             : assignmentStore,
        calendar                    : calendar1,
        
        proxy       : { type    : 'memory', reader  : { type    : 'json' } },
        
        root        : {
            expanded    : true,
            
            children    : [
                {
                    Id              : "Task1",
                    leaf            : true,
                    StartDate       : new Date(2012, 6, 2, 14, 0),
                    Duration        : 4,
                    DurationUnit    : 'h',
                    
                    CalendarId      : 'Calendar1'
                }
            ]
        }
    });
    
    var task1       = taskStore.getNodeById('Task1')
    
    t.is(task1.skipNonWorkingTime(new Date(2013, 2, 1), true), new Date(2013, 2, 4, 8), "The `forEachAvailabilityIntervalWithResources` iterator worked correctly")
    t.is(task1.skipNonWorkingTime(new Date(2013, 2, 4), true), new Date(2013, 2, 4, 8), "The `forEachAvailabilityIntervalWithResources` iterator worked correctly")
    
    t.is(task1.skipNonWorkingTime(new Date(2013, 2, 4, 20), false), new Date(2013, 2, 4, 17), "The `forEachAvailabilityIntervalWithResources` iterator worked correctly - backward")
    t.is(task1.skipNonWorkingTime(new Date(2013, 2, 4), false), new Date(2013, 1, 28, 17), "The `forEachAvailabilityIntervalWithResources` iterator worked correctly - backward")
})    
