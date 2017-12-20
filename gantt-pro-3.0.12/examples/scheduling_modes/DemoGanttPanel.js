Ext.define("MyApp.DemoGanttPanel", {
    extend      : "Gnt.panel.Gantt",

    requires    : [
        'Gnt.plugin.TaskContextMenu',
        'Gnt.column.StartDate',
        'Gnt.column.EndDate',
        'Gnt.column.Duration',
        'Gnt.column.PercentDone',
        'Gnt.column.ResourceAssignment',
        'Sch.plugin.TreeCellEditing',
        'Sch.plugin.Pan'
    ],

    rightLabelField         : 'Responsible',
    highlightWeekends       : true,
    showTodayLine           : true,
    loadMask                : true,
    stripeRows              : true,
    enableProgressBarResize : true,

    initComponent : function() {

        Ext.apply(this, {
            leftLabelField  : {
                dataIndex   : 'Name',
                editor      : { xtype : 'textfield' }
            },

            // Add some extra functionality
            plugins : [
                Ext.create("Gnt.plugin.TaskContextMenu"),
                Ext.create("Sch.plugin.Pan"),
                Ext.create('Sch.plugin.TreeCellEditing', { clicksToEdit: 1 })
            ],

            // Define an HTML template for the tooltip
            tooltipTpl : new Ext.XTemplate(
                '<h4 class="tipHeader">{Name}</h4>',
                '<table class="taskTip">',
                    '<tr><td>Start:</td> <td align="right">{[values._record.getDisplayStartDate("y-m-d")]}</td></tr>',
                    '<tr><td>End:</td> <td align="right">{[values._record.getDisplayEndDate("y-m-d")]}</td></tr>',
                    '<tr><td>Progress:</td><td align="right">{[Math.round(values.PercentDone)]}%</td></tr>',
                '</table>'
            ).compile(),

            // Define the static columns
            columns : [
                {
                    xtype       : 'namecolumn',
                    width       : 110
                },
                {
                    xtype       : 'startdatecolumn',
                    format      : 'D m/d',
                    width       : 70
                },
                {
                    xtype       : 'enddatecolumn',
                    format      : 'D m/d',
                    width       : 70
                },
                {
                    xtype       : 'durationcolumn',
                    width       : 60
                },
                {

                    xtype       : 'effortcolumn',
                    width       : 60
                },
                {
                    xtype       : 'schedulingmodecolumn',
                    width       : 60
                },
                {
                    xtype       : 'resourceassignmentcolumn',
                    text        : 'Assigned Resources',
                    width       :150
                }
            ],

             // Define the buttons that are available for user interaction
            tbar : [{
                xtype: 'buttongroup',
                title: 'Navigation',
                columns: 2,
                defaults: {
                    scale: 'large'
                },
                items: [{
                    iconCls : 'icon-prev',
                    scope : this,
                    handler : function() {
                        this.shiftPrevious();
                    }
                },
                {
                    iconCls : 'icon-next',
                    scope : this,
                    handler : function() {
                        this.shiftNext();
                    }
                }]
            },
            {
                xtype: 'buttongroup',
                title: 'View tools',
                columns: 2,
                defaults: {
                    scale: 'small'
                },
                items: [
                    {
                        text : 'Collapse all',
                        iconCls : 'icon-collapseall',
                        scope : this,
                        handler : function() {
                            this.collapseAll();
                        }
                    },
                    {
                        text : 'Zoom to fit',
                        iconCls : 'zoomfit',
                        handler : function() {
                            this.zoomToFit();
                        },
                        scope : this
                    },
                    {
                        text : 'Expand all',
                        iconCls : 'icon-expandall',
                        scope : this,
                        handler : function() {
                            this.expandAll();
                        }
                    }
                ]
            },
            {
                xtype: 'buttongroup',
                title: 'View resolution',
                columns: 2,
                defaults: {
                    scale: 'large'
                },
                items: [{
                        text: '10 weeks',
                        scope : this,
                        handler : function() {
                            this.switchViewPreset('weekAndDayLetter');
                        }
                    },
                    {
                        text: '1 year',
                        scope : this,
                        handler : function() {
                            this.switchViewPreset('monthAndYear');
                        }
                    }
                ]}
            ]
        });

        this.callParent(arguments);
    }
});
