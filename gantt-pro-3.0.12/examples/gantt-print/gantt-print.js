//Ext.Loader.setConfig({enabled: true, disableCaching : true });
//Ext.Loader.setPath('Sch', '../../../ExtScheduler3.x/js/Sch');
//Ext.Loader.setPath('Gnt', '../../js/Gnt');

Ext.require([
    'Gnt.panel.Gantt',
    'Gnt.column.PercentDone',
    'Gnt.column.StartDate',
    'Gnt.column.EndDate',
    'Gnt.plugin.Printable'
]);

Ext.onReady(function() {
    Ext.QuickTips.init();

    Ext.state.Manager.setProvider(Ext.create('Ext.state.CookieProvider'));

    var start   = new Date(2010, 0, 1),
        end     = Sch.util.Date.add(start, Sch.util.Date.MONTH, 20);

    var taskStore = Ext.create("Gnt.data.TaskStore", {
        model       : 'Gnt.model.Task',

        proxy       : {
            type        : 'ajax',
            method      : 'GET',
            url         : 'tasks.js',
            reader      : {
                type    : 'json'
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
        height            : ExampleDefaults.height,
        width             : ExampleDefaults.width,
        renderTo          : 'example-container',
        leftLabelField    : 'Name',
        highlightWeekends : false,
        loadMask          : true,
        viewPreset        : 'monthAndYear',
        startDate         : start,
        endDate           : end,

        // Setup your static columns
        columns           : [
            {
                xtype   : 'namecolumn',
                width   : 250
            }
        ],
        taskStore         : taskStore,
        dependencyStore   : dependencyStore,
        tbar : [
            'This example shows you how you can print the chart content produced by Ext Gantt.',
            '->',
            {
                iconCls : 'icon-print',
                scale   : 'large',
                text    : 'Print',
                handler : function() {
                    // Make sure this fits horizontally on one page.
                    g.zoomToFit();
                    g.print();
                }
            }
        ],
        plugins : new Gnt.plugin.Printable({
            exportDialogConfig    : {
                showDPIField      : true,
                showColumnPicker  : true,
                showResizePicker  : false,
                dateRangeRestriction : false,
                stateful          : true,
                stateId           : 'gntprint'
            }
        })
    });
});
