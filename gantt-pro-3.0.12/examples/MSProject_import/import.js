Ext.require([
    'Ext.form.Panel',
    'Ext.form.TextField',
    'Ext.form.File',
    'Gnt.model.Task',
    'Gnt.data.TaskStore',
    'Gnt.column.Name',
    'Gnt.panel.Gantt'
]);

Ext.define('MsProjectTask', {
    extend              : 'Gnt.model.Task',
    inclusiveEndDate    : true,
    fields              : [
        { name : 'Milestone', type : 'boolean', defaultValue : 'false' }
    ],

    isMilestone : function () {
        return this.get('Milestone');
    }
});

Ext.define('Gnt.ux.MSProjectImportPanel', {
    alias           : 'widget.msimportpanel',
    extend          : 'Ext.form.Panel',
    width           : 300,
    frame           : true,
    title           : 'Load data from MS Project',
    bodyPadding     : '10 10 0',

    defaults        : {
        anchor      : '100%',
        allowBlank  : false,
        msgTarget   : 'side',
        labelWidth  : 50
    },

    initComponent : function () {

        Ext.apply(this, {
            items   : [
                {
                    xtype        : 'filefield',
                    id           : 'form-file',
                    emptyText    : 'Upload .mpp file',
                    fieldLabel   : 'File',
                    name         : 'mpp-file',
                    buttonText   : '',
                    buttonConfig : {
                        iconCls : 'upload-icon'
                    }
                }
            ],
            buttons : [
                {
                    text    : 'Load',
                    handler : function () {
                        var panel   = this.up('form'),
                            form    = panel.getForm();

                        if (form.isValid()) {
                            form.submit({
                                url     : 'msp-load.php',
                                waitMsg : 'Loading data...',

                                failure : function (form, action) {
                                    Ext.Msg.alert('Import failed', 'Please make sure the input data is valid. Error message: ' + action.result.msg);
                                },
                                success : function (form, action) {
                                    panel.fireEvent('dataavailable', panel, action.result.data);
                                }
                            });
                        }
                    }
                },
                {
                    text    : 'Reset',
                    handler : function () {
                        this.up('form').getForm().reset();
                    }
                }
            ]
        });

        this.callParent(arguments);
    }
});


Ext.onReady(function () {

    var taskStore       = new Gnt.data.TaskStore({
        model           : 'MsProjectTask',
        root            : {
            children : [
                { Name : 'Hello World', StartDate : new Date(2012, 4, 1), EndDate : new Date(2012, 4, 3), leaf : true }
            ]
        }
    });

    var importer        = new Gnt.data.ux.Importer();

    var g               = new Gnt.panel.Gantt({
        height              : ExampleDefaults.height,
        width               : ExampleDefaults.width,
        renderTo            : 'example-container',
        taskStore           : taskStore,
        stripeRows          : true,
        lockedGridConfig    : {
            width : 300
        },

        leftLabelField      : {
            dataIndex : 'Name',
            editor    : { xtype : 'textfield' }
        },
        highlightWeekends   : true,
        showTodayLine       : true,
        loadMask            : true,
        startDate           : new Date(2012, 4, 1),
        endDate             : Sch.util.Date.add(new Date(2012, 4, 1), Sch.util.Date.WEEK, 20),
        viewPreset          : 'weekAndDayLetter',

        //static column that will be removed when columns from mpp file are loaded
        columns             : [
            {
                xtype : 'namecolumn',
                width : 200
            }
        ],
        plugins             : importer,
        tbar                : [
            {
                xtype       : 'msimportpanel',
                listeners   : {
                    dataavailable : function (form, data) {
                        Ext.Msg.alert('Success', 'Data from .mpp file loaded');

                        importer.importData(data);

                        g.lockedGrid.reconfigure(g.lockedGrid.getStore(), data.columns);

                        g.expandAll();

                        var span = g.taskStore.getTotalTimeSpan();
                        if (span.start && span.end) {
                            g.setTimeSpan(span.start, span.end);
                        }
                    }
                }
            }
        ]
    });
});
