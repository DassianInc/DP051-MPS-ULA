Ext.define('Gnt.examples.performance.perfmon.store.SensorStore', {
    extend : 'Ext.data.Store',
    alias  : 'store.perfmon-sensor-store',
    fields : ['run', 'ms', 'times'],

    config : {
        run          : 0,
        bufferLength : 10
    },

    insert : function(index, records) {
        var me          = this,
            tempRecords = [].concat(records),
            run         = me.getRun(),
            bufLen      = me.getBufferLength(),
            i, len, r;

        for (i = 0, len = tempRecords.length; i < len; i++) {
            r = tempRecords[i];
            if (r.isModel) {
                r.set('run', ++run);
            }
            else {
                r.run = ++run;
            }
        }

        me.setRun(run);

        me.beginUpdate();
        me.callParent([index, records]);
        if (me.getCount() > bufLen) {
            me.removeAt(0, me.getCount() - bufLen);
        }
        me.endUpdate();
    }
});
