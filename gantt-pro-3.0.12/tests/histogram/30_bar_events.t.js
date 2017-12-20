StartTest(function(t) {

    // Checks how ResourceHistogram firex "bar..." events

    var resourceStore   = t.getResourceStore();

    var assignmentStore = t.getAssignmentStore();

    var dependencyStore = t.getDependencyStore();

    var taskStore = t.getTaskStore({
        cascadeChanges  : false,
        resourceStore   : resourceStore,
        assignmentStore : assignmentStore,
        dependencyStore : dependencyStore
    });

    var histogram = new Gnt.panel.ResourceHistogram({
        taskStore           : taskStore,
        resourceStore       : resourceStore,
        assignmentStore     : assignmentStore,
        startDate           : new Date(2010, 1, 1),
        endDate             : new Date(2010, 1, 12),
        rowHeight           : 50,
        scaleMin            : 0,
        scaleMax            : 24,
        scaleStep           : 12,
        scaleLabelStep      : 12,
        width               : 800,
        height              : 400,
        renderTo            : Ext.getBody(),
        listeners : {
            barclick : function (panel, context, ev) {
                if (barclickInspected) return;

                barclickInspected = true;

                inspectContext(context);
            },
            bardblclick : function (panel, context, ev) {
                inspectContext(context);
            },
            barcontextmenu : function (panel, context, ev) {
                inspectContext(context);
            }
        }
    });

    var barclickInspected   = false,
        inspectContext      = function (context) {
            t.diag("Inspect barclick context");
            t.is(context.resource.getId(), "r1", "context.resource is correct");

            t.is(context.startDate, new Date(2010, 1, 8), "context.bar.startDate is correct");
            t.is(context.endDate, new Date(2010, 1, 11), "context.bar.endDate is correct");
            t.is(context.totalAllocation, 50, "context.bar.totalAllocation is correct");
            t.is(context.allocationMS, 12*3600000, "context.bar.allocationMS is correct");
            t.is(context.assignments.length, 1, "context.bar.assignments has 1 record");
            t.is(context.assignments[0].getId(), "a1", "context.bar.assignments is correct");
        };

    var view = histogram.getView().normalView;

    var data = histogram.allocationData.r1;

    t.waitForRowsVisible(histogram, function () {

        t.firesAtLeastNTimes(view, "barclick", 1, "barclick fired at least 1 time");
        t.willFireNTimes(view, "bardblclick", 1, "bardblclick fired 1 time");
        t.willFireNTimes(view, "barcontextmenu", 1, "barcontextmenu fired 1 time");

        var bar = histogram.el.down('#r1-0');

        t.chain(
            { click         : '#r1-1' },
            { doubleClick   : '#r1-1' },
            { rightClick    : '#r1-1' },

            function (next) {
                t.diag("Check number of event occurences");
            }
        );
    });

});
