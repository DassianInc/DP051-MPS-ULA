//Ext.Loader.setConfig({enabled: true, disableCaching : true });
//Ext.Loader.setPath('Sch', '../../../ExtScheduler3.x/js/Sch');
//Ext.Loader.setPath('Gnt', '../../js/Gnt');

Ext.require([
    'Gnt.panel.Gantt',
    'Gnt.column.PercentDone',
    'Gnt.column.StartDate',
    'Gnt.column.EndDate',
    'Sch.plugin.TreeCellEditing',
    'Sch.plugin.Pan'
]);

Ext.onReady(function () {
    Ext.QuickTips.init();

    var start = new Date(2010, 0, 1),
        end = Sch.util.Date.add(start, Sch.util.Date.MONTH, 10);

    var taskStore = Ext.create("Gnt.data.TaskStore", {
        proxy : {
            type   : 'ajax',
            method : 'GET',
            url    : 'tasks.js',
            reader : {
                type : 'json'
            }
        }
    });

    var dependencyStore = Ext.create("Gnt.data.DependencyStore", {
        autoLoad : true,
        proxy    : {
            type   : 'ajax',
            url    : 'dependencies.js',
            method : 'GET',
            reader : {
                type : 'json'
            }
        }
    });

    var g = Ext.create('Gnt.panel.Gantt', {
        height   : ExampleDefaults.height,
        width    : ExampleDefaults.width,
        renderTo : 'example-container',

        leftLabelField : 'Name',

        highlightWeekends        : false,
        showTodayLine            : true,
        enableBaseline           : true,
        baselineVisible          : true,
        enableDependencyDragDrop : false,

        loadMask : true,

        viewPreset : 'monthAndYear',

        startDate       : start,
        endDate         : end,

        // Setup your static columns
        columns         : [
            {
                xtype : 'namecolumn',
                width : 200
            },
            {
                xtype : 'baselinestartdatecolumn'
            },
            {
                xtype : 'baselineenddatecolumn'
            }
        ],
        taskStore       : taskStore,
        dependencyStore : dependencyStore,

        plugins : [
            {
                ptype : 'scheduler_pan'
            }
        ],

        tbar : [
            {
                text         : 'Show baseline task bars',
                enableToggle : true,
                pressed      : true,
                handler      : function () {
                    g.el.toggleCls('sch-ganttpanel-showbaseline');
                }
            },
            {
                text         : 'Set new baseline',
                handler      : function () {
                    taskStore.getRootNode().cascadeBy(function(node) {
                        node.beginEdit();
                        node.set('BaselineStartDate', node.getStartDate());
                        node.set('BaselineEndDate', node.getEndDate());
                        node.endEdit();
                    });
                }
            }
        ]
    });
});
