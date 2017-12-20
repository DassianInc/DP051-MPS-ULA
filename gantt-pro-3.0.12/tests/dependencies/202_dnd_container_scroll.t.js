StartTest(function (t) {
    t.diag('Gantt container element should auto-scroll if go near the edges of the container');

    var getDataSet = function () {
        var dependencyStore = t.getDependencyStore({data : [] });

        var taskStore = Ext.create("Gnt.data.TaskStore", {
            dependencyStore : dependencyStore,
            cascadeDelay    : 0,

            root : {
                expanded : false,

                children : [
                    {
                        Id        : 1,
                        leaf      : true,
                        StartDate : new Date(2011, 6, 5),
                        EndDate   : new Date(2011, 6, 10)
                    },
                    {
                        Id        : 2,
                        leaf      : true,
                        StartDate : new Date(2011, 6, 1),
                        EndDate   : new Date(2011, 6, 5)
                    },
                    {},{},{},{},{},{},{},{},{},{},{},{},{},{},{}
                ]
            }
        });

        return {
            taskStore       : taskStore,
            dependencyStore : dependencyStore
        }
    };


    var gantt, view;

    t.beforeEach(function () {
        gantt && gantt.destroy();

        var dataSet         = getDataSet();
        var taskStore       = dataSet.taskStore;
        var dependencyStore = dataSet.dependencyStore;

        gantt               = t.getGantt2({
            startDate       : new Date(2011, 6, 1),
            endDate         : new Date(2011, 6, 28),
            taskStore       : taskStore,
            width           : 300,
            height          : 200,
            dependencyStore : dependencyStore,
            renderTo        : Ext.getBody()
        });

        view      = gantt.getSchedulingView();
    });


    t.it('Should scroll right', function (t) {

        var viewRight = gantt.normalGrid.el.getRight();

        t.chain(
            { waitForRowsVisible : gantt },

            { moveCursorTo : '.sch-gantt-task-bar' },
            { moveCursorTo : '.sch-gantt-task-bar .sch-gantt-terminal-start' },

            // that will trigger scrolling (bug in ExtJS)
            {
                waitFor     : 'scrollLeftChange', args : view.el,
                trigger     : { action : 'drag', to : [ viewRight - 5, view.el.getTop() + 34 ], dragOnly : true }
            },

            { action : 'moveCursorTo', target : gantt.getSchedulingView(), offset : ['50%', '100%-5'] },

            { waitFor : 'scrollTopChange', args : view.el },

            { action : 'moveCursorTo', target : gantt.getSchedulingView(), offset : ['50%', '5'] },

            { waitFor : function() {
                    return gantt.getSchedulingView().getScroll().top === 0;
                }
            },

            { action : 'mouseUp' }
        );
    });

    t.it('Should scroll left, and task drag drop setting should not affect', function (t) {

        var viewLeft = gantt.normalGrid.el.getLeft();

        t.chain(
            { waitForRowsVisible : gantt },

            function (next) {
                t.scrollHorizontallyTo(gantt.normalGrid.getView().el, 50, next)
            },

            { moveCursorTo : '.sch-gantt-task-bar' },
            { moveCursorTo : '.sch-gantt-task-bar .sch-gantt-terminal-start' },

            {
                waitFor     : 'scrollLeftChange', args : view.el,
                // reported to sencha https://www.sencha.com/forum/showthread.php?303959
                // if drag too close to left edge - locked view will scroll instead
                trigger     : { action : 'drag', to : [ viewLeft + 20, view.el.getTop() + 34 ], dragOnly : true }
            },

            { action : 'mouseUp' }
        )
    });
});
