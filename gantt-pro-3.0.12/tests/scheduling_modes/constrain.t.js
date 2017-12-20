StartTest(function(t) {
    
    //======================================================================================================================================================================================================================================================
    t.diag('Setup')
    
    var projectCalendar   = Ext.create('Gnt.data.calendar.BusinessTime', { 
        calendarId      : 'Project'
    })
    
    var calendar1   = Ext.create('Gnt.data.calendar.BusinessTime', {
        calendarId      : 'Resource1',
        
        parent          : 'Project',
        
        data    : [
            {
                Date            : new Date(2012, 6, 2),
                IsWorkingDay    : true,
                Availability    : [ '08:00-12:00', '14:00-18:00' ]
            },
            {
                Date            : new Date(2012, 6, 3),
                IsWorkingDay    : true,
                Availability    : [ '08:00-12:00', '14:00-18:00' ]
            }
        ]
    })
    
    var resourceStore   = Ext.create("Gnt.data.ResourceStore", {
        proxy       : { type    : 'memory', reader  : { type    : 'json' } },
        
        data    : [
            {
                Id          : 'Resource1',
                Name        : 'Resource1',
                CalendarId  : 'Resource1'
            }
        ]
    });

    var assignmentStore   = Ext.create("Gnt.data.AssignmentStore", {
        proxy       : { type    : 'memory', reader  : { type    : 'json' } },
        data        : [
            {
                "Id"            : "Assignment1",
                "TaskId"        : "TaskA",
                "ResourceId"    : 'Resource1',
                "Units"         : 100
            },
            {
                "Id"            : "Assignment2",
                "TaskId"        : "TaskB",
                "ResourceId"    : 'Resource1',
                "Units"         : 100
            }
        ]
    });
    
    var dependencyStore = Ext.create("Gnt.data.DependencyStore");    
    
    var taskStore = Ext.create("Gnt.data.TaskStore", {
        resourceStore   : resourceStore,
        assignmentStore : assignmentStore,
        dependencyStore : dependencyStore,
        calendar        : projectCalendar,
        
        cascadeChanges              : true,
        skipWeekendsDuringDragDrop  : true,
        
        proxy       : { type    : 'memory', reader  : { type    : 'json' } },
        
        root        : {
            expanded    : false,
            
            children    : [
                {
                    Id              : "TaskA",
                    leaf            : true,
                    StartDate       : new Date(2012, 6, 2, 14, 0),
                    Duration        : 4,
                    DurationUnit    : 'h'
                },
                {
                    Id              : "TaskB",
                    leaf            : true,
                    StartDate       : new Date(2012, 6, 2, 8, 0),
                    Duration        : 4,
                    DurationUnit    : 'h'
                }
            ]
        }
    });

    //======================================================================================================================================================================================================================================================
    t.diag('Adding dependency between tasks - should re-schedule the TaskB to the next day')
    
    dependencyStore.add({
        From        : 'TaskA',
        To          : 'TaskB',
        Type        : 2
    })
    
    var taskB   = taskStore.getNodeById("TaskB");
    
    t.is(taskB.getStartDate(), new Date(2012, 6, 3, 8), 'Adding dependency re-scheduled the task to the next earliest available time - next day')
})    
