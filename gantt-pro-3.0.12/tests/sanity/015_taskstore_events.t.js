StartTest(function (t) {
    var ts  = new Gnt.data.TaskStore();

    var g   = t.getGantt({ taskStore : ts, renderTo : document.body });

    var task = ts.getRoot().appendChild({ Name : 'foo' });

    task.remove();

    t.notOk(ts.getRoot().isLeaf(), 'Rootnode is not leaf');

    ts.getRoot().appendChild(task);

    t.notOk(ts.getRoot().isLeaf(), 'Rootnode is not leaf');

    t.willFireNTimes(g.taskStore, 'update', 1);

    ts.getRoot().firstChild.setName('asfo');

    g.destroy();
})
