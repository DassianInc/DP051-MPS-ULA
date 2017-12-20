StartTest(function(t) {

    t.it('Finds assignments in the `Resources` tab grid', function (t) {
        var taskEditor = new Gnt.plugin.TaskEditor();

        var g = t.getGantt2({
            renderTo        : Ext.getBody(),
            resourceStore   : t.getResourceStore(),
            assignmentStore : t.getAssignmentStore(),
            forceFit        : true,
            plugins         : taskEditor
        });

        var task    = g.taskStore.getNodeById(117);

        var grid;

        t.chain(
            { waitForTasksAndDependenciesToRender : g },

            function (next) {
                t.doubleClick(g.getSchedulingView().getElementFromEventRecord(task), next);
            },

            { waitForComponentVisible : taskEditor },

            function (next) {
                taskEditor.taskEditor.setActiveTab(2);
                grid = taskEditor.taskEditor.assignmentGrid;

                t.is(grid.store.getCount(), 1, '1 assignment found');
                t.is(grid.store.getAt(0).get('Id'), 'a1', 'proper assignment in the grid');

                taskEditor.close();

                next();
            },

            function (next) {
                t.doubleClick(g.getSchedulingView().getElementFromEventRecord(task), next);
            },

            { waitForComponentVisible : taskEditor },

            function (next) {
                taskEditor.taskEditor.setActiveTab(2);

                t.is(grid.store.getCount(), 1, '1 assignment found');
                t.is(grid.store.getAt(0).get('Id'), 'a1', 'proper assignment in the grid');

                taskEditor.close();
                g.destroy();
            }
        );
    });

});
