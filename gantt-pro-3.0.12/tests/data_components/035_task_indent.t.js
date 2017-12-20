StartTest(function(t) {

    function getTaskStore() {
        return Ext.create("Gnt.data.TaskStore", {
            root        : {
                expanded    : false,
                children    : [
                    {
                        Id          : 11,
                        children    : [
                            {
                                Id          : 1,
                                leaf        : true
                            },
                            {
                                Id          : 2,
                                children    : [
                                    {
                                        Id          : 3,
                                        leaf        : true
                                    },
                                    {
                                        Id          : 4,
                                        leaf        : true
                                    },
                                    {
                                        Id          : 5,
                                        leaf        : true
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        });
    }

    t.it('Sanity', function(t) {
        var taskStore = getTaskStore();

        var node2 = taskStore.getNodeById(2);
        var node3 = taskStore.getNodeById(3);
        var node4 = taskStore.getNodeById(4);
        var node5 = taskStore.getNodeById(5);

        t.notOk(node2.isLeaf(), "Task 2 is not leaf");
        t.ok(node3.isLeaf(), "Task 3 is leaf");

        // outdenting a task which should stay at the same level and get 2 children
        t.is(node3.data.index, 0, "Node3 has index 0");

        node3.outdent();

        t.notOk(node2.isLeaf(), "Task 2 is still a parent after task 3 outdent");
        t.is(node3.data.index, 2, "Node3 now has index 2");

        t.isDeeply(node2.childNodes, [ node4, node5 ], "Task 3 now has tasks 4 and 5 as children");


        // indenting it back - should restore the previous state

        node3.indent();
        t.notOk(node2.isLeaf(), "Task 2 is not leaf after task 3 indent");

        t.isDeeply(node2.childNodes.length, 3, "Task 2 now has tasks 3, 4 and 5 as children again");

        t.is(node3.data.index, 2, "Node3 still has index 2");

        // clearing the dirty flag()
        node3.commit()

        t.notOk(node3.dirty, "Node3 is now clean");

        // indenting node3 one more time - nothing should happen
        node3.indent();

        node4.indent();
        node5.indent();

        t.isDeeply(node2.childNodes, [ node4 ], "Task 2 now has tasks 4 as children");
        t.isDeeply(node4.childNodes, [ node5 ], "Task 4 now has tasks 5 as children");

        t.ok(node4.dirty, "Node4 dirty after indent");
        t.ok(node5.dirty, "Node5 dirty after indent");
    })

    t.it('Should see 2 indented tasks in a parent stay on the same level', function(t) {

        var taskStore = getTaskStore();
        var node2     = taskStore.getNodeById(2);
        var node3     = taskStore.getNodeById(3);
        var node4     = taskStore.getNodeById(4);
        var node5     = taskStore.getNodeById(5);

        taskStore.indent([node4, node5]);

        t.isDeeply(node3.childNodes, [ node4, node5 ], "Task 3 now has tasks 4,5 as children");

        t.is(node4.data.index, 0);
        t.is(node5.data.index, 1);

        taskStore.outdent([node4, node5]);

        t.isDeeply(Ext.Array.map(node2.childNodes, function(n) { return n.data.Id; }), [3,4,5], "Task 2 now has tasks 3,4,5 as children");

        taskStore.indent([node5, node4]);

        t.isDeeply(Ext.Array.map(node3.childNodes, function(n) { return n.data.Id; }), [ 4,5 ], "Task 3 now has tasks 4,5 as children, even if tasks are passed in wrong order");
    });

});
