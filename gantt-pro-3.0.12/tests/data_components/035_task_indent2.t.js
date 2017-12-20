StartTest(function (t) {

    function getTaskStore(config) {

        return Ext.create("Gnt.data.TaskStore", Ext.apply({
            root : {
                expanded : true,

                children : [
                    {
                        Id        : 1,
                        StartDate : '2010-01-01',
                        EndDate   : '2010-01-21',
                        expanded : true,
                        children  : [
                            {
                                Id        : 2,
                                leaf      : true,
                                StartDate : '2010-01-01',
                                EndDate   : '2010-01-07'
                            },
                            {
                                Id        : 3,
                                leaf      : true,
                                StartDate : '2010-01-07',
                                EndDate   : '2010-01-10'
                            },
                            {
                                Id        : 4,
                                leaf      : true,
                                StartDate : '2010-01-15',
                                EndDate   : '2010-01-21'
                            }
                        ]
                    }
                ]
            }
        }, config));
    }

    t.it('Sanity checks', function (t) {
        var taskStore = getTaskStore();

        var node2     = taskStore.getNodeById(2);
        var node3     = taskStore.getNodeById(3);
        var node4     = taskStore.getNodeById(4);

        node3.indent();
        t.notOk(node2.isLeaf(), 'Node2 not leaf after node3 indent');

        t.isDateEqual(node2.getStartDate(), new Date(2010, 0, 7), 'Node2 start');
        t.isDateEqual(node2.getEndDate(), new Date(2010, 0, 10), 'Node2 end');

        node4.indent();
        t.isDateEqual(node3.getStartDate(), new Date(2010, 0, 7), 'Node2 start');
        t.isDateEqual(node3.getEndDate(), new Date(2010, 0, 10), 'Node2 end');

        t.isDateEqual(node2.getStartDate(), new Date(2010, 0, 7), 'Node2 start');
        t.isDateEqual(node2.getEndDate(), new Date(2010, 0, 21), 'Node2 end');

    })

    t.it('Indent with dependencies linking a child-parent after move (invalid and must be removed)', function (t) {
        var taskStore = getTaskStore({
            dependencyStore : new Gnt.data.DependencyStore({
                data : [
                    // Will be invalid after task 3 becomes a child of task 2
                    { From : 2, To : 3 }
                ]
            })
        });

        taskStore.indent([taskStore.getNodeById(2), taskStore.getNodeById(3)])

        t.is(taskStore.getNodeById(2).parentNode.getId(), 1);
        t.is(taskStore.getNodeById(3).parentNode.getId(), 2);

        t.is(taskStore.getDependencyStore().getCount(), 0, 'Invalid dependency removed')
    })

    t.it('Indent with dependencies where a cycle is created (invalid and must be removed)', function (t) {
        var taskStore = new Gnt.data.TaskStore({
            root : {
                expanded : true,

                children : [
                    {
                        Id        : 1,
                        leaf      : true,
                        StartDate : '2010-01-01',
                        EndDate   : '2010-01-07'
                    },
                    {
                        Id        : 2,
                        leaf      : true,
                        StartDate : '2010-01-07',
                        EndDate   : '2010-01-10'
                    },
                    {
                        Id        : 3,
                        leaf      : true,
                        StartDate : '2010-01-15',
                        EndDate   : '2010-01-21'
                    }
                ]
            },
            dependencyStore : new Gnt.data.DependencyStore({
                strictDependencyValidation : true,
                data                       : [
                    // 1->2->3
                    // Will be invalid after task 3 becomes a child of task 1
                    { Id : 1, From : 1, To : 2 },
                    { Id : 2, From : 2, To : 3 }
                ]
            })
        });

        // This now forms a cycle and should remove the dependency
        taskStore.getNodeById(1).appendChild(taskStore.getNodeById(3));

        t.notOk(taskStore.getDependencyStore().getById(1), 'Invalid dependency removed')
    })
})
