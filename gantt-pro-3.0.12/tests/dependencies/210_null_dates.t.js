StartTest(function (t) {
    t.diag('Rendering dependencies at the right edge should not affect the scrollable area width')

    var gantt = t.getGantt2({
        startDate       : new Date(2012, 10, 1),
        endDate         : new Date(2012, 11, 31)
    });

    var firstTask = gantt.taskStore.getRootNode().childNodes[0].childNodes[0]
    var secondTask = gantt.taskStore.getRootNode().childNodes[0].childNodes[1];

    firstTask.setStartEndDate(new Date(2012, 10, 3), new Date(2012, 10, 4));
    secondTask.setStartEndDate(new Date(2012, 10, 5), new Date(2012, 10, 6));
    
    gantt.dependencyStore.removeAll();
    
    t.verifyCachedDependenciesState(gantt.taskStore, gantt.dependencyStore)

    gantt.render(document.body)

    gantt.dependencyStore.add(new Gnt.model.Dependency({
        From    : firstTask.data.Id,
        To      : secondTask.data.Id
    }));

    var view = gantt.getSchedulingView();

    t.chain(
        { waitFor : 'tasksAndDependenciesToRender', args : gantt },

        function (next) {
            firstTask.setStartDate(null);
            next();
        },

        { waitFor : 'selectorNotFound', args : '.sch-dependency'},

        function (next) {
            firstTask.setEndDate(null);
            firstTask.setEndDate(new Date(2012, 10, 5));
            firstTask.setStartDate(new Date(2012, 10, 2));

            next();
        },

        { waitFor : 'selector', args : '.sch-dependency'}
    );
})    
