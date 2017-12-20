/* global App */
Ext.ns('App');

Ext.onReady(function() {
    // https://www.sencha.com/forum/showthread.php?308368-Exception-is-thrown-on-key-press-in-datepicker
    Ext.override(Ext.menu.Menu, {
        onShortcutKey : function () {
            // if there's no text items in menu do nothing
            if (this.query('>[text]').length === 0) {
                return;
            }

            this.callParent(arguments);
        }
    });

    App.Gantt.init();
});

App.Gantt = {

    // Initialize application
    init: function (serverCfg) {
        Ext.QuickTips.init();

        var startDate   = new Date(2010, 0, 11);
        var endDate     = Sch.util.Date.add(new Date(2010, 0, 11), Sch.util.Date.WEEK, 10);

        var taskStore = Ext.create("Gnt.data.TaskStore", {
            calendarManager : Ext.create("Gnt.data.CalendarManager", {
                calendarClass   : 'Gnt.data.calendar.BusinessTime'
            }),
            dependencyStore : Ext.create('Gnt.data.DependencyStore')
        });

        var crud = Ext.create('Gnt.data.CrudManager', {
            autoLoad  : true,
            taskStore : taskStore,
            transport   : {
                load    : {
                    method  : 'GET',
                    url     : 'data/data.json'
                }
            }
        });

        var gantt = Ext.create('Gnt.panel.Gantt', {
            height   : ExampleDefaults.height,
            width    : ExampleDefaults.width,
            renderTo : 'example-container',

            leftLabelField  : 'Name',
            loadMask                    : true,
            enableProgressBarResize     : true,
            enableDependencyDragDrop    : false,
            highlightWeekends           : true,

            viewPreset      : 'weekAndDayLetter',

            crudManager     : crud,

            startDate       : startDate,
            endDate         : endDate,

            tooltipTpl: new Ext.XTemplate(
                '<ul class="taskTip">',
                    '<li><strong>Task:</strong>{Name}</li>',
                    '<li><strong>Start:</strong>{[values._record.getDisplayStartDate("y-m-d")]}</li>',
                    '<li><strong>Duration:</strong> {[parseFloat(Ext.Number.toFixed(values.Duration, 1))]} {DurationUnit}</li>',
                    '<li><strong>Progress:</strong>{[Math.round(values.PercentDone)]}%</li>',
                '</ul>'
            ).compile(),

            columns : [{
                xtype       : 'namecolumn',
                width       : 180
            }, {
                xtype       : 'startdatecolumn',
                width       : 80
            }, {
                xtype       : 'enddatecolumn',
                width       : 80
            }, {
                xtype       : 'durationcolumn',
                width       : 70
            }, {
                header      : '% Done',
                sortable    : true,
                dataIndex   : 'PercentDone',
                width       : 50,
                align       : 'center'
            }],

            plugins : [
                Ext.create('Sch.plugin.TreeCellEditing', {
                    clicksToEdit : 1
                })
            ],

            tbar : [{
                text    : 'See calendar',
                iconCls : 'gnt-date',
                menu    : [{
                    xtype     : 'ganttcalendar',
                    calendar  : taskStore.getCalendar(),
                    startDate : startDate,
                    endDate   : endDate,
                    showToday : false
                }]
            }]
        });

        crud.on('load', function() {
            var calendarMenu = gantt.down('ganttcalendar');
            calendarMenu.setCalendar(crud.getCalendarManager().getNodeById('general').getCalendar());
            calendarMenu.injectDates();
        });
    }
};
