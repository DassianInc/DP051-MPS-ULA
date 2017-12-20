Ext.ns('App');

//Ext.Loader.setConfig({enabled: true, disableCaching : true });
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

Ext.application({
    name : 'Styles',

    launch : function () {


        var cm = new Gnt.data.CrudManager({
            autoLoad  : true,
            taskStore : new Gnt.data.TaskStore(),
            transport : {
                load : {
                    method : 'GET',
                    url    : 'tasks.js'
                }
            }
        });

        var viewport = new Ext.Viewport({
            layout : 'border',
            items  : [
                {
                    xtype       : 'container',
                    region      : 'north',
                    height      : 60,
                    defaultType : 'button',
                    defaults    : {
                        scale   : 'large',
                        width   : 170,
                        margin  : 10
                    },
                    items       : [
                        {
                            text    : 'Basic theme',
                            pressed : location.hash.match('classic'),
                            handler : function () {
                                window.location.href = 'styles.html#classic';
                                window.location.reload();
                            }
                        },
                        {
                            text    : 'Crisp theme',
                            pressed : location.hash.match('crisp'),
                            handler : function () {
                                window.location.href = 'styles.html#crisp';
                                window.location.reload();
                            }
                        },
                        {
                            text    : 'Neptune theme',
                            pressed : location.hash.match('neptune'),
                            handler : function () {
                                window.location.href = 'styles.html#neptune';
                                window.location.reload();
                            }
                        }
                    ]
                },
                {
                    xtype                   : 'ganttpanel',
                    region                  : 'center',
                    rowHeight               : 30,
                    leftLabelField          : 'Name',
                    highlightWeekends       : true,
                    showTodayLine           : true,
                    loadMask                : true,
                    eventBorderWidth        : location.hash.match('crisp') ? 0 : 1,
                    startDate               : new Date(2010, 0, 11),
                    endDate                 : Sch.util.Date.add(new Date(2010, 0, 4), Sch.util.Date.WEEK, 20),
                    viewPreset              : 'weekAndDayLetter',
                    crudManager             : cm,
                    enableProgressBarResize : true,
                    columns                 : [
                        {
                            xtype : 'namecolumn',
                            width : 250
                        }
                    ]
                }
            ]
        });
    }
})
;
