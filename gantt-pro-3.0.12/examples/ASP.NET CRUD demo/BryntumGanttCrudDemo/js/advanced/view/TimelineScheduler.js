Ext.define("Gnt.examples.advanced.view.TimelineScheduler", {
    extend                  : 'Sch.panel.SchedulerGrid',

    requires                : [
        'Sch.data.ResourceStore',
        'Sch.data.EventStore'
    ],

    alias                   : 'widget.timelinescheduler',

    taskStore               : null,
    barMargin               : 1,
    border                  : false,
    rowLines                : false,
    columnLines             : false,
    readOnly                : true,
    enableDragCreation      : false,
    forceFit                : true,
    milestoneBottomPadding  : 23, // To leave space for milestones to extend outside the row
    autoAdjustTimeAxis      : false,
    leftTimespanMargin      : 25,
    rightTimespanMargin     : 50,


    initComponent : function () {

        Ext.apply(this, {
            normalViewConfig : {
                onEventUpdate : Ext.Function.createBuffered(this.onEventUpdate, 5, this),
                onEventAdd    : Ext.Function.bind(this.refreshMainRow, this),
                onEventRemove : Ext.Function.bind(this.refreshMainRow, this)
            },

            resourceStore : new Sch.data.ResourceStore({
                data : [
                    { Id : 1 }
                ]
            }),

            eventStore : new Sch.data.EventStore({
                // Since we will fill the store with Tasks instead of events and we work without assignment store
                // we have to disable resource events cache because it is designed to work with Events only
                createResourceEventsCache : Ext.emptyFn,

                filterEventsForResource : function () {
                    return this.getRange();
                },

                getEventsForResource : function () {
                    return this.getRange();
                },

                isDateRangeAvailable : function (start, end, excludeEvent, resource) {
                    if (!start || !end) return true;

                    var DATE = Sch.util.Date,
                        events = this.getRange(),
                        available = true;

                    // This can be optimized further if we use simple for() statement (will lead to -1 function call in the loop)
                    Ext.each(events, function (ev) {

                        available = (
                        excludeEvent === ev ||
                        ev.getDuration() === 0 || !ev.getStartDate() || !ev.getEndDate() || !DATE.intersectSpans(start, end, ev.getStartDate(), ev.getEndDate())
                        );

                        return available; // to immediately stop looping if interval is occupied by a non excluding event
                    });

                    return available;
                }
            })
        });

        this.callParent(arguments);

        var root = this.taskStore.getRoot();

        if (root && root.childNodes.length) {
            if (this.rendered) {
                this.fillStoreFromTaskStore();
            } else {
                // wait till the 1st layout happen to make sure the panel has width fullfilled
                this.on({
                    afterlayout : this.fillStoreFromTaskStore,
                    scope       : this,
                    single      : true
                });
            }
        }

        this.taskStore.on({
            load       : this.fillStoreFromTaskStore,
            update     : this.onTaskUpdated,
            noderemove : function (store, removedNode, isMove) {
                if (!isMove) {
                    this.eventStore.remove(removedNode);
                }
            },
            //nodeappend : this.synchronize,
            clear      : function() {
                this.eventStore.removeAll();
            },

            scope : this
        });

        this.on('resize', this.onSchedResize, this);

        this.resourceRecord = this.resourceStore.first();


        // HACK prevent scheduler from considering milestones when calculating number of bands to use for the
        // event bars - since milestones are put at the bottom.
        var oldLayoutFn = this.getSchedulingView().eventLayout.horizontal.applyLayout;

        this.getSchedulingView().eventLayout.horizontal.applyLayout = function (events, resource) {
            events = Ext.Array.filter(events, function(ev) {
                return ev.event.getDuration() > 0;
            });
            return oldLayoutFn.call(this, events, resource);
        };
        // EOF HACK
    },

    refreshMainRow : function () {
        this.getSchedulingView().repaintEventsForResource(this.resourceRecord);
    },

    eventRenderer : function (ev, resource, meta) {

        if (ev.store.isDateRangeAvailable(ev.getStartDate(), ev.getEndDate(), ev, resource)) {
            meta.cls = 'sch-gantt-timeline-stretch';
        }

        return ev.getName();
    },

    // On a change in the task store, only check if ShowInTimeline flag has been set to true
    onTaskUpdated : function (store, task, operation, modifiedFields) {
        if (modifiedFields) {

            if (Ext.Array.contains(modifiedFields, "ShowInTimeline")) {
                this.eventStore.add(task);
                this.zoomToFit();
            }
        }
    },

    onEventUpdate : function (store, task, operation, modifiedFields) {

        if (modifiedFields && Ext.Array.contains(modifiedFields, "ShowInTimeline") && !task.get('ShowInTimeline')) {
            this.eventStore.remove(task);
        } else {
            var ignoreFields = {
                index    : 1,
                leaf     : 1,
                expanded : 1,
                phantom  : 1
            };

            this.refreshMainRow();

            if (modifiedFields && (Ext.Array.contains(modifiedFields, task.startDateField) || Ext.Array.contains(modifiedFields, task.endDateField))) {
                this.zoomToFit();
            }
        }
    },

    fillStoreFromTaskStore : function() {
        var timelineTasks = [],
            milestones = [];

        this.taskStore.forEachTaskUnordered(function (task) {
            if (task.get('ShowInTimeline')) {
                if (task.isMilestone()) {
                    milestones.push(task);
                } else {
                    timelineTasks.push(task);
                }
            }
        });

        // milestones go after other tasks to have them drawn above by default
        timelineTasks = timelineTasks.concat(milestones);

        this.eventStore.removeAll();

        if (timelineTasks.length || this.eventStore.getCount()) {
            this.eventStore.loadData(timelineTasks);

            this.zoomToFit();
        }
    },

    zoomToFit : function () {

        this.suspendLayouts();

        this.callParent([{
            leftMargin  : this.leftTimespanMargin,
            rightMargin : this.rightTimespanMargin
        }]);

        this.fitEvents();

        this.resumeLayouts();
    },

    onSchedResize : function (cmp, width, height, oldWidth, oldHeight) {
        if (height !== oldHeight) {
            this.fitEvents();
        }
    },

    fitEvents : function (cmp, width, height, oldWidth, oldHeight) {
        var nbrBands = this.getSchedulingView().eventLayout.horizontal.nbrOfBandsByResource[this.resourceRecord.internalId] || 1,
            availableHeight = this.getSchedulingView().getHeight();

        this.setRowHeight(Math.ceil((availableHeight - this.milestoneBottomPadding) / nbrBands));
    }

});
