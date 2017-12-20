StartTest(function (t) {
    // this example doesn't work in IE8
    if (Ext.isIE8) {
        return;
    }

    t.expectGlobals('App', 'MyApp', 'ExampleDefaults');

    var gantt, scheduler;

    function assertPanelsSynced() {
        var headersSynced = gantt.normalGrid.headerCt.el.dom.scrollLeft === scheduler.normalGrid.headerCt.el.dom.scrollLeft;
        var bodiesSynced = gantt.normalGrid.getView().getHorizontalScroll() === scheduler.normalGrid.getView().getHorizontalScroll();

        if (headersSynced && bodiesSynced) {
            t.ok(headersSynced, 'Header scroll synced');
            t.ok(bodiesSynced, 'Body scroll synced');

            t.is(gantt.timeAxisViewModel, scheduler.timeAxisViewModel, 'View model should always be shared');
            t.is(gantt.viewPreset , scheduler.viewPreset, 'View preset should always be shared');
        }

        return headersSynced && bodiesSynced;
    }

    t.chain(

        { waitFor : 'selector', args : '.sch-gantt-item', timeout : 30000 },

        function(next) {
            gantt = t.cq1('ganttpanel');

            t.isGreater(gantt.assignmentStore.getCount(), 0, 'AssignmentStore has data');
            t.isGreater(gantt.resourceStore.getCount(), 0, 'ResourceStore has data');
            t.isGreater(gantt.calendar.getCount(), 0, 'Calendar has data');
            t.isGreater(gantt.dependencyStore.getCount(), 0, 'DependencyStore has data');

            next();

        },

        { click : '>>#resourceschedule' },

        { waitForSelector : '.sch-event' },

        { waitFor : 1000 },

        function(next) {
            gantt = t.cq1('ganttpanel');
            scheduler = t.cq1('schedulergrid');

            // One for task itself, and once for root
            t.firesOnce(gantt.taskStore, 'update');
            t.firesOnce(gantt.assignmentStore, 'add');
            t.firesOnce(gantt.assignmentStore,  'remove');

            t.ok(assertPanelsSynced(), 'In sync initially');

            gantt.zoomOut();
            next();
        },

        { waitFor : 200 },

        { drag : '.sch-event:contains(Evaluate)', by : [40, -40] },

        { waitFor : assertPanelsSynced, desc : 'In sync after event drag' },

        function (next) {
            gantt.zoomOut();
            next();
        },

        { waitFor : assertPanelsSynced, desc : 'In sync after 1st zooming out' },

        function (next) {
            gantt.zoomOut();
            next();
        },

        { waitFor : assertPanelsSynced, desc : 'In sync after 2nd zooming out' },

        { drag : '>>ganttpanel splitter', by: [-10, 0] },

        function(next) {
            t.is(t.cq1('ganttpanel treepanel').getWidth(), t.cq1('schedulergrid gridpanel').getWidth(), 'Locked grid widths should be synced');

            t.livesOk(function() {
                scheduler.destroy();
            }, 'Should be able to destroy scheduler when paired with Gantt');

            t.livesOk(function() {
                gantt.destroy();
            }, 'Should be able to destroy gantt');
        }
    );
});
