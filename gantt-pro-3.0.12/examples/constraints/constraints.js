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

    var start = new Date(2010, 0, 11),
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
        height          : ExampleDefaults.height,
        width           : ExampleDefaults.width,
        renderTo        : 'example-container',
        leftLabelField  : 'Name',
        loadMask        : true,
        viewPreset      : 'weekAndDayLetter',
        startDate       : start,
        endDate         : end,

        // Setup your static columns
        columns         : [
            {
                xtype : 'namecolumn',
                width : 200
            },
            {
                xtype : 'constrainttypecolumn'
            },
            {
                xtype : 'constraintdatecolumn'
            }
        ],
        taskStore       : taskStore,
        dependencyStore : dependencyStore
    });
});
