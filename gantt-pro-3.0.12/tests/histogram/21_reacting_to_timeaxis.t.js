StartTest(function(t) {

    t.it('should react to zoomToFit of partner panel', function (t) {
        var g = t.getGantt({
            lockedGridConfig : { width : 150 },
            renderTo         : document.body,
            width            : 400,
            height           : 100
        });

        var h = Ext.create('Gnt.panel.ResourceHistogram', {
            renderTo  : document.body,

            taskStore       : g.taskStore,
            resourceStore   : g.resourceStore,
            assignmentStore : g.assignmentStore,
            lockedGridConfig : { width : 150 },

            partnerTimelinePanel : g,
            width         : 400,
            height        : 100
        });


        function assertHeadersAligned(msg) {
            var histoHeaders = h.el.select('.sch-column-header');

            t.is(h.timeAxisViewModel.getAvailableWidth(), g.timeAxisViewModel.getAvailableWidth(), msg + ': Same available width for timeAxisVewModel');
            t.is(h.timeAxisViewModel.tickWidth, g.timeAxisViewModel.tickWidth, msg + ': Same tick width for timeAxisVewModel');

            g.el.select('.sch-column-header').each(function(el, coll, i) {
                t.is(Ext.fly(histoHeaders.elements[i]).getWidth(), el.getWidth(), msg + ':' + i + ' header cell aligned');
            });
        }

        t.chain(
            { waitFor : 1000 },

            function (next) {
                g.zoomToFit();
                next();
            },

            { waitFor : 100 },

            function (next) {
                assertHeadersAligned('After 1st zoom to fit');

                g.zoomToFit();
                next();
            },
            { waitFor : 100 },

            function (next) {
                assertHeadersAligned('After 2nd zoom to fit');
            }
        );
    });

    // #1157: checks that histogram rebuilds data bars on its timeAxis reconfigure
    t.it('should rebuild bars on timeaxis change', function (t) {

        var resourceStore   = t.getResourceStore({
            data: [
                { Id: "r1", Name: "r1" }
            ]
        });

        var assignmentStore = t.getAssignmentStore({
            data: [
                { Id: "a1", ResourceId: "r1", TaskId : 117, Units : 50 }
            ]
        });

        var dependencyStore = t.getDependencyStore();

        var taskStore       = t.getTaskStore({
            cascadeChanges  : false,
            resourceStore   : resourceStore,
            assignmentStore : assignmentStore,
            dependencyStore : dependencyStore,
            DATA            : [
                {
                    leaf            : true,
                    Id              : 117,
                    StartDate       : "2010-02-03T00:00:00",
                    Name            : "New task 1",
                    Duration        : 90,
                    SchedulingMode  : "FixedDuration"
                }
            ]
        });

        var h           = Ext.create('Gnt.panel.ResourceHistogram', {
            renderTo                : document.body,
            startDate               : new Date(2010, 2, 1),
            endDate                 : new Date(2010, 4, 1),
            taskStore               : taskStore,
            resourceStore           : resourceStore,
            assignmentStore         : assignmentStore,
            width                   : 400,
            height                  : 100
        });

        t.chain(
            { waitFor : 1000 },

            function (next) {
                t.is(h.allocationData.r1.bars[0].startDate, h.getStart(), 'first bar start date equals to timeaxis start');

                h.setTimeSpan(new Date(2010, 1, 1), new Date(2010, 4, 1));

                next();
            },

            { waitFor : 100 },

            function (next) {
                t.is(h.allocationData.r1.bars[0].startDate, taskStore.getNodeById(117).getStartDate(), 'first bar start date equals to task #117 start');
            }
        );
    });
});
