Ext.define("Gnt.examples.advanced.view.MainViewport", {
    extend      : 'Ext.Viewport',
    alias       : 'widget.advanced-viewport',

    requires    : [
        'Gnt.examples.advanced.view.MainViewportController',
        'Gnt.examples.advanced.view.MainViewportModel',
        'Gnt.examples.advanced.view.GanttPrimaryToolbar',
        'Gnt.examples.advanced.view.GanttSecondaryToolbar',
        'Gnt.examples.advanced.view.Timeline',
        'Gnt.examples.advanced.view.Gantt'
    ],

    viewModel   : 'advanced-viewport',
    controller  : 'advanced-viewport',

    layout      : 'border',

    items       : [
        {
            xtype   : 'gantt-primary-toolbar',
            region  : 'north'
        },
        {
            xtype   : 'gantt-secondary-toolbar',
            region  : 'north'
        }
    ],

    initComponent : function () {
        this.items.push(
            {
                xtype       : 'timeline',
                region      : 'north',
                border      : false,
                taskStore   : this.crudManager.getTaskStore(),
                split       : true
            },
            {
                xtype       : 'advanced-gantt',
                region      : 'center',
                reference   : 'gantt',
                crudManager : this.crudManager,
                startDate   : this.startDate,
                endDate     : this.endDate
            }
        );

        this.callParent(arguments);

        // track CRUD manager changes
         this.mon(this.crudManager, {
             haschanges : function () {
                 this.getViewModel().set('hasChanges', true);
             },
             nochanges : function () {
                 this.getViewModel().set('hasChanges', false);
             },
             scope : this
         });
    }
});
