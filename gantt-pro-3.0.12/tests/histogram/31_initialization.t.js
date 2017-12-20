StartTest(function (t) {

    t.it('should handle rendering of histogram first', function (t) {
        var resourceStore = t.getResourceStore();

        var g = t.getGantt({
            lockedGridConfig : { width : 150 },
            resourceStore    : resourceStore,
            width            : 400,
            height           : 100
        });

        var h = Ext.create('Gnt.panel.ResourceHistogram', {
            startDate               : this.startDate,
            endDate                 : this.endDate,

            taskStore               : g.taskStore,
            resourceStore           : resourceStore,
            assignmentStore         : g.assignmentStore,

            partnerTimelinePanel    : g,
            width                   : 400,
            height                  : 100
        });

        h.render(document.body);
        g.render(document.body);

        t.chain(
            { waitFor : 'rowsVisible', args : h },
            function () {
                var lockedHeader = h.lockedGrid.headerCt;

                t.is(g.lockedGrid.getWidth(), h.lockedGrid.getWidth(), 'Matching widths for locked grids');
                t.isApprox(lockedHeader.items.getAt(0).getWidth() + lockedHeader.items.getAt(1).getWidth(), h.lockedGrid.getWidth(), 1, 'Column widths match total width');
            }
        )
    });

    t.it('should handle rendering of gantt first', function (t) {
        var resourceStore = t.getResourceStore();
        var g = t.getGantt({
            lockedGridConfig : { width : 150 },
            resourceStore    : resourceStore,
            width            : 400,
            height           : 100
        });

        var h = Ext.create('Gnt.panel.ResourceHistogram', {
            startDate : this.startDate,
            endDate   : this.endDate,

            taskStore       : g.taskStore,
            resourceStore   : resourceStore,
            assignmentStore : g.assignmentStore,

            partnerTimelinePanel    : g,
            width                   : 400,
            height                  : 100
        });

        g.render(document.body)
        h.render(document.body);

        t.chain(
            { waitFor : 'rowsVisible', args : h },
            function () {
                var lockedHeader = h.lockedGrid.headerCt;

                t.is(g.lockedGrid.getWidth(), h.lockedGrid.getWidth(), 'Matching widths for locked grids');
                t.isApprox(lockedHeader.items.getAt(0).getWidth() + lockedHeader.items.getAt(1).getWidth(), h.lockedGrid.getWidth(), 1, 'Column widths match total width');
            }
        )
    });


    t.it('should handle rendering of gantt first #2', function (t) {
        var resourceStore = t.getResourceStore();
        var g = t.getGantt({
            lockedGridConfig : { width : 150 },
            resourceStore    : resourceStore,
            renderTo         : document.body,
            width            : 400,
            height           : 100
        });

        var h = Ext.create('Gnt.panel.ResourceHistogram', {
            startDate : this.startDate,
            endDate   : this.endDate,
            renderTo  : document.body,

            taskStore       : g.taskStore,
            resourceStore   : resourceStore,
            assignmentStore : g.assignmentStore,

            partnerTimelinePanel    : g,
            width                   : 400,
            height                  : 100
        });

        t.chain(
            { waitFor : 'rowsVisible', args : h },
            function () {
                var lockedHeader = h.lockedGrid.headerCt;

                t.is(g.lockedGrid.getWidth(), h.lockedGrid.getWidth(), 'Matching widths for locked grids');
                t.isApprox(lockedHeader.items.getAt(0).getWidth() + lockedHeader.items.getAt(1).getWidth(), h.lockedGrid.getWidth(), 1, 'Column widths match total width');
            }
        )
    });

    t.it('Should be able to destroy histogram', function (t) {
        var resourceStore = t.getResourceStore();
        var g = t.getGantt({
            resourceStore    : resourceStore,
            renderTo         : document.body
        });

        var h = Ext.create('Gnt.panel.ResourceHistogram', {
            renderTo  : document.body,
            id              : 'histo',
            taskStore       : g.taskStore,
            resourceStore   : resourceStore,
            assignmentStore : g.assignmentStore,

            timelinePanel : g,
            width         : 400,
            height        : 100
        }).destroy();

        t.notOk(Ext.getCmp('histo'), 'Should not find destroyed histogram in CmpManager')
    });
});
