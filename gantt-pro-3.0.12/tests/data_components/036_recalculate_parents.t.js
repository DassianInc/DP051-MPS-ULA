StartTest(function (t) {

    t.it('Sanity', function (t) {
        var dependencyStore = Ext.create("Gnt.data.DependencyStore");

        var counter = 0;

        /* global TestModel */
        Ext.define('TestModel', {
            extend : 'Gnt.model.Task',

            refreshCalculatedParentNodeData : function () {
                counter++;
                return this.callParent(arguments);
            }
        });

        t.expectGlobal('TestModel');

        var taskStore = new Gnt.data.TaskStore({
            dependencyStore : dependencyStore,

            model : 'TestModel',

            root : {
                expanded : true,
                children : [
                    {
                        Id       : 1,
                        expanded : true,

                        children : [
                            {
                                Id       : 2,
                                expanded : true,

                                children : [
                                    {
                                        Id   : 3,
                                        leaf : true
                                    }
                                ]
                            },

                            {
                                Id : 10,

                                leaf     : false,
                                expanded : false
                            }
                        ]
                    },

                    {
                        Id        : 4,
                        StartDate : new Date(2010, 1, 1),
                        EndDate   : new Date(2010, 1, 11),
                        children  : [
                            {
                                Id        : 5,
                                StartDate : new Date(2010, 1, 1),
                                EndDate   : new Date(2010, 1, 11),
                                children  : [
                                    {
                                        Id        : 6,
                                        StartDate : new Date(2010, 1, 1),
                                        EndDate   : new Date(2010, 1, 11),
                                        leaf      : true
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        });

        var node1 = taskStore.getNodeById(1);
        var node2 = taskStore.getNodeById(2);
        var node3 = taskStore.getNodeById(3);
        var node4 = taskStore.getNodeById(4);
        var node5 = taskStore.getNodeById(5);
        var node6 = taskStore.getNodeById(6);

        var newStart = new Date(2010, 1, 1);
        node3.setStartDate(newStart);

        t.notOk(node3.getDuration(), 'No duration for task 3');
        t.notOk(node2.getDuration(), 'No duration for task 2');
        t.notOk(node2.getDuration(), 'No duration for task 1');

        // checking for the "recalculateParents" storm, when number of calls to that method was growing exponentially with the nesting level
        t.is(counter, 3, '`recalculateParents` was called only 3 times across all models');

        t.isDateEqual(node2.getStartDate(), newStart, 'Start Date propagated to immediate parent');
        t.isDateEqual(node1.getStartDate(), newStart, 'Start Date propagated to parent of parent');

        var newEnd = new Date(2010, 11, 1);
        node3.setEndDate(newEnd);

        t.isDateEqual(node2.getEndDate(), newEnd, 'End Date propagated to immediate parent');
        t.isDateEqual(node1.getEndDate(), newEnd, 'End Date propagated to parent of parent');

        t.is(counter, 6, '`recalculateParents` was called only 6 times across all models (3 + 3)');

        node6.setStartDate(new Date(2010, 1, 4));
        t.is(node4.getStartDate(), new Date(2010, 1, 4), 'Start date propagated');
        t.is(node5.getStartDate(), new Date(2010, 1, 4), 'Start date propagated');

        node6.setName('foo');
        node6.setStartDate(new Date(2010, 1, 1));
        t.is(node4.getStartDate(), new Date(2010, 1, 1), 'Start date propagated after reject');
        t.is(node5.getStartDate(), new Date(2010, 1, 1), 'Start date propagated after reject');

        t.isntCalled(TestModel.prototype.recalculateParents, TestModel.prototype);
        taskStore.getNodeById(10).expand();
    });

    t.it("VERIFY RECALC PARENT IS CALLED AFTER A CHILD IS REMOVED", function (t) {

        /* global TestModel2 */
        Ext.define('TestModel2', {
            extend : 'Gnt.model.Task'
        });

        t.expectGlobal('TestModel2');

        var taskStore = new Gnt.data.TaskStore({
            model : 'TestModel2',
            proxy : 'memory',
            root  : {
                expanded : true,
                children : [
                    {
                        Id       : 1,
                        expanded : true,
                        children : [
                            { Id : 'leaf1' },
                            { Id : 'leaf2' }
                        ]
                    }
                ]
            }
        });

        var leafOne = taskStore.getNodeById("leaf1");

        t.isCalled(TestModel2.prototype.recalculateParents, TestModel2.prototype, 'Should see recalculateParents called after child node removed');

        leafOne.remove();
    });

    t.describe('Recalculate parents should bubble properly during cascade', function (t) {

        var taskStore = new Gnt.data.TaskStore({
            cascadeChanges  : true,
            dependencyStore : new Gnt.data.DependencyStore({
                data : [
                    {
                        From : 1,
                        To   : 4
                    }
                ]
            }),
            proxy           : 'memory',
            root            : {
                expanded : true,
                children : [
                    {
                        Id        : 1,
                        StartDate : new Date(2010, 1, 2),
                        EndDate   : new Date(2010, 1, 3)
                    },
                    {
                        Id        : 2,
                        StartDate : new Date(2010, 1, 3),
                        EndDate   : new Date(2010, 1, 4),
                        children  : [
                            {
                                Id        : 3,
                                StartDate : new Date(2010, 1, 3),
                                EndDate   : new Date(2010, 1, 4),
                                children  : [
                                    {
                                        Id        : 4,
                                        StartDate : new Date(2010, 1, 3),
                                        EndDate   : new Date(2010, 1, 4),
                                        leaf      : true
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        });

        t.waitForEvent(taskStore, 'cascade', function () {

            t.it('Should find updated parent date', function (t) {
                t.is(taskStore.getNodeById(2).getStartDate(), new Date(2010, 1, 4));
                t.is(taskStore.getNodeById(3).getStartDate(), new Date(2010, 1, 4));
                t.is(taskStore.getNodeById(4).getStartDate(), new Date(2010, 1, 4));
            });
        });

        taskStore.getNodeById(1).shift(Sch.util.Date.DAY, 1);
    });

    t.it("Should handle case where child nodes have partial data only", function (t) {

        var taskStore = new Gnt.data.TaskStore({
            root : {
                expanded : true,
                children : [
                    {
                        Id       : 1,
                        expanded : true,
                        children : [
                            { Id : 'leaf1' },
                            { Id : 'leaf2' }
                        ]
                    }
                ]
            }
        });

        var parent = taskStore.getNodeById(1);
        var leafOne = taskStore.getNodeById("leaf1");
        var leafTwo = taskStore.getNodeById("leaf2");

        leafTwo.setEndDate(new Date(2014, 8, 23));
        leafOne.setStartDate(new Date(2014, 8, 26));

        t.is(parent.getStartDate(), new Date(2014, 8, 23), 'Correct parent start date');
        t.is(parent.getEndDate(), new Date(2014, 8, 26), 'Correct parent end date');
    });

    // #1933

    t.it("Recalculates parent tasks on project calendar change", function (t) {

        var taskStore   = t.getTaskStore({
            DATA        : [
                {
                    Id          : 1,
                    children    : [
                        {
                            StartDate   : '2015-03-25',
                            Duration    : 1,
                            leaf        : true
                        },
                        {
                            StartDate   : '2015-03-25',
                            Duration    : 2,
                            leaf        : true
                        }
                    ]
                }
            ]
        });

        var parent = taskStore.getNodeById(1);

        taskStore.getCalendar().add({ Date : '2015-03-25' });

        t.is(parent.getStartDate(), new Date(2015, 2, 26), 'Correct parent start date');
        t.is(parent.getEndDate(), new Date(2015, 2, 28), 'Correct parent end date');
    });
});
