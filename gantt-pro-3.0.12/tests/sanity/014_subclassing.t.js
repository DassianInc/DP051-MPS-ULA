StartTest(function (t) {
    t.expectGlobals('App');

    Ext.define('App.gantt.GanttPanelBase', {
        extend : 'Gnt.panel.Gantt',

        initComponent : function() {
            this.callParent(arguments);
        }
    });

    Ext.define('App.gantt.ProjectGanttPanel', {
        extend : 'App.gantt.GanttPanelBase',

        initComponent : function() {
            this.callParent(arguments);
        }
    });

    Ext.define('App.gantt.ProjectTaskStore', {
        extend  : 'Gnt.data.TaskStore',
        proxy   : {
            type    : 'ajax',
            url     : 'foo.js',
            reader  : { type : 'json' }
        }
    });
    var taskStore = Ext.create('App.gantt.ProjectTaskStore');
    
    var panel = Ext.create('App.gantt.ProjectGanttPanel', {
        taskStore  : taskStore,
        columns    : [{
            xtype  : 'treecolumn',
            locked : true
        }]
    });

    t.pass('Created subclassed panel w/o exceptions');
})    
