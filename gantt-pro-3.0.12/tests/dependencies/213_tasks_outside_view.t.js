StartTest(function (t) {
    t.it('Dependencies should not be painted between two tasks whose dates do not intersect the timeaxis', function (t) {

        var gantt = t.getGantt2({
            startDate       : new Date(2012, 1, 1),
            endDate         : new Date(2012, 6, 1),
            dependencyStore : new Gnt.data.DependencyStore()
        });

        gantt.taskStore.getRootNode().removeAll();

        gantt.taskStore.getRootNode().appendChild({
            StartDate : new Date(2011, 1, 1),
            Duration  : 2,
            leaf      : true,
            Id        : 1
        });

        gantt.taskStore.getRootNode().appendChild({
            StartDate : new Date(2011, 1, 1),
            Duration  : 2,
            leaf      : true,
            Id        : 2
        });

        gantt.dependencyStore.add(new Gnt.model.Dependency({
            From : 1,
            To   : 2
        }));

        gantt.render(document.body)

        var view = gantt.getSchedulingView();

        t.chain(
            { waitFor : 'rowsVisible', args : gantt },
            { waitFor : 500 },

            function (next) {
                t.selectorNotExists('.sch-dependency', 'Should not find dependencies');
            }
        );
    })
})
