StartTest(function (t) {

    var taskStore = Ext.create("Gnt.data.TaskStore", {
        root        : {
            expanded        : true,
            children        : [
                {
                    Id   : 1,
                    leaf : true
                },
                {
                    Id       : 2,
                    Duration : 0,
                    leaf     : true
                },
                {
                    Id : 3,

                    children : [
                        {
                            Id          : 4,
                            StartDate   : new Date(2013, 1, 1),
                            Duration    : 2,
                            PercentDone : 50,
                            leaf        : true
                        },
                        {
                            Id          : 5,
                            StartDate   : new Date(2013, 1, 15),
                            Duration    : 5,
                            PercentDone : 20,
                            leaf        : true
                        }
                    ]
                },
                {
                    Id : 6,

                    children : [
                        {
                            Id : 7,

                            children : [
                                {
                                    Id : 8,

                                    children : [
                                        {
                                            Id       : 9,
                                            Duration : 10,
                                            leaf     : true
                                        },
                                        {
                                            Id       : 10,
                                            Duration : 10,
                                            leaf     : true
                                        }
                                    ]
                                }
                                // eof 8
                            ]
                        }
                        // eof 7
                    ]
                }
                // eof 6
            ]
        }
    });

    t.it('Sanity', function (t) {

        var root = taskStore.getRootNode()
        var getNode = function (id) {
            return taskStore.getNodeById(id)
        }

        t.isApprox(getNode(3).getPercentDone(), 2 / 7 * 100, 0.00001, 'Initial effort is normalized')
        t.isApprox(root.getPercentDone(), (1 + 1) / (2 + 5 + 10 + 10) * 100, 0.00001, 'Initial effort is normalized')

        getNode(10).setPercentDone(10)

        t.isApprox(getNode(8).getPercentDone(), 1 / (10 + 10) * 100, 0.00001, 'Percent done change is propagated to parent')
        t.isApprox(getNode(7).getPercentDone(), 1 / (10 + 10) * 100, 0.00001, 'Percent done change is propagated to parent')
        t.isApprox(getNode(6).getPercentDone(), 1 / (10 + 10) * 100, 0.00001, 'Percent done change is propagated to parent')
        t.isApprox(root.getPercentDone(), (1 + 1 + 1) / (2 + 5 + 10 + 10) * 100, 0.00001, 'Percent done change is propagated to parent')

        getNode(9).setPercentDone(50)

        t.isApprox(getNode(8).getPercentDone(), (5 + 1) / (10 + 10) * 100, 0.00001, 'Percent done change is propagated to parent')
        t.isApprox(getNode(7).getPercentDone(), (5 + 1) / (10 + 10) * 100, 0.00001, 'Percent done change is propagated to parent')
        t.isApprox(getNode(6).getPercentDone(), (5 + 1) / (10 + 10) * 100, 0.00001, 'Percent done change is propagated to parent')
        t.isApprox(root.getPercentDone(), (1 + 1 + 5 + 1) / (2 + 5 + 10 + 10) * 100, 0.00001, 'Percent done change is propagated to parent')

        getNode(2).setDuration(4)
        getNode(2).setPercentDone(25)

        t.isApprox(getNode(8).getPercentDone(), (5 + 1) / (10 + 10) * 100, 0.00001, 'Percent done did not change')
        t.isApprox(getNode(7).getPercentDone(), (5 + 1) / (10 + 10) * 100, 0.00001, 'Percent done did not change')
        t.isApprox(getNode(6).getPercentDone(), (5 + 1) / (10 + 10) * 100, 0.00001, 'Percent done did not change')
        t.isApprox(root.getPercentDone(), (1 + 1 + 1 + 5 + 1) / (4 + 2 + 5 + 10 + 10) * 100, 0.00001, 'Percent done change is propagated to parent')
    })

//    t.it('Milestones should work', function (t) {
//
//        var taskStore = Ext.create("Gnt.data.TaskStore", {
//            root : {
//                expanded : true,
//                children : [
//                    {
//                        Id : 3,
//
//                        children : [
//                            {
//                                Id          : 4,
//                                StartDate   : new Date(2013, 1, 1),
//                                Duration    : 0,
//                                PercentDone : 0,
//                                leaf        : true
//                            },
//                            {
//                                Id          : 5,
//                                StartDate   : new Date(2013, 1, 1),
//                                Duration    : 0,
//                                leaf        : true
//                            }
//                        ]
//                    }
//                ]
//            }
//        });
//
//        t.is(taskStore.getById(3).getPercentDone(), 0, '0 ok');
//
//        taskStore.getById(4).setPercentDone(100);
//
//        t.is(taskStore.getById(3).getPercentDone(), 50, '50 ok');
//
//        taskStore.getById(5).setPercentDone(100);
//
//        t.is(taskStore.getById(3).getPercentDone(), 100, '100 ok');
//    });
})
