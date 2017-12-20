StartTest(function (t) {
    // enable when this bug fixed http://www.sencha.com/forum/showthread.php?295195
    t.xit('Should share collapsed state (collapsed initially)', function (t) {
        var g = t.getGantt({
            renderTo        : Ext.getBody(),
            startDate       : new Date(2010, 0, 25),
            lockedGridConfig    : {
                collapsed : true
            }
        });

        var h = new Gnt.panel.ResourceHistogram({
            renderTo        : Ext.getBody(),
            taskStore       : g.taskStore,
            resourceStore   : g.taskStore.resourceStore,
            assignmentStore : g.taskStore.assignmentStore,
            partnerTimelinePanel    : g,
            width           : g.width,
            height          : g.height
        });

        var partnerLocked = g.lockedGrid;
        var histogramLocked = h.lockedGrid;

        t.chain(
            { waitForEventsToRender : g },
            function (next) {
                t.is(partnerLocked.getCollapsed(), 'left', 'Partner locked panel is collapsed');

                t.waitForEvent(histogramLocked, 'viewready', next);
                histogramLocked.expand();
            },
            function (next) {
                t.is(partnerLocked.getCollapsed(), false, 'Partner locked panel is expanded');
                t.is(partnerLocked.getWidth(), histogramLocked.getWidth(), 'Locked grids width is synced');

                histogramLocked.collapse();
                t.is(partnerLocked.getCollapsed(), 'left', 'Partner locked panel is collapsed');

                partnerLocked.expand();
                t.is(histogramLocked.getCollapsed(), false, 'Partner locked panel is expanded');

                partnerLocked.collapse();
                t.is(histogramLocked.getCollapsed(), 'left', 'Partner locked panel is collapsed');

                h.destroy();
                g.destroy();
            }
        );
    });
});