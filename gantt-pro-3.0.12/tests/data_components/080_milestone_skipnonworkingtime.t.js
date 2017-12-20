StartTest(function(t) {

    var getDataSet = function () {
        var dependencyStore = Ext.create("Gnt.data.DependencyStore", {
            data    : [
            ]
        });


        var taskStore = Ext.create("Gnt.data.TaskStore", {
            dependencyStore     : dependencyStore,
            cascadeChanges      : true,
            cascadeDelay        : 0,

            root        : {
                expanded    : false,

                children    : [
                    {
                        Id          : 1,
                        leaf        : true,
                        StartDate   : new Date(2013, 6, 25),
                        EndDate     : new Date(2013, 6, 25)
                    },
                    {
                        Id          : 2,
                        leaf        : true,
                        Duration    : 0
                    }
                ]
            }
        });

        return {
            taskStore       : taskStore,
            dependencyStore : dependencyStore
        }
    }
    
    t.it('Setting start date of the milestone should skip the non-working time in backward direction', function (t) {
        var taskStore       = getDataSet().taskStore
        var task1           = taskStore.getNodeById(1)
        
        task1.setStartDate(new Date(2013, 6, 28), true, true)
        
        t.isStartEnd(task1, new Date(2013, 6, 27), new Date(2013, 6, 27), 'Non-working time skipped backward')
    })

});
