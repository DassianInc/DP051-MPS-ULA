StartTest(function (t) {
    function getBufferedGantt(config) {
        var generateTaskData = function () {
            var arr = [];

            for (var i = 1; i < 700; i++) {
                arr.push({
                    Id        : i,
                    Name      : i,
                    StartDate : new Date(2010, 0, 5),
                    Duration  : 3,
                    leaf      : true,
                    Cls       : 'task'+i
                });
            }

            return arr;
        };

        var dependencyStore = Ext.create("Gnt.data.DependencyStore", {
            data : [
                {
                    Id   : 1,
                    From : 1,
                    To   : 2,
                    Type : 2,
                    Cls  : 'Dep1'
                },
                {
                    Id   : 2,
                    From : 1,
                    To   : 500,
                    Type : 2,
                    Cls  : 'Dep2'
                }
            ]
        });

        var taskStore = Ext.create("Gnt.data.TaskStore", {
            // sorting slow downs the initial loading/rendering time for big trees
            sortOnLoad : false,

            proxy : {
                type : 'memory',
                data : generateTaskData()
            }
        });

        var gantt = t.getGantt(Ext.apply({
            taskStore       : taskStore,
            dependencyStore : dependencyStore,

            width : 400,

            startDate : new Date(2010, 0, 4),

            columns  : [
                {
                    xtype     : 'treecolumn',
                    header    : 'Tasks',
                    sortable  : true,
                    dataIndex : 'Id',
                    width     : 150,
                    editor    : {}
                }
            ],
            renderTo : Ext.getBody()
        }, config || {}));

        return gantt;
    }

    t.it('Basic dependency rendering checks', function (t) {
        var gantt = getBufferedGantt();
        var schedulingView = gantt.getSchedulingView();
        var depView = schedulingView.getDependencyView();

        var dep1 = gantt.dependencyStore.getById(1);
        var dep2 = gantt.dependencyStore.getById(2);

        var el = schedulingView.el;
        var lockedEl = gantt.lockedGrid.getView().el;

        t.chain(
            { waitForTasksAndDependenciesToRender : gantt },

            function (next) {
                t.isGreater(depView.getElementsForDependency(dep1).getCount(), 0, 'Dependency 1 should be visible');
                t.isGreater(depView.getElementsForDependency(dep2).getCount(), 0, 'Dependency 2 should be visible');

                gantt.normalGrid.view.scrollTo(0, 2000, false)
                next();
            },

            {
                waitForSelectorNotFound : '.Dep1-line'
            },

            // HACK - this needs investigation. Something blocks the scrolling
            { waitFor : 100 },

            function (next) {
                t.is(depView.getElementsForDependency(dep1).getCount(), 0, 'Dependency 1 should not be rendered since both "from" and "to" tasks are above/below current chunk');
                t.isGreater(depView.getElementsForDependency(dep2).getCount(), 0, 'Dependency 2 should be visible, even that both tasks are not rendered');

                gantt.normalGrid.view.scrollTo(0, 0, false);
                next()
            },
            { waitForSelector : '.Dep1-line' },

            { waitForSelector : '.Dep2-line' },

            function (next) {
                t.pass('Dependency 1+2 should be visible');

                gantt.dependencyStore.removeAll();
                next()
            },
            {
                waitForSelectorNotFound : '.sch-dependency'
            },

            function (next) {
                t.pass('No dependencies should be rendered after removing all records from dependency store');

                var task444 = gantt.taskStore.getNodeById(444)

                // Making sure dependencies are not rendered if from/to task is not in view
                gantt.setStart(Sch.util.Date.add(task444.getEndDate(), Sch.util.Date.WEEK, 1));

                gantt.dependencyStore.add(new Gnt.model.Dependency({
                    Id   : 3,
                    From : 111,
                    To   : 444,
                    Type : 2
                }));

                next();
            },
            {
                waitFor : 500
            },
            function () {
                t.selectorNotExists('.sch-dependency', 'No dependencies rendered if one of the tasks are outside current timeaxis');
                gantt.destroy();
            }
        )
    })

    function repeat(fn, nbr) {
        var steps = [];

        for (var i = 1; i <= nbr; i++) {
            steps.push(fn);
        }

        return steps;
    }

    t.it('Dependency drawing position checks to verify lines are drawn during buffered page scrolling', function (t) {
        var gantt = getBufferedGantt({ cls : 'two' });
        var schedulingView = gantt.getSchedulingView();
        var incr = 20;

        t.chain(
            { waitForSelector : '.two .Dep2-line'},

            repeat(
                function (next) {
                    var as = t.beginAsync();

                    schedulingView.scrollEventIntoView(gantt.taskStore.getNodeById(incr+=50), false, false, function() {
                        t.waitForSelector('.two .Dep2-line', next)
                        t.endAsync(as);
                    })
                },
                10
            ),

            function(next) {

                var called;

                gantt.ensureVisible(gantt.taskStore.getAt(499), {
                    callback : function () {
                        if (!called) next()

                        called = true
                    }
                });
            },

            function () {
                gantt.getDependencyView().renderAllDependencies();

                t.isApprox(gantt.el.down('.two .Dep2-arrow').getY(), gantt.el.down('.two .task500').getY(), 10, 'Arrow in the right place');
            }
        );
    });
});

