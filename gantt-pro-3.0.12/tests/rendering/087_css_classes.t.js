StartTest(function (t) {

    var gantt = t.getGantt2({
        renderTo   : Ext.getBody(),
        viewConfig : {
            deferInitialRefresh : false,
            getRowClass         : function () {
                return 'foo';
            }
        }
    });

    t.waitForTasksAndDependenciesToRender(gantt, function () {

        t.it('Should find panel classes', function (t) {

            t.hasCls(gantt.el, 'sch-timelinepanel')
            t.hasCls(gantt.el, 'sch-ganttpanel')
            t.hasCls(gantt.el, 'sch-horizontal')
        })

        t.it('Should find view and task classes', function (t) {
            t.hasCls(gantt.getSchedulingView().el, 'sch-ganttview')
            t.hasCls(gantt.getSchedulingView().el, 'sch-timelineview')

            t.selectorExists('.sch-secondary-canvas', 'Should find secondary canvas')
            t.selectorExists('.sch-dependencyview-ct', 'Should find dependency view container')

            t.selectorExists('.sch-event-wrap .sch-gantt-item')
        });

        t.it('Should still support core Ext JS rendering API', function (t) {
            t.selectorExists('.foo', 'getRowClass works')
        });

    });
});
