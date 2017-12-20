StartTest(function (t) {

    // #1446 - Histogram doesn't redraw old resource row after it's replaced with another one on an assignment

    t.it('Histogram redraws both old and new resource bars after changing a resource on a assignment', function (t) {

        var resourceStore       = t.getResourceStore(),
            assignmentStore     = t.getAssignmentStore({
                resourceStore : resourceStore
            }),
            taskStore           = t.getTaskStore({
                resourceStore   : resourceStore,
                assignmentStore : assignmentStore
            });

        var histogram   = new Gnt.panel.ResourceHistogram({
            startDate       : taskStore.getTotalTimeSpan().start,
            endDate         : taskStore.getTotalTimeSpan().end,
            taskStore       : taskStore,
            resourceStore   : resourceStore,
            assignmentStore : assignmentStore,
            width           : 400,
            height          : 400,
            renderTo        : Ext.getBody()
        });


        //{ Id: 'r6', Name: 'Peter' }
        //{ Id: 'a1', ResourceId: 'r1', TaskId : 117, Units : 50 },

        t.chain([
            { waitFor : 'rowsVisible', args : histogram },
            function(next) {
                assignmentStore.getById('a1').setResourceId('r6');

                t.notOk(histogram.allocationData.r1 && histogram.allocationData.r1.bars.length, 'there are no bars for r1 resource');
                t.ok(histogram.allocationData.r6 && histogram.allocationData.r6.bars.length, 'there are bars for r6 resource');
            }
        ]);
    });
});
