Ext.define("MyApp.view.ResourceList", {
    extend                  : 'Ext.grid.Panel',
    alias                   : 'widget.resourcelist',
    title                   : 'RESOURCES',
    flex                    : 1,
    hidden                  : true,
    bodyCls                 : 'resourcelist',
    columnLines             : true,

    initComponent : function() {
        Ext.apply(this, {
//            features : [{
//                groupHeaderTpl: '{name}',
//                ftype : 'grouping'
//            }],
            plugins     : [
                new Ext.grid.plugin.CellEditing({ })
            ],
            columns     : [
                { text : 'id',    width:40, dataIndex : 'Id' },
                { text : 'Type',  width:60, tdCls : 'resource-type', dataIndex : 'Type', renderer : function(v, m) { m.tdCls = 'icon-' + v; } },
                { text : 'Calendar',  width:80, dataIndex : 'CalendarId' },
                { text : 'Name',  flex:1, dataIndex : 'Name', editor : { xtype : 'textfield' } }
            ]
        });

        this.callParent(arguments);
    }
});