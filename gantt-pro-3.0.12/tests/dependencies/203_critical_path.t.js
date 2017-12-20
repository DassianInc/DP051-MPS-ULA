StartTest(function(t) {
    
    var gantt               = t.getGantt({
        renderTo    : Ext.getBody(),
        startDate           : new Date(2010, 1, 1),
        
        lockedViewConfig    : {
            // Enable node reordering in the locked grid
            plugins     : 'treeviewdragdrop'
        }
    });
    
    var view        = gantt.getSchedulingView(),
        depView     = view.getDependencyView();

    t.it('Should be able to highlight and unhighlight CP', function (t) {
        t.chain(
            { waitForTasksAndDependenciesToRender : gantt },

            function (next) {
                view.highlightCriticalPaths();
                t.selectorExists('.' + depView.selectedCls, 'Found some critical path els');

                view.unhighlightCriticalPaths();
                t.selectorNotExists('.sch-gantt-task-highlighted');
            }
        )
    });

    t.it('Should keep CP highlighting after view refresh', function (t) {
        t.chain(
            { waitForTasksAndDependenciesToRender : gantt },

            function (next) {
                view.highlightCriticalPaths();
                next()
            },
            // re-ordering should work while critical path is highlighted
            {
                drag : '.x-grid-inner-locked ' + Ext.grid.View.prototype.itemSelector + ':nth-child(2)',
                to   : '.x-grid-inner-locked ' + Ext.grid.View.prototype.itemSelector + ':nth-child(5)'
            },

            { waitForSelector : '.' + depView.selectedCls }
        );
    });

    t.it('Should behave ok when there are no gantt rows', function (t) {
        t.chain(
            { waitForTasksAndDependenciesToRender : gantt },

            function (next) {

                view.unhighlightCriticalPaths();
                t.selectorNotExists('.sch-gantt-task-highlighted');

                gantt.taskStore.getRootNode().collapse();

                next()
            },
            { waitForSelectorNotFound : '.' + depView.selectedCls },

            function (next) {

                view.highlightCriticalPaths();
                view.unhighlightCriticalPaths();

            }
        )
    })
})
