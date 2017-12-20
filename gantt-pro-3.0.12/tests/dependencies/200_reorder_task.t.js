StartTest(function(t) {
    
    var getDataSet = function () {
        var dependencyStore = Ext.create("Gnt.data.DependencyStore", {
            proxy       : {
                type    : 'memory',
                reader  : {
                    type    : 'json'
                }
            },
            
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
            cascadeDelay : 0, 
            proxy       : {
                type    : 'memory',
                reader  : {
                    type    : 'json'
                }
            },
            
            root        : {
                expanded    : false,
                
                children    : [
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
                    }
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
        startDate   : new Date(2011, 6, 1),
        endDate   : new Date(2011, 6, 28),
        taskStore   : taskStore,
        lockedViewConfig: {
            plugins: {
                ptype: 'treeviewdragdrop'
            }
        },
        dependencyStore : dependencyStore,
        renderTo : Ext.getBody()
    });
    
    
    t.waitForTasksAndDependenciesToRender(gantt, function() {
        var depView = gantt.getSchedulingView().getDependencyView(),
            count = depView.getDependencyElements().getCount();

        t.isGreater(count, 0, 'Some dependencies rendered');
        t.is(dependencyStore.getCount(), 1, '1 dependency in store');

        t.dragTo(t.getFirstCell(gantt.lockedGrid), t.getCell(gantt.lockedGrid, 1, 0), function() {
            t.is(dependencyStore.getCount(), 1, '1 dependency in store');
            t.isGreater(depView.getDependencyElements().getCount(), 0, '1 dependency rendered');
        });
    })
})    
