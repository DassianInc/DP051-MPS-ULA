StartTest(function(t) {
    var setup = function () {
        var projectCalendar   = Ext.create('Gnt.data.calendar.BusinessTime', { 
            calendarId      : 'Project'
        });
        
        var calendar1   = Ext.create('Gnt.data.calendar.BusinessTime', {
            calendarId      : 'calendar1',
            parent          : 'Project'
        });
        
        var taskStore = Ext.create("Gnt.data.TaskStore", {
            calendar        : projectCalendar,
            
            proxy       : { type    : 'memory' },
            
            root        : {
                expanded    : false,
                
                children    : [
                    {
                        Id              : "Task1",
                        StartDate       : new Date(2011, 6, 4, 8, 0),
                        Duration        : 4,
                        DurationUnit    : 'h',
                        children        : 
                        [
                            {
                                Id              : "Task11",
		                        leaf            : true,
		                        StartDate       : new Date(2011, 6, 4, 8, 0),
		                        Duration        : 4,
		                        DurationUnit    : 'h'
                            }   
                        ]
                    },
                    // this task should not have any assignments!
                    // testing behavior of task w/o assignments
                    {
                        Id              : "Task2",
                        leaf            : true,
                        StartDate       : new Date(2011, 6, 4, 8, 0),
                        Duration        : 4,
                        DurationUnit    : 'h'
                    }
                ]
            }
        });
        
        return {
            projectCalendar : projectCalendar,
            calendar1       : calendar1,
            taskStore       : taskStore
        }
    }
    
    t.it('Should set calendar to subgroup', function (t) {
        with (setup()) {
	        var task1   = taskStore.getNodeById("Task1");
	        var task11  = taskStore.getNodeById("Task11");
	        
	        t.is(task1.getCalendar(), projectCalendar, 'Initial calendar is correct');
            t.is(task11.getCalendar(), projectCalendar, 'Initial calendar is correct');
            
            task1.setCalendar(calendar1);
            
            t.is(task11.getCalendar(), calendar1, 'Calendar set to subgroup');
        }
    });
})    
