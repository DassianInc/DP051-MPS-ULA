describe('Each row should contain one task, 2 labels, 2 dependency terminal', function(t) {
    

    var taskStore = Ext.create("Gnt.data.TaskStore", {
        proxy       : 'memory',

        root        : {
            expanded    : true,

            children    : [
                {
                    Id          : 11,
                    Name        : 'Task1',
                    leaf        : false,
                    StartDate   : new Date(2011, 6, 1),
                    Duration    : 5,
                    expanded    : true,
                    children    : [
                        {
                            Id          : 1,
                            leaf        : true,
                            StartDate   : new Date(2011, 6, 1),
                            Duration    : 1
                        },
                        {
                            Id          : 2,
                            leaf        : true,
                            StartDate   : new Date(2011, 6, 5),
                            Duration    : 0
                        },
                        {
                            Id          : 3,
                            leaf        : true,
                            StartDate   : new Date(2011, 6, 5),
                            Duration    : 1
                        },
                        {
                            Id          : 4,
                            leaf        : true,
                            StartDate   : new Date(2011, 6, 6),
                            Duration    : 1
                        },
                        {
                            Id          : 5,
                            leaf        : true,
                            StartDate   : new Date(2011, 6, 6),
                            Duration    : 1
                        }
                    ]
                }
            ]
        }
    });


    var gantt               = t.getGantt({
        cascadeChanges          : true,
        startDate               : new Date(2011, 6, 1),
        endDate                 : new Date(2011, 6, 28),
        dependencyStore         : new Gnt.data.DependencyStore({
            data : [
                { From : 1, To : 2 },
                { From : 2, To : 3 },
                { From : 1, To : 4 },
                { From : 2, To : 5 }
            ]
        }),
        taskStore               : taskStore,
        renderTo                : Ext.getBody()
    });

    var schedulingView      = gantt.getSchedulingView()

    t.describe('Should not see any layouts as the result of a cascade operation', function(t) {

        t.waitForRowsVisible(gantt, function() {
            var countBefore     = t.getTotalLayoutCounter()
            
            t.wontFire(schedulingView, 'refresh', 'Should not trigger refresh for low amount of tasks')

            var before = t.getTotalLayoutCounter();

            taskStore.getNodeById(1).shift(Sch.util.Date.WEEK, 1);

            t.waitFor(100, function() {
                t.is(t.getTotalLayoutCounter(), before, 'Should not trigger any layouts due to the cascade');
            })
        })
    })
})
