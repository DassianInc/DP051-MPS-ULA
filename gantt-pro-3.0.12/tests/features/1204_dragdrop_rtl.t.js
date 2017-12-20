StartTest(function (t) {
    var Type = Gnt.model.Dependency.Type;

    t.describe("Drag & Drop feature with Gantt's RTL mode", function (t) {
        t.it('Should properly position drag proxy.', function (t) {
            var gantt = t.getGantt2({
                renderTo        : Ext.getBody(),
                width           : 500,
                height          : 200,
                rtl             : true,
                columns         : [],
                startDate       : new Date(2010, 1, 1),
                endDate         : new Date(2010, 1, 11),
                taskStore       : t.getTaskStore({
                    DATA : [
                        {leaf : true, Id : 1, StartDate : new Date(2010, 1, 3), Duration : 2},
                        {leaf : true, Id : 2, StartDate : new Date(2010, 1, 5), Duration : 2}
                    ]
                }),
                dependencyStore : t.getDependencyStore({
                    data : [{From : 1, To : 2, Type : Type.EndToStart}]
                })
            });

            t.chain(
                {
                    waitFor : 'tasksAndDependenciesToRender'
                },
                {
                    drag       : function () {
                        var task = gantt.getTaskStore().getRootNode().lastChild,
                            taskEl = gantt.getSchedulingView().getElementFromEventRecord(task);

                        return taskEl;
                    },
                    dragOnly   : true,
                    by         : [15, 0],
                    fromOffset : [10, 5]
                },
                {
                    moveCursorBy : [[-15, 0]]
                },
                {
                    waitFor : 'elementVisible',
                    args    : ['.x-dd-drag-proxy']
                },
                function (next) {
                    var task = gantt.getTaskStore().getRootNode().lastChild,
                        taskEl = gantt.getSchedulingView().getElementFromEventRecord(task),
                        taskRegion = taskEl.getRegion().adjust(-1, 1, 1, -1),
                        proxyTaskEl = gantt.normalGrid.getEl().child('.x-dd-drag-proxy .sch-gantt-item'),
                        proxyRegion = proxyTaskEl.getRegion();

                    t.is(taskRegion.contains(proxyRegion), true, 'Drag & Drop proxy should be exactly under cursor');

                    next(proxyTaskEl);
                },
                {
                    action : 'mouseUp'
                }
            );
        });
    });
});
