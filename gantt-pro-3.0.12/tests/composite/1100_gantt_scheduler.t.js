StartTest(function (t) {
    var resourceStore   = t.getResourceStore();
    var depStore        = t.getDependencyStore();
    var assignmentStore = t.getAssignmentStore({
        resourceStore : resourceStore
    });
    var taskStore       = t.getTaskStore();
    var startDate       = new Date(2010, 1, 1)
    var endDate         = Sch.util.Date.add(startDate, Sch.util.Date.WEEK, 20)

    var gantt = t.getGantt({
        region              : 'center',
        highlightWeekends   : true,
        
        width               : 1000,

        startDate           : startDate,
        endDate             : endDate,
        
        viewPreset          : 'weekAndDayLetter',
        columns             : [
            {
                xtype       : 'treecolumn',
                header      : 'Tasks',
                dataIndex   : 'Name',
                width       : 200
            },
            {
                xtype       : 'resourceassignmentcolumn',
                width       : 100
            }
        ],
        taskStore           : taskStore,
        resourceStore       : resourceStore,
        assignmentStore     : assignmentStore,
        dependencyStore     : depStore,
        
        eventRenderer: function (taskRecord) {
            return {
                cls : 'gantt-task-' + taskRecord.getId()
            };
        }
    });
    
    t.verifyCachedAssignmentsState(taskStore, assignmentStore);

    resourceStore.first().assignTo(taskStore.getRootNode().lastChild);

    var scheduler = t.getScheduler({
        resourceStore       : resourceStore,
        eventStore          : taskStore,
        
        height              : 500,
        width               : 1000,
        
        layout              : 'border',

        region              : 'south',

        columns : [
            {header : 'Name', width : 350, dataIndex : 'Name'}
        ],

        // Share time axis
        partnerTimelinePanel : gantt,

        // Share non-working time visualization
        plugins              : new Sch.plugin.Zones({
            store : gantt.getWorkingTimePlugin().store
        }),
        
        eventRenderer: function (item, r, tplData, row) {
            tplData.cls = "scheduler-event-" + item.getId();
            return item.get('Name');
        }
    });

    t.is(gantt.timeAxisViewModel, scheduler.timeAxisViewModel, 'View model should always be shared')

    var vp = new Ext.Viewport({
        items : [gantt, scheduler]
    });
    
    t.is(gantt.getStart(), startDate, 'Correct start date')
    
    t.is(scheduler.timeAxis, gantt.timeAxis, 'Timeaxis shared')
    t.is(scheduler.getStart(), gantt.getStart(), 'Same start date')
    
    gantt.timeAxis.shiftNext();
    t.is(scheduler.getStart(), gantt.getStart(), 'Same start date after shift')

    t.waitForSelector('.sch-zone', scheduler.el, function() {
        t.pass('Zones rendered ok in scheduler')
    });
    
    t.waitForSelector('.sch-event', scheduler.el, function () {
        t.pass('Events rendered ok in scheduler');
        
        t.validateGanttScheduler(gantt, scheduler);

        resourceStore.first().setName('__FOO__');

        // The gantt chart should react to resource data changes
        t.matchGridCellContent(
            gantt.lockedGrid,
            gantt.lockedGrid.view.store.getCount() - 1,
            1,
            '__FOO__',
            'Should find updated resource name in assignment column'
        )

        // The gantt chart should react to event data changes in the scheduler
        t.firesAtLeastNTimes(gantt.getSchedulingView(), 'itemupdate', 1);
        
        var tw = gantt.timeAxisViewModel.getTickWidth();

        t.chain(
            { drag : '.sch-event', by : [100, 0] },

            function (next) {
                t.validateGanttScheduler(gantt, scheduler);
                next();
            },

            { drag : '.scheduler-event-120 > .sch-resizable-handle-end', by: [tw, 0] },

            function (next) {
                t.validateGanttScheduler(gantt, scheduler);
                next();
            },

            // drag two ticks left
            { drag : '.scheduler-event-115 > .sch-resizable-handle-start', by: [tw * -2, 0] },

            function (next) {
                t.validateGanttScheduler(gantt, scheduler);
                next();
            },

            // drag one tick left (reported bug)
            { drag : '.scheduler-event-115 > .sch-resizable-handle-start', by: [-tw, 0] },

            function (next) {
                t.validateGanttScheduler(gantt, scheduler);
            }
        )
    });
})
