StartTest(function (t) {
    t.diag('Rendering dependencies at the right edge should not affect the scrollable area width')

    // TODO, this bug is not very critical as it only happens if you have a task with an outgoing dependency
    // rendered at the very right edge of the scrollable gantt area.

    var gantt = t.getGantt({
        cascadeChanges : false,
        startDate : new Date(2012, 11, 3),
        endDate : new Date(2012, 11, 31),
        rightLabelField : 'Name'
    });

    var firstTask = gantt.taskStore.getRootNode().childNodes[0].childNodes[0]
    var secondTask = gantt.taskStore.getRootNode().childNodes[0].childNodes[1];

    firstTask.setStartEndDate(new Date(2012, 11, 3), new Date(2012, 11, 31));
    secondTask.setStartEndDate(new Date(2012, 11, 3), new Date(2012, 11, 30));

    gantt.dependencyStore.removeAll();

    gantt.render(document.body)

    t.waitForRowsVisible(gantt, function () {
        gantt.getSchedulingView().el.dom.scrollLeft = 10000;

        var leftScrollWithoutDep = gantt.getSchedulingView().el.dom.scrollLeft;

        gantt.dependencyStore.add([
            new Gnt.model.Dependency({
                From    : firstTask.data.Id,
                To      : secondTask.data.Id,
                Type    : 2
            })
        ]);

        t.waitForTasksAndDependenciesToRender(gantt, function() {
            gantt.getSchedulingView().el.dom.scrollLeft = 10000;

            t.todo(function(t) {
                t.is(gantt.getSchedulingView().el.dom.scrollLeft, leftScrollWithoutDep, 'Rendering dependency at the right edge should not affect the size of the scrollable area');
            })
        })
    });
})    
