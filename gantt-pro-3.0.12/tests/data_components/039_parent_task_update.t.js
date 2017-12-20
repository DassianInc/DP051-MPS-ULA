StartTest(function(t) {
    
    // TODO
    return;

    var getDataSet = function () {
        var dependencyStore = Ext.create("Gnt.data.DependencyStore",{
            data : [
            // 2 child tasks link to a task on the root level
            {
                From : 111,
                To   : 112,
                Type : 2
            },
            {
                From : 112,
                To   : 2,
                Type : 2
            },
            {
                From : 112,
                To   : 2,
                Type : 2
            }]
        });
    
        var taskStore = Ext.create("Gnt.data.TaskStore", {
            dependencyStore : dependencyStore,
            
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
                        StartDate   : new Date(2011, 6, 4),
                        EndDate     : new Date(2011, 6, 8),
                        children    : [
                            {
                                Id          : 11,
                                StartDate   : new Date(2011, 6, 4),
                                EndDate     : new Date(2011, 6, 8),
                                children    : [
                                    {
                                        Id          : 111,
                                        StartDate   : new Date(2011, 6, 4),
                                        EndDate     : new Date(2011, 6, 6)
                                    },
                                    {
                                        Id          : 112,
                                        StartDate   : new Date(2011, 6, 6),
                                        EndDate     : new Date(2011, 6, 9)
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        Id          : 2,
                        StartDate   : new Date(2011, 6, 9),
                        EndDate     : new Date(2011, 6, 12)
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
    
    var parent = taskStore.getNodeById(11);

    // Move parent 1 day forward
    parent.setStartDate(new Date(2011, 6, 5));

    t.is(parent.getStartDate(), new Date(2011, 6, 5), 'Parent has correct new start date');
    t.is(parent.getEndDate(), new Date(2011, 6, 12), 'Parent has correct new start date');
    
    t.is(parent.firstChild.getStartDate(), new Date(2011, 6, 5), '1st child has correct new start date');
    t.is(parent.firstChild.getEndDate(), new Date(2011, 6, 7), '1st child has correct new end date');
    t.is(parent.lastChild.getStartDate(), new Date(2011, 6, 7), '2nd child has correct new start date');
    t.is(parent.lastChild.getEndDate(), new Date(2011, 6, 12), '2nd child has correct new end date');
    
    t.is(taskStore.getNodeById(2).getStartDate(), new Date(2011, 6, 11), 'Linked task of parent child has correct new start date');
    t.is(taskStore.getNodeById(2).getEndDate(), new Date(2011, 6, 13), 'Linked task of parent child has correct new end date');
    
    t.is(taskStore.getNodeById(1).getStartDate(), new Date(2011, 6, 5), 'Parent of parent has correct new start date');
    t.is(taskStore.getNodeById(1).getEndDate(), new Date(2011, 6, 12), 'Parent of parent has correct new end date');

})    
