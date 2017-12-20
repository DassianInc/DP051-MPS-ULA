Ext.define("MyApp.view.Gantt", {
    extend              : 'Gnt.panel.Gantt',
    alias               : 'widget.gantt',

    // Ext JS configs
    requires            : [
        'MyApp.store.TaskStore',
        'MyApp.view.GanttToolbar'
    ],

    flex                : 1,
    title               : 'GANTT CHART',
    lockedGridConfig    : { width : 300 },
    loadMask            : true,

    // Gantt configs
    leftLabelField      : 'Name',
    highlightWeekends   : true,
    viewPreset          : 'weekAndDayLetter',
    columnLines         : true,
    cascadeChanges      : true,

    tipCfg : { cls : 'tasktip' },

    // Define an HTML template for the tooltip
    tooltipTpl : new Ext.XTemplate(
        '<table>',
        '<tr><th class="caption" colspan="2">#{Id} {Name}</th></tr>',
        '<tr>',
        '<th>Start:</th><td>{[values._record.getDisplayStartDate("y-m-d")]}</td>',
        '</tr>',
        '<tr>',
        '<th>End:</th><td>{[values._record.getDisplayEndDate("y-m-d")]}</td>',
        '</tr>',
        '<tr>',
        '<th>Progress:</th><td>{[Math.round(values.PercentDone)]}%</td>',
        '</tr>',
        '</table>'
    ),

    initComponent : function() {
        var me = this;

        Ext.apply(this, {
            tbar : {
                xtype : 'gantttoolbar',
                gantt : this
            }
        });

        this.callParent(arguments);
    },

    viewConfig : {
        getRowClass : function(record) {
            // Output a custom CSS class with some task property that we can use for styling
            return 'TASKID_' + record.data.Id;
        }
    },

    columns : [
        {
            xtype       : 'namecolumn',
            tdCls       : 'namecell',
            width       : 200
        },
        {
            header      : 'Assigned Resources',
            width       : 150,
            tdCls       : 'resourcecell',
            xtype       : 'resourceassignmentcolumn'
        },
        {
            xtype       : 'startdatecolumn'
        },
        {
            xtype       : 'durationcolumn'
        },
        {
            xtype       : 'predecessorcolumn'
        },
        {
            xtype       : 'addnewcolumn'
        }
    ],

    plugins : [
        'gantt_projecteditor',
        'gantt_taskeditor',
        'scheduler_treecellediting',
        'gantt_taskcontextmenu'
    ]
});
