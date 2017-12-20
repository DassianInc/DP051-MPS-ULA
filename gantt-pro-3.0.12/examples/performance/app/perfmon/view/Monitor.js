Ext.define('Gnt.examples.performance.perfmon.view.Monitor', {
    extend   : 'Ext.panel.Panel',
    xtype    : 'perfmon-monitor',
    requires : [
        'Gnt.examples.performance.perfmon.view.MonitorController',
        'Gnt.examples.performance.perfmon.store.SensorStore'
    ],

    controller : 'perfmon-monitor',

    config : {
        /**
         * @readonly
         */
        bus     : null,

        sensors : null
    },

    layout : {
        type  : 'vbox',
        align : 'stretch',
        pack  : 'start'
    },

    title : "Performance monitor",

    updateSensors : function(newSensors, oldSensors) {
        var me      = this,
            meClass = Gnt.examples.performance.perfmon.view.Monitor;

        oldSensors && Ext.Object.each(oldSensors, function(sensorName, sensorDesc) {
            var sensorChart = me.lookupReference(meClass.getSensorChartReference(sensorName));

            sensorChart && sensorChart.getStore().destroy();
        });

        me.removeAll(true);

        newSensors && Ext.Object.each(newSensors, function(sensorName, sensorLabel) {
            var sensorView = me.add({
                xtype     : 'cartesian',
                reference : meClass.getSensorChartReference(sensorName),
                animation : false,
                flex      : 1,
                store     : Ext.create('Gnt.examples.performance.perfmon.store.SensorStore', {
                    listeners : {
                        'datachanged' : function(store) {
                            sensorView.getAxes()[0].setMaximum(store.max('ms'));
                            sensorView.setSprites([{
                                type : 'text',
                                text : sensorLabel + ' (' + Math.round(store.average('ms')) + ')',
                                font: '13px Helvetica',
                                width: 100,
                                height: 10,
                                x: 20,
                                y: 14
                            }]);
                        }
                    }
                }),
                insetPadding : '30 0 0 0',
                sprites   : [{
                    type: 'text',
                    text: sensorLabel,
                    font: '13px Helvetica',
                    width: 100,
                    height: 10,
                    x: 20,
                    y: 14
                }],
                axes      : [{
                    title     : 'ms',
                    type      : 'numeric',
                    position  : 'left',
                    minimum   : 0,
                    maximum   : 1000,
                    increment : 50,
                    fields    : 'ms'
                }, {
                    title     : 'run (ms/calls)',
                    type      : 'category',
                    position  : 'bottom',
                    fields    : 'run'
                }],
                series    : {
                    type   : 'bar',
                    title  : ['ms'],
                    xField : 'run',
                    yField : 'ms',
                    label: {
                        field: 'ms',
                        display: 'insideEnd',
                        renderer : function(text, sprite, config, rendererData, index) {
                            var store   = rendererData.store,
                                measure = store.getAt(index);

                            return [measure.get('ms'), '/', measure.get('times') ].join(' ');
                        }
                    }
                }
            });
        });

        me.fireEvent('sensors-updated', me, newSensors, oldSensors);
    },

    getStore : function(sensorName) {
        var me          = this,
            meClass     = Gnt.examples.performance.perfmon.view.Monitor,
            sensorChart = me.lookupReference(meClass.getSensorChartReference(sensorName));

        return sensorChart && sensorChart.getStore();
    },

    statics : {
        getSensorChartReference : function(sensorName) {
            return ['perfmon', sensorName, 'sensor', 'chart'].join('-');
        }
    }
});
