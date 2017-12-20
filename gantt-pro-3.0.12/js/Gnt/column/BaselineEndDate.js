/**

@class Gnt.column.BaselineEndDate

A Column displaying the baseline end date of a task.

    var gantt = Ext.create('Gnt.panel.Gantt', {
        height      : 600,
        width       : 1000,

        columns         : [
            ...
            {
                xtype       : 'baselineenddatecolumn',
                width       : 80
            }
            ...
        ],
        ...
    })

Note, that this class inherit from [Ext.grid.column.Date](http://docs.sencha.com/ext-js/4-2/#!/api/Ext.grid.column.Date) and supports its configuration options, notably the "format" option.
*/
Ext.define('Gnt.column.BaselineEndDate', {
    extend              : 'Gnt.column.EndDate',

    requires            : ['Gnt.field.BaselineEndDate'],

    alias               : [
        'widget.baselineenddatecolumn',
        'widget.ganttcolumn.baselineenddate'
    ],

    width               : 100,

    fieldProperty       : 'baselineEndDateField',

    fieldConfigs        : [ 'instantUpdate', 'adjustMilestones', 'keepDuration', 'validateStartDate', 'fieldProperty' ],

    editor              : 'baselineenddatefield',

    defaultEditor       : 'baselineenddatefield'
});
