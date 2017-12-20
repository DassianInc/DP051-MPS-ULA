StartTest(function(t) {
    t.diag("Setting up the data")
    
    var resourceStore       = Ext.create("Gnt.data.ResourceStore", {
        data    : [
            { "Id" : 1, "Name" : "Mats",     "CalendarId" : "Project" },
            { "Id" : 2, "Name" : "Nickolay", "CalendarId" : "Res1" }
        ]
    });

    var assignmentStore = Ext.create("Gnt.data.AssignmentStore", {
        resourceStore   : resourceStore
    });

    var calendar = Ext.create('Gnt.data.calendar.BusinessTime', {
        calendarId      : 'Project'
    });
    
    var res1    = Ext.create('Gnt.data.calendar.BusinessTime', {
        calendarId      : 'Res1',
        
        defaultAvailability : [ '08:00-12:00' ]
    });

    var taskStore = Ext.create("Gnt.data.TaskStore", {
        calendar            : calendar,
        
        resourceStore       : resourceStore,
        assignmentStore     : assignmentStore,

        proxy       : {
            type        : 'memory',
            reader      : { type : 'json' },
            data        : [
                {
                    Id          : 1,
                    leaf        : true,
                    
                    Name        : "Task1",
                    
                    StartDate   : new Date(2011, 6, 4, 8, 0),
                    EndDate     : new Date(2011, 6, 4, 17, 0),
                    
                    Effort      : 8,
                     
                    SchedulingMode  : 'DynamicAssignment'
                }
            ]
        }
    });
    
    taskStore.load()

    var task            = taskStore.getNodeById(1)
    
    t.is(task.getDuration(), 1, "Initial duration is 1 day")
    
    task.setStartDate(task.getStartDate(), true)
    t.is(task.getEndDate(), new Date(2011, 6, 4, 17, 0), "End date is still the same")
    
    task.assign(resourceStore.getById(2))
    
    t.is(task.getDuration(), 1, "Duration is still the same")
    
    task.setStartDate(task.getStartDate(), true)
    t.is(task.getEndDate(), new Date(2011, 6, 4, 17, 0), "End date is still the same")
    
    task.assign(resourceStore.getById(1))
    
    t.is(task.getDuration(), 1, "Duration is still the same")
    
    task.setStartDate(task.getStartDate(), true)
    t.is(task.getEndDate(), new Date(2011, 6, 4, 17, 0), "End date is still the same")
    
})    
