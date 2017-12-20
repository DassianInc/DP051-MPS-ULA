StartTest(function(t) {
    // hint: to understand what's going on in the tests you need to actually draw the tasks with dates on paper
    // or visualize it with gantt panel

    // in this test we'll verify that gantt does not stuck on cycles in depedencies - either direct or indirect
    t.it('Direct cycles should not break us', function (t) {
        with (t.getAllStoresDataSet(
            [
                {
                    Id          : 1,
                    children    : [
                        {
                            Id          : 11,
                            leaf        : true,
                            StartDate   : new Date(2013, 11, 1),
                            Duration    : 1
                        },
                        {
                            Id          : 12,
                            leaf        : true,
                            StartDate   : new Date(2013, 11, 1),
                            Duration    : 1
                        }
                    ]
                },
                {
                    Id          : 20,
                    children    : [
                        {
                            Id          : 21,
                            leaf        : true,
                            StartDate   : new Date(2013, 11, 1),
                            Duration    : 1
                        }
                    ]
                }
            ],
            [
                {
                    Id          : 'd1',
                    From        : 11,
                    To          : 12
                },
                {
                    Id          : 'd2',
                    From        : 12,
                    To          : 21
                },
                {
                    Id          : 'd3',
                    From        : 21,
                    To          : 11
                }
            ]
        )) {
            id(1).setStartDate(new Date(2013, 11, 2))
            
            t.pass("Cycle did not break everything")
        }
    })
    
    
    t.it('Indirect cycles should not break us', function (t) {
        with (t.getAllStoresDataSet(
            [
                {
                    Id          : 1,
                    StartDate   : new Date(2013, 11, 1),
                    Duration    : 1,
                    children    : [
                        {
                            Id          : 11,
                            leaf        : true,
                            StartDate   : new Date(2013, 11, 1),
                            Duration    : 1
                        }
                    ]
                },
                {
                    Id          : 2,
                    StartDate   : new Date(2013, 11, 1),
                    Duration    : 1,
                    children    : [
                        {
                            Id          : 22,
                            leaf        : true,
                            StartDate   : new Date(2013, 11, 1),
                            Duration    : 1
                        }
                    ]
                }
            ],
            [
                {
                    Id          : 'd1',
                    From        : 11,
                    To          : 2
                },
                {
                    Id          : 'd2',
                    From        : 22,
                    To          : 1
                }
            ]
        )) {
            id(1).setStartDate(new Date(2013, 11, 2))
            
            t.pass("Cycle did not break everything")
        }
    })

});
