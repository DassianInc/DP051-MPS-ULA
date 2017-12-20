StartTest(function(t) {

    var taskStore = Ext.create("Gnt.data.TaskStore", {
        proxy       : 'memory',

        root        : {
            expanded    : false,
            Id          : 100,

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
    });

    //======================================================================================================================================================================================================================================================
    t.diag('Sanity')

    var node3 = taskStore.getNodeById(3);
    var node4 = taskStore.getNodeById(4);
    var node5 = taskStore.getNodeById(5);

    node4.indent();
    node5.indent();

    t.ok(node4.dirty, "Node4 dirty after indent");
    t.ok(node5.dirty, "Node5 dirty after indent");

    t.notOk(node3.isLeaf(), "Node3 is not leaf");
    t.ok(node4.isLeaf(), "Node4 is still leaf");
    t.ok(node5.isLeaf(), "Node5 is still leaf");
});
