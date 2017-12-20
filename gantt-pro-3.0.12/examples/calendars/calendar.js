/* global App */
Ext.ns('App');

//Ext.Loader.setConfig({enabled: true, disableCaching : false });
//Ext.Loader.setPath('Sch', '../../../ExtScheduler3.x/js/Sch');
//Ext.Loader.setPath('Gnt', '../../js/Gnt');

Ext.require([
    'Sch.plugin.TreeCellEditing',
    'Gnt.data.TaskStore',
    'Gnt.data.CalendarManager',
    'Gnt.data.CrudManager',
    'Gnt.column.StartDate',
    'Gnt.column.EndDate',
    'Gnt.column.ResourceAssignment',
    'Gnt.column.Duration',
    'Gnt.column.Calendar',
    'Gnt.field.Assignment',
    'Gnt.widget.calendar.Calendar',
    'Gnt.widget.calendar.ResourceCalendarGrid',
    'Gnt.data.calendar.BusinessTime',
    'Gnt.panel.Gantt'
]);

Ext.onReady(function() {
    App.Gantt.initStores();
    App.Gantt.init();
});

App.Gantt = {

    // Initialize stores
    initStores : function () {
        var AG = App.Gantt;

        var taskStore       = new Gnt.data.TaskStore({
            calendarManager : new Gnt.data.CalendarManager({
                // we will use BusinessTime calendars
                calendarClass   : 'Gnt.data.calendar.BusinessTime'
            }),
            sorters         : [{
                property    : 'leaf',
                direction   : 'ASC'
            }]
        });

        AG.crudManager  = new Gnt.data.CrudManager({
            autoLoad    : true,
            taskStore   : taskStore,
            transport   : {
                load    : {
                    url     : 'data/data.js'
                },
                sync    : {
                    url     : 'TODO'
                }
            }
        });

        AG.taskStore            = taskStore;
        AG.resourceStore        = taskStore.getResourceStore();
    },

    // Initialize application
    init : function () {
        var AG          = App.Gantt;

        var startDate   = new Date(2010, 0, 11);
        var endDate     = Sch.util.Date.add(new Date(2010, 0, 11), Sch.util.Date.WEEK, 10);

        var gantt       = new Gnt.panel.Gantt({
            height                      : ExampleDefaults.height,
            width                       : ExampleDefaults.width,
            renderTo                    : 'example-container',
            lockedGridConfig            : { width : 300 },
            leftLabelField              : 'Name',

            loadMask                    : true,
            enableProgressBarResize     : true,
            enableDependencyDragDrop    : false,
            highlightWeekends           : true,

            // uncomment to disable the skipping weekends/holidays functionality completely (empty calendar)
            // (for compatibility with 1.x)
            //weekendsAreWorkdays       : false,

            // uncomment to disable the skipping weekends/holidays functionality during d&d operations
            //skipWeekendsDuringDragDrop  : false,

            viewPreset                  : 'weekAndDayLetter',

            startDate                   : startDate,
            endDate                     : endDate,

            // Setup your static columns
            columns                     : [
                {
                    xtype       : 'calendarcolumn'
                },
                {
                    xtype       : 'namecolumn',
                    sortable    : true,
                    width       : 180
                },
                {
                    xtype       : 'startdatecolumn',
                    width       : 80
                },
                {
                    xtype       : 'enddatecolumn',
                    width       : 80
                },
                {
                    xtype       : 'durationcolumn',
                    width       : 70
                },
                {
                    xtype       : 'percentdonecolumn',
                    width       : 50
                },
                {
                    xtype       : 'resourceassignmentcolumn',
                    width       : 150
                }
            ],

            crudManager         : AG.crudManager,

            plugins             : [
                { ptype : 'scheduler_treecellediting', clicksToEdit : 1 },
                'gantt_taskeditor'
            ],

            tbar                : [
                {
                    iconCls     : 'gnt-date',
                    text        : 'Edit working time',
                    handler     : function () {
                        var task        = gantt.getSelectionModel().getLastSelected(),
                            calendar    = task && task.getCalendar() || AG.taskStore.getCalendar();

                        if (!gantt.editorWindow) {
                            gantt.editorWindow    = new Gnt.widget.calendar.CalendarWindow({
                                calendar    : calendar,
                                closeAction : 'hide'
                            });

                        } else {
                            gantt.editorWindow.setCalendar(calendar);
                        }

                        gantt.editorWindow.show();
                    }
                },
                {
                    iconCls     : 'gnt-date',
                    text        : 'Resource calendars',
                    handler     : function () {
                        if (!gantt.calendarWindow) {
                            gantt.calendarWindow    = new Ext.window.Window({
                                title       : 'Resource calendars',
                                modal       : true,
                                width       : 300,
                                layout      : 'fit',
                                closeAction : 'hide',

                                buttons     : [
                                    {
                                        text    : 'Close',
                                        handler : function () {
                                            gantt.calendarWindow.close();
                                        }
                                    }
                                ],

                                items       : new Gnt.widget.calendar.ResourceCalendarGrid({
                                    resourceStore   : AG.resourceStore
                                })
                            });
                        }

                        gantt.calendarWindow.show();
                    }
                }
            ]
        });
    }
};
