Ext.define('MyApp.view.ResourceHistogram', {
    extend          : 'Gnt.panel.ResourceHistogram',
    alias           : 'widget.resourcehistogram',

    title           : 'RESOURCE UTILIZATION',
    viewPreset      : 'weekAndDayLetter',
    hideHeaders     : true,
    hidden          : true,
    flex            : 1,
    rowHeight       : 60,

    scaleStep       : 1,
    scaleLabelStep  : 4,
    scaleMin        : 0,
    scaleMax        : 8,

    initComponent : function () {
        Ext.apply(this, {
            columns : [
                {
                    tdCls     : 'histogram-icon',
                    width     : 50,
                    renderer  : function (val, meta, rec) {
                        meta.tdCls = 'icon-' + rec.data.Type;
                    }
                },
                {
                    flex      : 1,
                    tdCls     : 'histogram-name',
                    dataIndex : 'Name'
                },
                {
                    xtype           : 'scalecolumn'
                }
            ]
        });

        this.tipCfg = { cls : 'bartip' };

        var me = this;

        this.tooltipTpl = new Ext.XTemplate(
            '<tpl for=".">',
                '<table>',
                    '<tr><th class="caption" colspan="2">Resource: <strong>{resource.data.Name}</strong></th></tr>',
                    '<tr>',
                        '<th>Start:</th><td>{[Ext.Date.format(values.startDate, "y-m-d")]}</td>',
                    '</tr>',
                    '<tr>',
                        '<th>End:</th><td>{[Ext.Date.format(Ext.Date.add(values.endDate, Ext.Date.MILLI, -1), "y-m-d")]}</td>',
                    '</tr>',
                    '<tr>',
                        '<th>Utilization %:</th><td>{totalAllocation}%</td>',
                    '</tr>',
                    '<tr>',
                        '<th>Utilization (hrs):</th><td>{[Math.round(this.getHours(values.allocationMS))]}</td>',
                    '</tr>',
                '</table>',
            '</tpl>',
            {
                getHours : function (ms) {
                    return me.calendar.convertMSDurationToUnit(ms, 'HOUR');
                }
            }
        );

        this.callParent(arguments);
    }

});
