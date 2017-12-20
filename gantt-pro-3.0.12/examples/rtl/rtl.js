/* global App */
Ext.ns('App');

//Ext.Loader.setConfig({enabled: true, disableCaching : true });
//Ext.Loader.setPath('Sch', '../../../ExtScheduler3.x/js/Sch');
//Ext.Loader.setPath('Gnt', '../../js/Gnt');

Ext.require([
    'Gnt.panel.Gantt',
    'Gnt.column.PercentDone',
    'Gnt.column.StartDate',
    'Gnt.column.EndDate',
    'Sch.plugin.TreeCellEditing'
]);

Ext.onReady(function () {
    App.Gantt.init();
});

// To workaround http://www.sencha.com/forum/showthread.php?299143-RTL-flag-not-propagated-to-child-components&p=1092329#post1092329
Ext.define('Sch.examples.RtlComponent', {
    override : 'Ext.Component',
    rtl      : true
});

App.Gantt = {

    // Initialize application
    init : function (serverCfg) {
        Ext.QuickTips.init();

        var taskStore = Ext.create("Gnt.data.TaskStore", {
            proxy : {
                type   : 'ajax',
                method : 'GET',
                url    : 'tasks.xml',
                reader : {
                    type         : 'xml',
                    // records will have a 'Task' tag
                    record       : ">Task",
                    rootProperty : "Tasks"
                }
            }
        });

        var dependencyStore = Ext.create("Gnt.data.DependencyStore", {
            autoLoad : true,
            proxy    : {
                type   : 'ajax',
                url    : 'dependencies.xml',
                method : 'GET',
                reader : {
                    type         : 'xml',
                    rootProperty : 'Links',
                    record       : 'Link' // records will have a 'Link' tag
                }
            }
        });

        var cellEditing = Ext.create('Sch.plugin.TreeCellEditing', {
            clicksToEdit : 1
        });

        var g = Ext.create('Gnt.panel.Gantt', {
            height         : ExampleDefaults.height,
            width          : ExampleDefaults.width,
            renderTo       : 'example-container',
            leftLabelField : 'Name',
            rtl            : true,

            enableProgressBarResize  : true,
            enableDependencyDragDrop : true,
            cascadeChanges           : false,
            startDate                : new Date(2010, 0, 11),
            endDate                  : Sch.util.Date.add(new Date(2010, 0, 11), Sch.util.Date.WEEK, 10),
            viewPreset               : 'weekAndDayLetter',

            lockedGridConfig : {
                width : 200
            },

            eventRenderer : function (taskRecord) {
                return {
                    ctcls : taskRecord.get('Id') // Add a CSS class to the task element
                };
            },

            tooltipTpl : new Ext.XTemplate(
                '<table class="taskTip">',
                '<tr><td>Task </td><td>{Name}</td></tr>',
                '<tr><td>Start </td><td>{[values._record.getDisplayStartDate("y-m-d")]}</td></tr>',
                '<tr><td>Duration</td><td> {Duration}d</td></tr>',
                '<tr><td>Progress</td><td>{[Math.round(values.PercentDone)]}%</td></tr>',
                '</table>'
            ),


            // Setup your static columns
            columns    : [
                {
                    xtype : 'namecolumn',
                    width : 200
                },
                Ext.create('Gnt.column.StartDate'),
                Ext.create('Gnt.column.EndDate'),
                Ext.create('Gnt.column.PercentDone'),
                Ext.create('Gnt.column.AddNew')
            ],

            taskStore       : taskStore,
            dependencyStore : dependencyStore,
            plugins         : [cellEditing]
        });
    }
};
