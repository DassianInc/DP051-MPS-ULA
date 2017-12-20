Ext.ns('App');

//Ext.Loader.setConfig({enabled: true, disableCaching : true });
//Ext.Loader.setPath('Sch', '../../../ExtScheduler3.x/js/Sch');
//Ext.Loader.setPath('Gnt', '../../js/Gnt');

Ext.require([
    'Gnt.panel.Gantt'
]);

Ext.onReady(function () {
    App.Gantt.init();
});

App.Gantt = {

    createGantt : function (labels) {
        var gantt = new Gnt.panel.Gantt({
            height   : ExampleDefaults.height,
            width    : ExampleDefaults.width,
            renderTo : 'example-container',

            topLabelField : labels.top ? {
                dataIndex : 'Name',
                editor    : { xtype : 'textfield' }
            } : null,

            bottomLabelField : labels.bottom ? {
                dataIndex : 'StartDate',
                renderer  : function (date) {
                    return Ext.Date.format(date, 'M d');
                }
            } : null,

            leftLabelField : labels.left ? {
                renderer : function (val, record) {
                    return 'Id: ' + record.getId();
                }
            } : null,

            rightLabelField : labels.right ? {
                renderer : function (val, record) {
                    return record.getDuration() + ' ' + record.getDurationUnit();
                }
            } : null,

            startDate  : new Date(2010, 0, 11),
            viewPreset : 'weekAndDayLetter',

            // Setup your static columns
            columns    : [
                {
                    xtype     : 'namecolumn',
                    width     : 200
                }
            ],

            taskStore : this.taskStore,

            dockedItems : {
                dock        : 'top',
                height      : 40,
                border      : false,
                padding     : '0 0 5px 0',
                buttonAlign : 'left',
                buttons     : [
                    {
                        text    : 'Top + Bottom',
                        handler : function () {
                            gantt.destroy();
                            App.Gantt.createGantt({ top : true, bottom : true});
                        }
                    },
                    {
                        text    : 'Left + Right',
                        handler : function () {
                            gantt.destroy();
                            App.Gantt.createGantt({ left : true, right : true});
                        }
                    },
                    {
                        text    : 'All',
                        handler : function () {
                            gantt.destroy();
                            App.Gantt.createGantt({ top : true, bottom : true, left : true, right : true});
                        }
                    }
                ]
            }
        });

        return gantt;
    },

    // Initialize application
    init        : function () {

        this.taskStore = Ext.create("Gnt.data.TaskStore", {
            model : 'Gnt.model.Task',
            proxy : {
                type   : 'ajax',
                method : 'GET',
                url    : 'tasks.xml',
                reader : {
                    type   : 'xml',
                    // records will have a 'Task' tag
                    record         : ">Task",
                    rootProperty   : "Tasks"
                }
            }
        });

        var g = this.createGantt({ top : true, bottom : true });
    }
};
