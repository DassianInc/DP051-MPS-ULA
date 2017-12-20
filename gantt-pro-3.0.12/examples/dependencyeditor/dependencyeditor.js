Ext.ns('App');

//Ext.Loader.setConfig({enabled : true, disableCaching : true });
//Ext.Loader.setPath('Sch', '../../../ExtScheduler3.x/js/Sch');
//Ext.Loader.setPath('Gnt', '../../js/Gnt');

Ext.require([
    'Gnt.panel.Gantt',
    'Gnt.column.PercentDone',
    'Gnt.column.StartDate',
    'Gnt.column.EndDate',
    'Sch.plugin.Pan',
    'Gnt.plugin.DependencyEditor'
]);

Ext.onReady(function () {
    App.Gantt.init();
});

App.Gantt = {

    // Initialize application
    init : function (serverCfg) {
        Ext.QuickTips.init();

        var taskStore = Ext.create("Gnt.data.TaskStore", {
            model   : 'Gnt.model.Task',
            proxy   : {
                type   : 'ajax',
                method : 'GET',
                url    : 'tasks.xml',
                reader : {
                    type         : 'xml',
                    // records will have a 'Task' tag
                    record       : ">Task",
                    rootProperty : "Tasks",
                    idProperty   : "Id"
                }
            },
            sorters : [
                {
                    property  : 'leaf',
                    direction : 'ASC'
                }
            ]
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

        var g = Ext.create('Gnt.panel.Gantt', {
            height                   : ExampleDefaults.height,
            width                    : ExampleDefaults.width,
            renderTo                 : 'example-container',
            leftLabelField           : 'Name',
            highlightWeekends        : true,
            //showTodayLine: true,
            loadMask                 : true,
            enableDependencyDragDrop : true,
            //snapToIncrement : true,
            cascadeChanges           : true,
            startDate                : new Date(2010, 0, 4),
            endDate                  : Sch.util.Date.add(new Date(2010, 0, 4), Sch.util.Date.WEEK, 20),
            viewPreset               : 'weekAndDayLetter',

            // Setup your static columns
            columns                  : [
                {
                    xtype    : 'namecolumn',
                    sortable : true,
                    width    : 200
                },
                {
                    xtype : 'startdatecolumn'
                }
            ],

            taskStore       : taskStore,
            dependencyStore : dependencyStore,
            plugins         : [
                this.depEditor = new Gnt.plugin.DependencyEditor({
                    showLag   : true,
                    constrain : true,
                    //triggerEvent : 'dependencyclick',
                    bodyPadding : '0 5',

                    buttons   : [
                        {
                            text    : 'Ok',
                            scope   : this,
                            handler : function () {
                                var formPanel = this.depEditor;
                                formPanel.getForm().updateRecord(formPanel.dependencyRecord);
                                this.depEditor.collapse();
                            }
                        },
                        {
                            text    : 'Cancel',
                            scope   : this,
                            handler : function () {
                                this.depEditor.collapse();
                            }
                        },
                        {
                            text    : 'Delete',
                            scope   : this,
                            handler : function () {
                                var formPanel = this.depEditor,
                                    record = this.depEditor.dependencyRecord;
                                dependencyStore.remove(record);
                                formPanel.collapse();
                            }
                        }
                    ]
                })
            ]
        });

        // Scroll task bar into view when clicking the row
        g.lockedGrid.view.on('itemclick', function (view, task) {
            g.getSchedulingView().scrollEventIntoView(task, false, true);
        })
    }
};
