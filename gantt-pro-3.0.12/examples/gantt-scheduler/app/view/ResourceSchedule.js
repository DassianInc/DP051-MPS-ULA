Ext.define("MyApp.view.ResourceSchedule", {
    extend : 'Sch.panel.SchedulerGrid',
    alias  : 'widget.resourceschedule',
    title  : 'RESOURCE SCHEDULE - IN GANTT 3.X VERSION THIS TIMELINE REQUIRES A SEPARATE LICENSE FOR EXT SCHEDULER',
    flex   : 1,
    layout : 'border',
    hidden : true,

    // Use the same layout and appearance as the Gantt chart
    lockedGridConfig : { width : 300, region : 'west' },
    viewConfig       : {
        preserveScrollOnRefresh : true,
        segmentsTpl             : new Ext.XTemplate(
            '<div class="sch-gantt-segment-connector"></div>',
            '<tpl for="segments">',
            '<div class="resource-segment {cls}" style="left:{left}px;width:{width}px;{style}"><div class="resource-segment-inner">{name}</div></div>',
            '</tpl>')
    },

    // Scheduler configs
    viewPreset         : 'weekAndDayLetter',
    enableDragCreation : false,
    barMargin          : 2,
    rowHeight          : 30,
    assignmentStore    : null,
    workingTimeStore   : null,
    zonesPlugin        : null,

    initComponent : function () {
        Ext.apply(this, {
//            features : [{
//                groupHeaderTpl: '{name}',
//                ftype : 'grouping'
//            }],
            plugins : [
                new Sch.plugin.TreeCellEditing({}),

                // Reuse store for weekend highlighting
                this.zonesPlugin = new Sch.plugin.Zones({
                    store : this.workingTimeStore
                })
            ],
            columns : [
                {
                    text      : 'Name',
                    flex      : 1,
                    dataIndex : 'Name',
                    editor    : { xtype : 'textfield' }
                }
            ]
        });

        this.callParent(arguments);
    },


    getSegmentTplData : function (segment, view, event, meta) {
        var tplData   = {},
            ta        = view.timeAxis,
            D         = Sch.util.Date,
            viewStart = ta.getStart(),
            viewEnd   = ta.getEnd();

        var partEndDate   = segment.getEndDate() || event.getStartDate(),
            partStartDate = segment.getStartDate(),
            partStartX, partEndX;

        // if the segment starts in the visible area
        if (D.betweenLesser(partStartDate, viewStart, viewEnd)) {
            partStartX = Math.floor(view.getXFromDate(partStartDate));

            // if it ends in visible area as well
            if (D.betweenLesser(partEndDate, viewStart, viewEnd)) {
                partEndX = Math.floor(view.getXFromDate(partEndDate));
            } else {
                partEndX = Math.floor(view.getXFromDate(viewEnd));
            }

            // if its start is invisible
        } else {
            partStartX = Math.floor(view.getXFromDate(viewStart));

            // if end is visible
            if (D.betweenLesser(partEndDate, viewStart, viewEnd)) {
                partEndX = Math.floor(view.getXFromDate(partEndDate));

                // if both ends are invisible lets move them outside of visible area
            } else if (partStartDate > viewEnd && partEndDate > viewEnd) {
                partStartX = partEndX = Math.floor(view.getXFromDate(viewEnd)) + 100;
            } else if (partStartDate < viewStart && partEndDate < viewStart) {
                partStartX = partEndX = Math.floor(view.getXFromDate(viewStart)) - 100;

                // if the segment starts before the view start and ends after the view end
            } else {
                partEndX = Math.floor(view.getXFromDate(viewEnd));
            }
        }

        tplData.left  = partStartX - meta.left;
        tplData.width = partEndX - partStartX;
        tplData.name  = event.getName();

        Ext.apply(tplData, segment.data);
        tplData.cls   = segment.getCls() || '';

        return tplData;
    },


    // Helps scheduler out with milestone and split task rendering
    eventRenderer : function (event, resource, meta) {

        var segments        = event.getSegments(),
            segmentsTplData = [];

        // if the task is split
        if (segments) {
            var panel = this.panel.ownerGrid;

            for (var i = 0, l = segments.length; i < l; i++) {
                segmentsTplData.push(panel.getSegmentTplData(segments[i], this, event, meta));
            }

            segments[0].cls += ' sch-gantt-task-segment-first';
            segments[l - 1].cls += ' sch-gantt-task-segment-last';
        }

        var content = event.getName();

        if (event.isMilestone()) {
            meta.cls = 'sch-event-milestone';
        }

        if (segments) {
            if (Ext.isString(meta.cls)) {
                meta.cls += ' sch-event-segmented resource-segmented';
            } else {
                meta.cls = 'sch-event-segmented resource-segmented';
            }

            content = this.segmentsTpl.apply({
                segments : segmentsTplData
            });
        }

        return content;
    }
});