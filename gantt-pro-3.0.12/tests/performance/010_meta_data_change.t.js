StartTest(function(t) {
    t.diag('Changing the "Name" of a task should not cause redraws or any extra operations.')

    var gantt = t.getGantt({
        renderTo        : Ext.getBody(),
        cascadeChanges  : true,
        rootVisible     : true
    });

    t.waitForTasksAndDependenciesToRender(gantt, function() {
        var view        = gantt.getSchedulingView(),
            depView     = view.getDependencyView(),
            ts          = gantt.taskStore,
            task        = t.getFirstTaskWithOutgoingDeps(gantt);

        t.wontFire(view, 'refresh');
        t.wontFire(ts, 'beforecascade');

        t.isntCalled(depView.renderAllDependencies, depView);

        task.set('Name', 'FOO123');

        t.done(100);    // renderAllDependencies is async
    })
})    
