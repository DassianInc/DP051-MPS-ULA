StartTest(function (t) {
    t.diag('Dependencies should be rendered below the tasks')

    var gantt = t.getGantt2({
        startDate       : new Date(2012, 10, 5),
        endDate         : new Date(2012, 11, 31)
    });

    gantt.taskStore.getRootNode().removeAll();

    gantt.taskStore.getRootNode().appendChild({
        StartDate : new Date(2012, 10, 7),
        EndDate   : new Date(2012, 10, 11),
        leaf      : true,
        Id        : 1
    });

    gantt.taskStore.getRootNode().appendChild({
        StartDate : new Date(2012, 10, 5),
        EndDate   : new Date(2012, 10, 11),
        leaf      : true,
        Id        : 2
    });
    gantt.taskStore.getRootNode().appendChild({
        StartDate : new Date(2012, 10, 7),
        EndDate   : new Date(2012, 10, 11),
        leaf      : true,
        Id        : 3
    });

    gantt.render(document.body)

    gantt.dependencyStore.add(new Gnt.model.Dependency({
        From    : 1,
        To      : 3,
        Type    : 1
    }));

    var view = gantt.getSchedulingView();

    t.chain(
        { waitFor : 'tasksAndDependenciesToRender', args : gantt },

        function (next) {
            var middleTaskEl = gantt.getSchedulingView().getElementFromEventRecord(gantt.taskStore.getNodeById(2));
            var xy = middleTaskEl.getXY();
            var found;
            xy[1] += 5;

            for (var i = 5; i < middleTaskEl.getWidth() - 5; i++) {
                var el = document.elementFromPoint(xy[0] + i, xy[1]);
                if (el.className.match('dependency')) {
                    found = true;
                }
            }

            t.notOk(found, 'Should not find dependency els above a task element');
        }
    );
})    
