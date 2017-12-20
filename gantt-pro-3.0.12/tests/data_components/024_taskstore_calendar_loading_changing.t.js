StartTest(function(t) {
    
    var calendar        = new Gnt.data.Calendar({
        proxy   : {
            type        : 'ajax',
            url         : 'data_components/022_calendar_loading.t.json',
            method      : 'GET',
            reader      : {
                type    : 'json'
            }
        }
    })
    
    var calendar2       = new Gnt.data.Calendar({
        calendarId      : "calendar2",
        
        data            : [
            {
                Date        : new Date(2011, 8, 1)
            }
        ]
    })
    
    var calendar3       = new Gnt.data.Calendar({
        calendarId      : "calendar3"
    })
    
    var calendar4       = new Gnt.data.Calendar({
        calendarId      : "calendar4",
        
        data            : [
            {
                Date        : new Date(2011, 8, 1)
            }
        ]
    })    

    var calendar5       = new Gnt.data.Calendar({
        calendarId      : "calendar5"
    })

    var taskStore       = t.getTaskStore({
        DATA                : [
            {
                Id              : 1,
                leaf            : true,
                StartDate       : "2011-09-01",
                Duration        : 2
            },
            
            {
                Id              : 2,
                leaf            : true,
                StartDate       : "2011-08-30",
                Duration        : 2
            },
            {
                Id              : 3,
                leaf            : true,
                StartDate       : "2011-09-01",
                Duration        : 2
            },
            
            {
                Id              : 4,
                leaf            : true,
                StartDate       : "2011-08-31",
                Duration        : 3,
                
                CalendarId      : "calendar3"
            },
            
            {
                Id              : 5,
                leaf            : true,
                StartDate       : "2011-09-01",
                Effort          : 48,
                
                SchedulingMode  : 'EffortDriven'
            },
            
            {
                Id              : 6,
                leaf            : true,
                StartDate       : "2011-09-01",
                Duration        : 2,
                
                CalendarId      : "calendar5"
            }
            
        ],
        dependencyStore     : t.getDependencyStore({ 
            data    : [
                {
                    From        : 2,
                    To          : 3
                }
            ] 
        }),
        resourceStore       : new Gnt.data.ResourceStore({
            data    : [
                {
                    Id          : 'Resource1',
                    CalendarId  : 'calendar5'
                }
            ]
        }),
        assignmentStore     : new Gnt.data.AssignmentStore({
            data    : [
                {
                    ResourceId  : 'Resource1',
                    TaskId      : 5,
                    Units       : 100
                }
            ]
        }),
        calendar            : calendar
    });

    var task1           = taskStore.getNodeById(1);
    var task3           = taskStore.getNodeById(3);
    var task4           = taskStore.getNodeById(4);
    var task5           = taskStore.getNodeById(5);
    var task6           = taskStore.getNodeById(6);
    
    var resource1       = taskStore.resourceStore.getById('Resource1')
    
    // 2011-09-02 Friday is marked as non-working day in the calendar, but calendar is not yet loaded
    t.is(task1.getEndDate(), new Date(2011, 8, 3), 'Task1 ends on 2011-09-03');
    t.is(task3.getEndDate(), new Date(2011, 8, 3), 'Task3 ends on 2011-09-03');
    t.is(task4.getEndDate(), new Date(2011, 8, 3), 'Task4 ends on 2011-09-03');
    t.isStartEnd(task5, new Date(2011, 8, 1), new Date(2011, 8, 3), 'Task5 ends on 2011-09-03');
    t.is(task6.getEndDate(), new Date(2011, 8, 3), 'Task6 ends on 2011-09-03');
    
    // calendar is subclass of store so we can use "loadStoresAndThen"
    // loading of the "calendar" should adjust the end dates of the following tasks, since for them "calendar" is a project calendar
    t.loadStoresAndThen(calendar, function () {
        
        t.is(task1.getEndDate(), new Date(2011, 8, 6), 'Task1 now ends on 2011-09-06');
        t.is(task3.getEndDate(), new Date(2011, 8, 6), 'Task3 now ends on 2011-09-06');
        t.is(task4.getEndDate(), new Date(2011, 8, 3), 'Task4 still ends on 2011-09-03 because it has different calendar');
        t.isStartEnd(task5, new Date(2011, 8, 1), new Date(2011, 8, 3), 'Task5 still ends on 2011-09-03 because it has different scheduling mode and calendar');
        t.is(task6.getEndDate(), new Date(2011, 8, 3), 'Task6 still ends on 2011-09-03 because it has different calendar');
        
        // updating the calendar of task6 and resource1 - should reflect in the task6 and task5 end date
        calendar5.add({
            Date        : new Date(2011, 8, 2)
        })
        
        t.isStartEnd(task5, new Date(2011, 8, 1), new Date(2011, 8, 6), 'Task5 now ends on 2011-09-06, since Friday is a non-working day now for Resource1');
        t.is(task6.getEndDate(), new Date(2011, 8, 6), 'Task6 now ends on 2011-09-06');
        
        // updating project calendar - for tasks w/o explicitly specified calendar
        calendar.removeAll();
        
        t.is(task1.getEndDate(), new Date(2011, 8, 3), 'Task1 ends on 2011-09-03 after clearing the calendar store');
        t.is(task3.getEndDate(), new Date(2011, 8, 3), 'Task3 ends on 2011-09-03 after clearing the calendar store');
        
        taskStore.setCalendar(calendar2);
        
        t.is(task1.getStartDate(), new Date(2011, 8, 2), 'Task1 start bumped to 2011-09-02 after switching the calendar of the task store');
        t.is(task3.getStartDate(), new Date(2011, 8, 2), 'Task3 start bumped to 2011-09-02 after switching the calendar of the task store');
        t.is(task5.getEndDate(), new Date(2011, 8, 6), 'Task5 still ends on 2011-09-06 - should not be affected by project calendar');
        
        task4.setCalendar('calendar4')
        
        t.is(task4.getStartDate(), new Date(2011, 7, 31));
        t.is(task4.getEndDate(), new Date(2011, 8, 6), 'Task4 now ends on 2011-09-06');
        
        // removing all overrides from calendar4 - task should end on Friday normally now
        // but the "calendar2" (which is a "project calendar" still has the override for 2011/09/01 so next assertion will verify
        // that task is listening to updates from its calendar
        calendar4.removeAll()
        
        t.is(task4.getEndDate(), new Date(2011, 8, 3), 'Task4 now ends on 2011-09-03 - no overrides in calendar4');
        
        resource1.setCalendar('calendar3')
        
        t.is(task5.getEndDate(), new Date(2011, 8, 3), 'Task5 now ends on 2011-09-03 - no overrides in calendar3');
    })
})    
