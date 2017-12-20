Ext.define('Gnt.model.UtilizationResource', {
    extend              : 'Sch.model.Resource',
    requires            : [
        'Ext.data.NodeInterface'
    ],

    fields              : [
        'TaskId'
    ],

    originalTask        : null,
    originalResource    : null,
    intervals           : null,

    constructor : function (cfg) {

        if (cfg.originalTask) {
            this.originalTask = cfg.originalTask;
            cfg.TaskId        = this.originalTask.getId();

            delete cfg.originalTask;
        }

        if (cfg.originalResource) {
            this.originalResource = cfg.originalResource;

            delete cfg.originalResource;
        }

        this.callParent(arguments);
    },

    getName : function () {
        // 'this' is either a resource or a task
        return (this.originalTask || this.originalResource).getName();
    },

    clearIntervals : function () {
        this.intervals = null;
    },

    createUtilizationIntervals : function (timeAxis) {
        // TODO: hardcoded model
        var model      = Sch.model.Event;
        var idProperty = model.prototype.idProperty;
        var intervals  = [];

        timeAxis.each(function (tick) {
            var data         = {};
            data[idProperty] = model.identifier.generate();

            intervals.push(new model(Ext.apply(data, {
                ResourceId : this.getId(),
                StartDate  : tick.data.start,
                EndDate    : tick.data.end
            })));
        }, this);

        return intervals;
    },

    getEvents : function () {
        if (!this.intervals) {
            var resourceStore = this.getTreeStore();

            this.intervals = this.createUtilizationIntervals(resourceStore.timeAxis);

            // Also add events to event store
            var eventStore = resourceStore.eventStore;

            eventStore.suspendEvents();
            eventStore.add(this.intervals);
            eventStore.resumeEvents();
        }

        return this.intervals;
    },

    getUtilizationInfoForSpan : function (startDate, endDate, underUtilizeThreshold) {
        var ganttResource           = this.originalResource || this.parentNode.originalResource,
            intervalAmountMs        = 0,
            optimallyAllocated      = true,
            overAllocated,
            underAllocated;

        var allocationIntervals     = ganttResource.getAllocationInfo({
            startDate : startDate,
            endDate   : endDate,
            task      : this.originalTask // resource is either a Resource or a Task
        });

        Ext.Array.each(allocationIntervals, function (intervalInfo) {
            intervalAmountMs += intervalInfo.totalAllocationMS;

            if (intervalInfo.effectiveTotalAllocation > 100) {
                overAllocated      = true;
                optimallyAllocated = false;
            } else if (intervalInfo.effectiveTotalAllocation < underUtilizeThreshold) {
                underAllocated = true;
            }
            if (intervalInfo.effectiveTotalAllocation < 100) {
                optimallyAllocated = false;
            }
        });

        optimallyAllocated = optimallyAllocated && allocationIntervals.length > 0;

        return {
            ms                 : intervalAmountMs,
            overAllocated      : overAllocated,
            underAllocated     : underAllocated,
            optimallyAllocated : optimallyAllocated
        };
    }

}, function () {
    Ext.data.NodeInterface.decorate(this);
});
