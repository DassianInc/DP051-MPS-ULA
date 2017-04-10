Ext.define('MyApp.store.InternalStore', {
    extend: 'Ext.data.Store',

    requires: [
        'Ext.data.proxy.Ajax',
        'Ext.data.reader.Array',
        'Ext.data.Field'
    ],

    constructor: function(cfg) {
        var me = this;
        cfg = cfg || {};
        me.callParent([Ext.apply({
            storeId: 'InternalStore',
            proxy: {
                type: 'ajax',
                reader: {
                    type: 'array'
                }
            },
            fields: [
                {
                    name: 'name'
                },
                {
                    name: 'value'
                }
            ]
        }, cfg)]);
    }
});