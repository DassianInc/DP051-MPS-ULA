StartTest(function(t) {
    
    var calendar1       = new Gnt.data.Calendar({
        proxy   : {
            type        : 'memory',
            reader      : { type    : 'json' },
            
            data        : [
                {
                    Date    : '2013-02-08'
                }
            ]
        }
    })
    
    var taskStore       = t.getTaskStore({
        DATA                : [
            {
                Id              : 'Task1',
                leaf            : true,
                StartDate       : "2013-02-04",
                Duration        : 5,
                
                CalendarId      : 'calendar1'
            },
            
            {
                Id              : 'Task2',
                leaf            : true,
                StartDate       : "2013-02-04",
                Effort          : 24 * 5, // full week for a single resource
                
                SchedulingMode  : 'EffortDriven'
            }
        ],
        dependencyStore     : t.getDependencyStore({ 
            data    : [
            ] 
        }),
        resourceStore       : new Gnt.data.ResourceStore({
            data    : [
                {
                    Id          : 'Resource1',
                    CalendarId  : 'calendar1'
                }
            ]
        }),
        assignmentStore     : new Gnt.data.AssignmentStore({
            data    : [
                {
                    ResourceId  : 'Resource1',
                    TaskId      : 'Task2',
                    Units       : 100
                }
            ]
        })
    });
    
    var task1           = taskStore.getNodeById('Task1');
    var task2           = taskStore.getNodeById('Task2');
    
    var resource1       = taskStore.resourceStore.getById('Resource1')
    
    t.isStartEnd(task1, new Date(2013, 1, 4), new Date(2013, 1, 9), 'Task1 has expected start/end dates');
    t.isStartEnd(task2, new Date(2013, 1, 4), new Date(2013, 1, 9), 'Task2 has expected start/end dates');
    
    calendar1.load()
    
    t.isStartEnd(task1, new Date(2013, 1, 4), new Date(2013, 1, 9), 'Loading of the calendar does not affect anything as calendar has no `calendarId` yet');
    t.isStartEnd(task2, new Date(2013, 1, 4), new Date(2013, 1, 9), 'Loading of the calendar does not affect anything as calendar has no `calendarId` yet');
    
    calendar1.setCalendarId('calendar1')
    
    t.isStartEnd(task1, new Date(2013, 1, 4), new Date(2013, 1, 12), 'After calendar1 has occuried its `calendarId`, task1 was adjusted accordingly');
    t.isStartEnd(task2, new Date(2013, 1, 4), new Date(2013, 1, 12), 'After calendar1 has occuried its `calendarId`, task2 was adjusted accordingly');
    
})    
