Ext.Loader.setPath('Gnt.examples.performance', 'app');

Ext.application({
    name: 'GanttPerformance',
    extend: 'Gnt.examples.performance.Application',
    autoCreateViewport: 'Gnt.examples.performance.view.Main'
});
