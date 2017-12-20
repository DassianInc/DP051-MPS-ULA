StartTest(function (t) {

    t.describe('Testing drag drop of a regular task', function (t) {

        t.it('Should be possible to drag a normal task', function (t) {
            var g = t.getGantt2({
                width     : 500,
                height    : 100,
                renderTo  : Ext.getBody(),
                taskStore : new Gnt.data.TaskStore({ proxy : 'memory' })
            });

            var taskStore = g.taskStore;

            var task = taskStore.getRootNode().appendChild({
                StartDate    : new Date(2010, 0, 4),
                EndDate      : new Date(2010, 0, 6),
                Duration     : 2,
                DurationUnit : "d",
                leaf         : true
            });

            t.is(taskStore.getNewRecords().length, 1, '1 record has been added');

            t.willFireNTimes(g, 'beforetaskdrag', 1);
            t.willFireNTimes(g, 'taskdragstart', 1);
            t.willFireNTimes(g, 'taskdrop', 1);
            t.willFireNTimes(g, 'aftertaskdrop', 1);
            t.willFireNTimes(taskStore, 'update', 1);

            g.on('taskdragstart', function () {
                var tip = t.cq1('[cls=gnt-dragdrop-tip]');
                var dragEl = Ext.getBody().down('.sch-gantt-dragproxy .sch-gantt-item');
                
                var proxyRegion = Ext.getBody().down('.sch-gantt-dragproxy .sch-gantt-item').getRegion();
                var taskRegion = Ext.getBody().down('.x-grid-cell .sch-gantt-item').getRegion();
                
                t.is(proxyRegion.top, taskRegion.top, 'Top coordinate is correct');
                t.is(proxyRegion.bottom, taskRegion.bottom, 'Bottom coordinate is correct');
                
                if (Ext.isIE8) {
                    t.isApprox(proxyRegion.right, taskRegion.right, 1, 'Right coordinate is correct');
                    t.isApprox(proxyRegion.left, taskRegion.left, 1, 'Left coordinate is correct');
                } else {
                    t.is(proxyRegion.right, taskRegion.right, 'Right coordinate is correct');
                    t.is(proxyRegion.left, taskRegion.left, 'Left coordinate is correct');
                }

                t.isApprox(tip.getX(), dragEl.getX(), 30, 'Proxy and tooltip aligned X');
                t.isApprox(tip.getY(), dragEl.getY(), 30, 'Proxy and tooltip aligned Y');
            });

            t.chain(
                { waitFor : 'rowsVisible', args : g },

                { action : 'drag', target : '.sch-gantt-item', by : [100, 0], dragOnly : true },

                function () {
                    var tip = t.cq1('[cls=gnt-dragdrop-tip]');
                    t.ok(tip.isVisible(), 'Gantt tooltip exists and is visible');

                    t.mouseUp();

                    t.isGreater(task.getStartDate(), task.modified.StartDate, 'Duration intact');
                    t.is(task.getDuration(), 2, 'Duration intact');
                }
            );
        });

        t.it('Should not affect a task if it is dropped outside the schedule area', function (t) {

            var g = t.getGantt2({
                itemId    : 'invalidDrop',
                width     : 500,
                height    : 100,
                renderTo  : Ext.getBody(),
                StartDate : new Date(2010, 0, 4),
                taskStore : new Gnt.data.TaskStore({ proxy : 'memory' })
            });

            var taskStore = g.taskStore;

            var task = taskStore.getRootNode().appendChild({
                StartDate    : new Date(2010, 0, 11),
                Duration     : 2,
                DurationUnit : "d",
                leaf         : true
            });

            t.wontFire(taskStore, 'update');
            t.willFireNTimes(g, 'beforetaskdrag', 1);
            t.willFireNTimes(g, 'taskdragstart', 1);
            t.willFireNTimes(g, 'taskdrop', 0);
            t.willFireNTimes(g, 'aftertaskdrop', 1);

            t.chain(
                { waitFor : 'rowsVisible', args : g },

                { action : 'drag', target : '#invalidDrop => .sch-gantt-item', to : [1, 1] },

                function () {
                    t.elementIsNotVisible(g.el.down('.sch-gantt-dragproxy'), 'Should not see proxy after invalid drop');
                    t.elementIsVisible(g.el.down('.x-grid-cell .sch-gantt-item'), 'Should see event visible after invalid drop');
                }
            );
        });
    });
});
