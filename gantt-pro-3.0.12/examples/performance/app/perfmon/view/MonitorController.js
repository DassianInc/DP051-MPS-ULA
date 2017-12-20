Ext.define('Gnt.examples.performance.perfmon.view.MonitorController', function(thisClass) {

    var control = {
        '#' : {
            'sensors-updated' : onSensorsUpdated$,
            'destroy'         : onMonitorDestroyed$
        }
    };

    var bufferedMeasures = {};

    var scheduleBufferedMeasuresFlush = Ext.Function.createBuffered(
        function() {
            Ext.Object.each(bufferedMeasures, function(monitorId, sensors) {
                var monitor = Ext.getCmp(monitorId);

                monitor && Ext.Object.each(sensors, function(sensorName, sensorData) {
                    var store = monitor.getStore(sensorName),
                        times = 0,
                        ms = 0;

                    if (store && sensorData.length) {
                        Ext.Array.forEach(sensorData, function(measure) {
                            ms    += measure.ms;
                            times += measure.times;
                        });
                        store.add({ ms : ms, times : times });
                    }

                    sensors[sensorName] = [];
                });
            });
        },
        100
    );

    function init$() {
        var me      = this,
            model   = me.getViewModel(),
            monitor = me.getView(),
            bus     = Ext.create('Gnt.examples.performance.perfmon.Bus');

        monitor.setBus(bus);

        bufferedMeasures[monitor.getId()] = [];
    }

    function onMonitorDestroyed$(monitor) {
        delete bufferedMeasures[monitor.getId()];
    }

    function onSensorsUpdated$(monitor, newSensors, oldSensors) {
        var me = this,
            bus = monitor.getBus(),
            monitorId = monitor.getId();

        oldSensors && Ext.Object.each(oldSensors, function(sensorName, sensorLabel) {
            delete bufferedMeasures[monitorId][sensorName];
            bus.un(sensorName, onSensorSignalStart$);
        });

        newSensors && Ext.Object.each(newSensors, function(sensorName, sensorLabel) {
            bufferedMeasures[monitorId][sensorName] = [];
            bus.on(sensorName, onSensorSignalStart$, me, {
                sensorName : sensorName
            });
        });
    }

    function onSensorSignalStart$(stopSignal, eOpts) {
        var me      = this,
            monitor = me.getView(),
            bus     = monitor.getBus();

        bus.on(stopSignal, onSensorSignalStop$, me, {
            single  : true,
            signalStartAt : new Date(),
            sensorName    : eOpts.sensorName
        });
    }

    function onSensorSignalStop$(eOpts) {
        var me            = this,
            monitor       = me.getView(),
            monitorId     = monitor.getId(),
            sensorName    = eOpts.sensorName,
            signalStartAt = eOpts.signalStartAt,
            store         = monitor.getStore(sensorName),
            buffer;

        if (store) {
            buffer = bufferedMeasures[monitorId][sensorName];
            buffer.push({ ms : new Date() - signalStartAt, times : 1 });
        }

        scheduleBufferedMeasuresFlush();
    }

    return {
        extend : 'Ext.app.ViewController',
        alias  : 'controller.perfmon-monitor',
        uses   : [
            'Gnt.examples.performance.perfmon.Bus'
        ],
        control : control,
        init    : init$
    };
});
