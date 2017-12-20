StartTest(function (t) {

    // #1485 - Resource histogram duplicate records

    t.it('Histogram draws proper number of rows', function (t) {

        var resourceStore       = t.getResourceStore({
            data            : []
        });

        var assignmentStore     = t.getAssignmentStore({
            resourceStore   : resourceStore,
            data            : []
        });

        var taskStore           = t.getTaskStore({
            resourceStore   : resourceStore,
            assignmentStore : assignmentStore
        });

        var gantt       = t.getGantt({
            startDate       : taskStore.getTotalTimeSpan().start,
            endDate         : taskStore.getTotalTimeSpan().end,
            taskStore       : taskStore,
            resourceStore   : resourceStore,
            assignmentStore : assignmentStore,
            width           : 400,
            height          : 400,
            renderTo        : Ext.getBody()
        });

        var histogram   = new Gnt.panel.ResourceHistogram({
            showLimitLines  : false,
            timelinePanel   : gantt,
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
        var editor  = new Gnt.widget.taskeditor.TaskEditor({
            taskStore       : taskStore,
            assignmentStore : assignmentStore,
            resourceStore   : resourceStore
        });

        editor.loadTask(taskStore.getNodeById(117));

        var assignmentGrid      = editor.assignmentGrid;
        var resourceDupStore    = assignmentGrid.resourceDupStore;
        var assignmentDupStore  = assignmentGrid.store;

        var resource1   = resourceDupStore.add({ Name : 'resource1' })[0];
        var resource2   = resourceDupStore.add({ Name : 'resource2' })[0];

        assignmentDupStore.add({ ResourceId : resource1.getId(), Units: 100 });
        assignmentDupStore.add({ ResourceId : resource2.getId(), Units: 100 });

        assignmentGrid.saveTaskAssignments();

        t.is(histogram.lockedGrid.getView().all.getCount(), 2);
        t.is(histogram.normalGrid.getView().all.getCount(), 2);

    });

});
