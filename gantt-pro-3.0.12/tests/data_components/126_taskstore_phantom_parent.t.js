StartTest(function(t) {

    // #1893 Checks that PhantmParentId is filled correctly when we call appendChild/insertBefore for phantom tasks

    t.it('appendChild fills PhantomParentId values properly', function (t) {
        var taskStore = t.getTaskStore({
            DATA : []
        });

        var root    = taskStore.getRootNode(),
            task1   = root.appendChild({}),
            task2   = root.appendChild({});

        task1.appendChild(task2);
        t.is(task2.getPhantomParentId(), task1.getPhantomId(), 'proper task2 PhantomParentId value');

        root.appendChild(task2);
        t.notOk(task2.getPhantomParentId(), 'empty task2 PhantomParentId value');
    });

    t.it('insertBefore fills PhantomParentId values properly', function (t) {
        var taskStore = t.getTaskStore({
            DATA : []
        });

        var root    = taskStore.getRootNode(),
            task1   = root.appendChild({}),
            task2   = root.appendChild({}),
            task3   = root.appendChild({});

        task1.appendChild(task3);
        t.is(task3.getPhantomParentId(), task1.getPhantomId(), 'proper task3 PhantomParentId value');

        task1.insertBefore(task2, task3);
        t.is(task2.getPhantomParentId(), task1.getPhantomId(), 'proper task2 PhantomParentId value');

        root.appendChild(task2);
        t.notOk(task2.getPhantomParentId(), 'empty task2 PhantomParentId value');
    });

});
