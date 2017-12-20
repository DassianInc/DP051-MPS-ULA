Ext.define("MyApp.view.Viewport", {
    extend                  : 'Ext.Viewport',
    layout                  : 'border',
    requires                : [
        'MyApp.view.ResourceSchedule',
        'MyApp.view.Gantt',
        'MyApp.view.ResourceList',
        'MyApp.view.ResourceHistogram',
        'MyApp.model.Resource'
    ],

    initComponent : function() {

        this.taskStore  = new MyApp.store.TaskStore({
            calendarManager : new Gnt.data.CalendarManager({ calendarClass : 'Gnt.data.calendar.BusinessTime' })
        });

        var cm          = new Gnt.data.CrudManager({
            autoLoad    : true,
            taskStore   : this.taskStore,
            transport   : {
                load    : {
                    url     : 'data.js'
                },
                sync    : {
                    url     : 'TODO'
                }
            }
        });

        this.gantt          = new MyApp.view.Gantt({
            id              : 'ganttchart',
            crudManager     : cm,
            startDate       : new Date(2010, 0, 11)
        });

        Ext.apply(this, {
            items : [
                {
                    xtype : 'navigation',
                    id    : 'navigation'
                },
                {
                    xtype   : 'container',
                    itemId  : 'maincontainer',
                    region  : 'center',
                    layout  : { type : 'vbox', align : 'stretch' },
                    items   : this.gantt
                },
                {
                    xtype : 'settings'
                }
            ]
        });

        this.callParent(arguments);
    }
});