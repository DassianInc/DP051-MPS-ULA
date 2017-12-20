StartTest(function(t) {
    
    var getDataSet = function () {
        var dependencyStore = Ext.create("Gnt.data.DependencyStore", {
            data    : [
                {
                    From        : 1,
                    To          : 2,
                    Type        : 2
                }
            ]
        });
    
        var taskStore = Ext.create("Gnt.data.TaskStore", {
            dependencyStore : dependencyStore,
            cascadeDelay    : 0,
            proxy           : 'memory',
            root            : {
                expanded    : false,
                
                children    : [
                    {},{},{},{},{},{},
                    {
                        Id          : 1,
                        leaf        : true,
                        StartDate   : new Date(2011, 6, 1),
                        EndDate     : new Date(2011, 6, 5)
                    },
                    {
                        Id          : 2,
                        leaf        : true,
                        StartDate   : new Date(2011, 6, 5),
                        EndDate     : new Date(2011, 6, 20)
                    },
                    {},{},{},{},{},{},{}
                ]
            }
        });
        
        return {
            taskStore       : taskStore,
            dependencyStore : dependencyStore
        }
    }
    
    var dataSet             = getDataSet()
    var taskStore           = dataSet.taskStore
    var dependencyStore     = dataSet.dependencyStore
    
    var gantt               = t.getGantt({
        height                  : 200,
        width                   : 600,
        
        startDate               : new Date(2011, 6, 1),
        endDate                 : new Date(2011, 6, 28),
        
        dependencyStore         : dependencyStore,
        taskStore               : taskStore,
        cascadeChanges          : true,
        
        renderTo                : Ext.getBody(),
        lockedGridConfig        : { width : 100 }
    });
    
    var schedView   = gantt.getSchedulingView();
    var lockedView  = gantt.lockedGrid.getView();

    var schedOriginalScroll, lockedOriginalScroll
    
    t.chain(
        { waitFor : 'rowsVisible' },
        
        function(next) {
            // Make sure normalGrid layout is still fit (#239 in Assembla)
            t.is(gantt.normalGrid.layout.type, 'fit', 'fit layout used for SchedulerGrid');
            
            t.wontFire(schedView, 'refresh', "View fires no refresh for low number of changed tasks");

            schedView.el.scrollTo('left', 10);
            schedView.el.scrollTo('top', 10);
            lockedView.el.scrollTo('left', 10);
            lockedView.el.scrollTo('top', 10);
        
            schedOriginalScroll     = schedView.el.getScroll();
            lockedOriginalScroll    = lockedView.el.getScroll();
            next();
        },

        { waitFor : 100 },

        function(next) {
            taskStore.getNodeById(1).setStartDate(new Date(2011, 5, 1), false);
            taskStore.getNodeById(1).setEndDate(new Date(2011, 6, 11), false);
            
            next();
        },

        { waitFor : 100 },
        
        function(next) {
            t.isDeeply(schedView.el.getScroll(), schedOriginalScroll, 'Scheduling view scroll position not changed after cascade');
            t.isDeeply(lockedView.el.getScroll(), lockedOriginalScroll, 'Locked view scroll position not changed after cascade');
            next();
        }
    )
})    
