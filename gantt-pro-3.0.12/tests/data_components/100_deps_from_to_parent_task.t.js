StartTest(function(t) {
    // hint: to understand what's going on in the tests you need to actually draw the tasks with dates on paper

    t.it('Move parent and cascade to outside of that parent. Also recalculate the parent of the parent being moved', function (t) {
        var taskStore       = t.getAllStoresDataSet(
            [
                {
                    Id          : 10,
                    StartDate   : new Date(2013, 8, 2),
                    Duration    : 2,
                    children    : [
                        {
                            Id          : 11,
                            leaf        : true,
                            StartDate   : new Date(2013, 8, 2),
                            Duration    : 1
                        },
                        {
                            Id          : 12,
                            leaf        : true,
                            StartDate   : new Date(2013, 8, 3),
                            Duration    : 1
                        }
                    ]
                },
                {
                    Id          : 20,
                    StartDate   : new Date(2013, 8, 5),
                    Duration    : 2,
                    children    : [
                        {
                            Id          : 21,
                            leaf        : true,
                            StartDate   : new Date(2013, 8, 5),
                            Duration    : 1
                        },
                        {
                            Id          : 22,
                            leaf        : true,
                            StartDate   : new Date(2013, 8, 6),
                            Duration    : 1
                        }
                    ]
                },
                {
                    Id          : 30,
                    leaf        : true,
                    StartDate   : new Date(2013, 8, 9),
                    Duration    : 1
                }
            ],
            [
                {
                    From        : 10,
                    To          : 20
                },
                {
                    From        : 22,
                    To          : 30
                }
            ]
        ).taskStore
        
        var id         = function (id) { return taskStore.getNodeById(id) }
        
        id(10).setStartDate(new Date(2013, 8, 4), true, true)
        
        t.isStartEnd(id(10), new Date(2013, 8, 4), new Date(2013, 8, 6))
        t.isStartEnd(id(11), new Date(2013, 8, 4), new Date(2013, 8, 5))
        t.isStartEnd(id(12), new Date(2013, 8, 5), new Date(2013, 8, 6))
        
        t.isStartEnd(id(20), new Date(2013, 8, 6), new Date(2013, 8, 10))
        t.isStartEnd(id(21), new Date(2013, 8, 6), new Date(2013, 8, 7))
        t.isStartEnd(id(22), new Date(2013, 8, 9), new Date(2013, 8, 10))
        
        t.isStartEnd(id(30), new Date(2013, 8, 10), new Date(2013, 8, 11))
    })
    
    

});
