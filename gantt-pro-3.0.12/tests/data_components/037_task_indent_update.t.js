StartTest(function(t) {

    var taskStore = Ext.create("Gnt.data.TaskStore", {
        proxy       : {
            type        : 'ajax',
            api         : {
                read        : 'data_components/037_task_indent_update.read.json',
                update      : 'data_components/037_task_indent_update.update.json'
            },
            actionMethods : { read : 'GET', update: 'GET' },

            writer      : {
                type            : 'json',
                rootProperty    : 'taskdata',
                encode          : true,
                allowSingle     : false
            },

            reader: 'json',
        },

        root        : {
            expanded    : false,
            Id          : 100
        }
    });

    taskStore.proxy.on('exception', function () {
        t.fail('Communication with server failed')
    })

    //======================================================================================================================================================================================================================================================
    t.diag('Sanity')

    t.loadStoresAndThen(taskStore, function () {

        var node3 = taskStore.getNodeById(3);
        var node4 = taskStore.getNodeById(4);
        var node5 = taskStore.getNodeById(5);

        t.is(node4.parentNode, taskStore.getRootNode(), "Node4 is initially a root level task");
        t.is(node5.parentNode, taskStore.getRootNode(), "Node5 is initially a root level task");

        node4.indent();
        node5.indent();

        t.ok(node4.isLeaf(), "Node4 is still leaf");
        t.ok(node5.isLeaf(), "Node5 is still leaf");

        t.is(node4.parentNode, node3, "Node4 is now child of Node3");
        t.is(node5.parentNode, node3, "Node5 is now child of Node3");

        t.ok(node4.dirty, "Node4 dirty after indent");
        t.ok(node5.dirty, "Node5 dirty after indent");

        taskStore.outdent([node4, node5]);

        t.ok(node4.isLeaf(), "Node4 is leaf");
        t.ok(node5.isLeaf(), "Node5 is leaf");

        taskStore.indent([node4, node5]);

        t.ok(node4.isLeaf(), "Node4 is leaf");
        t.ok(node5.isLeaf(), "Node5 is leaf");

        var async = t.beginAsync()

        taskStore.on('write', function () {

            t.notOk(node4.dirty, "Node4 clean after sync");
            t.notOk(node5.dirty, "Node5 clean after sync");

            t.ok(node4.isLeaf(), "Node4 is still leaf");
            t.ok(node5.isLeaf(), "Node5 is still leaf");

            t.endAsync(async)

        }, null, { single : true })

        taskStore.sync()
    })
})
