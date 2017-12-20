/**
@class Gnt.widget.taskeditor.TaskForm
@extends Gnt.widget.taskeditor.BaseForm

{@img gantt/images/taskeditor-form.png}

This form is used to edit the task properties.
By default it supports editing of the following fields:

 - the name of the task (task title)
 - the start date of the task
 - the end date of the task
 - the task duration
 - the task effort
 - the current status of a task, expressed as the percentage completed
 - the baseline start date of the task (editing of this field is optional)
 - the baseline end date of the task (editing of this field is optional)
 - the baseline status of a task, expressed as the percentage completed (editing of this field is optional)
 - the calendar assigned to task
 - the scheduling mode for the task

* **Note:** However this standard set of fields can be easily overwritten (for more details check {@link #items}).

## Extending the default field set

The default field set can be overwritten using the {@link #items} config.
In case you want to keep the default fields and add some new custom fields, you can use the code below:

    // Extend the standard TaskForm class
    Ext.define('MyTaskForm', {
        extend : 'Gnt.widget.taskeditor.TaskForm',

        constructor : function(config) {
            this.callParent(arguments);

            // add some custom field
            this.add({
                fieldLabel  : 'Foo',
                name        : 'Name',
                width       : 200
            });
        }
    });

    // create customized form
    var form = new MyTaskForm({...});

*/
Ext.define('Gnt.widget.taskeditor.TaskForm', {
    // This form by default contains various "standard" fields of the task
    // and it "knows" about their "applyChanges" methods (for our fields),
    // and about renamed field names
    // This form can be also used with any other set of fields, provided
    // as the "items" config

    extend                  : 'Gnt.widget.taskeditor.BaseForm',

    alias                   : 'widget.taskform',

    requires                : [
        'Gnt.model.Task',
        'Ext.form.FieldSet',
        'Ext.form.FieldContainer',
        'Ext.form.field.Text',
        'Ext.form.field.Date',
        'Gnt.field.Percent',
        'Gnt.field.StartDate',
        'Gnt.field.EndDate',
        'Gnt.field.Duration',
        'Gnt.field.SchedulingMode',
        'Gnt.field.ManuallyScheduled',
        'Gnt.field.Effort',
        'Gnt.field.ConstraintType',
        'Gnt.field.BaselineStartDate',
        'Gnt.field.BaselineEndDate',
        'Gnt.field.ReadOnly'
    ],

    mixins                  : ['Gnt.mixin.Localizable'],

    alternateClassName      : ['Gnt.widget.TaskForm'],

    /**
     * @cfg {Object/Object[]} items A single item, or an array of child Components to be added to this container.
     *
     * For example:
     *
        var myForm  = new Gnt.widget.taskeditor.TaskForm({
            items       : [
                {
                    xtype       : 'calendarfield',
                    fieldLabel  : 'Calendar',
                    name        : 'CalendarId'
                },
                {
                    xtype       : 'displayfield',
                    fieldLabel  : "WBS",
                    name        : 'wbsCode'
                }
            ],
            task        : myTask,
            taskStore   : myTaskStore
        });


     *
     * **Note:** By default this form provide pre-configured set of fields. Using this option will overwrite that field set.
     */

    /**
     * @cfg {Boolean} [showGeneral=true] `true` to display general fields.
     */
    showGeneral             : true,
    /**
     * @cfg {Boolean} [showBaseline=true] `true` to display baseline fields.
     */
    showBaseline            : true,
    /**
     * @cfg {Boolean} [editBaseline=false] `true` to allow editing of baseline fields.
     */
    editBaseline            : false,
    /**
     * @cfg {Boolean} [showCalendar=false] `true` to show `Calendar` field.
     */
    showCalendar            : false,
    /**
     * @cfg {Boolean} [showManuallyScheduled=false] `true` to show `ManuallyScheduled` field.
     */
    showManuallyScheduled   : false,
    /**
     * @cfg {Boolean} [showSchedulingMode=false] `true` to show `Scheduling Mode` field.
     */
    showSchedulingMode      : false,
    /**
     * @cfg {Boolean} [showWbsCode=false] `true` to show `WBS code` field.
     */
    showWbsCode             : false,
    /**
     * @cfg {Boolean} [showRollup=false] `true` to show `Rollup` field.
     */
    showRollup              : false,
    /**
     * @cfg {Boolean} [showConstraint=false] `true` to show `Constraint Type`, `Constraint Date` fields.
     */
    showConstraint          : false,

    /**
     * @cfg {Boolean} [showReadOnly=false] `true` to show `ReadOnly field`.
     */
    showReadOnly            : false,

    /**
     * @cfg {Object} l10n
     *    A object, purposed for the class localization. Contains the following keys/values:
     *
     * @cfg {String} l10n.taskNameText            'Name'
     * @cfg {String} l10n.durationText            'Duration'
     * @cfg {String} l10n.datesText               'Dates'
     * @cfg {String} l10n.baselineText            'Baseline'
     * @cfg {String} l10n.startText               'Start'
     * @cfg {String} l10n.finishText              'Finish'
     * @cfg {String} l10n.percentDoneText         'Percent Complete'
     * @cfg {String} l10n.baselineStartText       'Start'
     * @cfg {String} l10n.baselineFinishText      'Finish'
     * @cfg {String} l10n.baselinePercentDoneText 'Percent Complete'
     * @cfg {String} l10n.effortText              'Effort'
     * @cfg {String} l10n.invalidEffortText       'Invalid effort value'
     * @cfg {String} l10n.calendarText            'Calendar'
     * @cfg {String} l10n.manuallyScheduled       'Manually Scheduled'
     * @cfg {String} l10n.schedulingModeText      'Scheduling Mode'
     * @cfg {String} l10n.wbsCodeText             'WBS code'
     * @cfg {String} l10n."Constraint Type"       'Constraint Type'
     * @cfg {String} l10n."Constraint Date"       'Constraint Date'
     * @cfg {String} l10n.readOnlyText            'ReadOnly'
     */

    /**
     * @cfg {Object} taskNameConfig A config object to be applied to the `Name` field.
     */
    taskNameConfig          : null,

    /**
     * @cfg {Object} durationConfig A config object to be applied to the `Duration` field.
     */
    durationConfig          : null,

    /**
     * @cfg {Object} startConfig A config object to be applied to the `Start` field.
     */
    startConfig             : null,

    /**
     * @cfg {Object} finishConfig A config object to be applied to the `Finish` field.
     */
    finishConfig            : null,

    /**
     * @cfg {Object} percentDoneConfig A config object to be applied to the `Percent Complete` field.
     */
    percentDoneConfig       : null,

    /**
     * @cfg {Object} baselineStartConfig A config object to be applied to the `Start` field of the `Baseline` fields container.
     */
    baselineStartConfig     : null,

    /**
     * @cfg {Object} baselineFinishConfig A config object to be applied to the `Finish` field of the `Baseline` fields container.
     */
    baselineFinishConfig    : null,

    /**
     * @cfg {Object} baselinePercentDoneConfig A config object to be applied to the `Percent Complete` field of the `Baseline` fields container.
     */
    baselinePercentDoneConfig   : null,

    /**
     * @cfg {Object} effortConfig A config object to be applied to the `Effort` field.
     */
    effortConfig            : null,

    /**
     * @cfg {Object} calendarConfig A config object to be applied to the `Calendar` field.
     */
    calendarConfig          : null,

    /**
     * @cfg {Object} manuallyScheduledConfig A config object to be applied to the `Manually Scheduled` field.
     */
    manuallyScheduledConfig    : null,

    /**
     * @cfg {Object} schedulingModeConfig A config object to be applied to the `Scheduling Mode` field.
     */
    schedulingModeConfig    : null,
    /**
     * @cfg {Object} wbsCodeConfig A config object to be applied to the `WBS code` field.
     */
    wbsCodeConfig           : null,
    /**
     * @cfg {Object} rollupConfig A config object to be applied to the `Rollup` field.
     */
    rollupConfig            : null,
    /**
     * @cfg {Object} constraintTypeConfig A config object to be applied to the `Constraint Type` field.
     */
    constraintTypeConfig : null,
    /**
     * @cfg {Object} constraintDateConfig A config object to be appied to the `Constraint Date` field.
     */
    constraintDateConfig : null,

    /*
     * @cfg {Object} readOnlyConfig A config object to be applied to the `ReadOnly` field.
     */
    readOnlyConfig          : null,

    constructor : function (config) {
        config = config || {};

        this.showBaseline = config.showBaseline;
        this.editBaseline = config.editBaseline;

        var model =  config.taskStore ? config.taskStore.model.prototype : Gnt.model.Task.prototype;

        // default field names
        this.fieldNames = {
            baselineEndDateField        : model.baselineEndDateField,
            baselinePercentDoneField    : model.baselinePercentDoneField,
            baselineStartDateField      : model.baselineStartDateField,
            calendarIdField             : model.calendarIdField,
            readOnlyField               : model.readOnlyField,
            clsField                    : model.clsField,
            draggableField              : model.draggableField,
            durationField               : model.durationField,
            durationUnitField           : model.durationUnitField,
            effortField                 : model.effortField,
            effortUnitField             : model.effortUnitField,
            endDateField                : model.endDateField,
            manuallyScheduledField      : model.manuallyScheduledField,
            nameField                   : model.nameField,
            percentDoneField            : model.percentDoneField,
            resizableField              : model.resizableField,
            rollupField                 : model.rollupField,
            schedulingModeField         : model.schedulingModeField,
            startDateField              : model.startDateField,
            noteField                   : model.noteField,
            constraintTypeField         : model.constraintTypeField,
            constraintDateField         : model.constraintDateField
        };

        this.callParent(arguments);

        this.addBodyCls('gnt-taskeditor-taskform');
    },

    // Builds default set of form fields.
    buildFields : function () {
        var me      = this,
            f       = me.fieldNames;

        me.items = me.items || [];

        if (me.showGeneral) {
            me.items.push({
                    xtype       : 'fieldcontainer',
                    layout      : 'hbox',
                    items       : [me.initFieldDefinition({
                        xtype       : 'textfield',
                        fieldLabel  : me.L('taskNameText'),
                        name        : f.nameField,
                        labelWidth  : 110,
                        allowBlank  : false,
                        flex        : 1,
                        value       : me.getTaskFieldValue(f.nameField)
                    }, me.nameConfig)]
                },
                {
                    xtype       : 'fieldcontainer',
                    layout      : 'hbox',
                    defaults    : {
                        labelWidth  : 110,
                        allowBlank  : false
                    },
                    items       : [
                        me.initFieldDefinition({
                            xtype       : 'percentfield',
                            fieldLabel  : me.L('percentDoneText'),
                            name        : f.percentDoneField,
                            margin      : '0 0 0 8',
                            //width       : 200,
                            flex        : 1,
                            value       : me.getTaskFieldValue(f.percentDoneField)
                        }, me.percentDoneConfig),

                        me.initFieldDefinition({
                            xtype       : 'durationfield',
                            fieldLabel  : me.L('durationText'),
                            name        : f.durationField,
                            //width       : 200,
                            flex        : 1,
                            value       : me.getTaskFieldValue(f.durationField)
                        }, me.durationConfig)
                    ]
                },
                {
                    xtype               : 'fieldset',
                    title               : me.L('datesText'),
                    layout              : 'hbox',
                    defaults            : {
                        labelWidth  : 110,
                        allowBlank  : false
                    },
                    items               : [
                        me.initFieldDefinition({
                            xtype       : 'startdatefield',
                            fieldLabel  : me.L('startText'),
                            flex        : 1,
                            name        : f.startDateField,
                            value       : me.getTaskFieldValue(f.startDateField)
                        }, me.startConfig),

                        me.initFieldDefinition({
                            xtype       : 'enddatefield',
                            fieldLabel  : me.L('finishText'),
                            flex        : 1,
                            name        : f.endDateField,
                            value       : me.getTaskFieldValue(f.endDateField)
                        }, me.finishConfig)
                    ]
                },
                me.initFieldDefinition({
                    xtype       : 'effortfield',
                    fieldLabel  : me.L('effortText'),
                    name        : f.effortField,
                    invalidText : me.L('invalidEffortText'),
                    width       : 200,
                    allowBlank  : true,
                    value       : me.getTaskFieldValue(f.effortField)
                }, me.effortConfig));
        }

        if (me.showBaseline) {

            me.items.push({
                xtype               : 'fieldset',
                title               : me.L('baselineText'),
                layout              : 'hbox',
                defaults            : {
                    labelWidth  : 110,
                    width       : 260,
                    cls         : 'gnt-baselinefield'
                },
                items               : [
                    me.initFieldDefinition({
                        xtype           : 'baselinestartdatefield',
                        fieldLabel      : me.L('baselineStartText'),
                        name            : f.baselineStartDateField,
                        value           : me.getTaskFieldValue(f.baselineStartDateField),
                        readOnly        : !me.editBaseline,
                        // disable TaskField logic that updates readOnly state
                        forceReadOnly   : !this.editBaseline
                    }, me.baselineStartConfig),

                    me.initFieldDefinition({
                        xtype           : 'baselineenddatefield',
                        fieldLabel      : me.L('baselineFinishText'),
                        name            : f.baselineEndDateField,
                        flex            : 1,
                        value           : me.getTaskFieldValue(f.baselineEndDateField),
                        readOnly        : !me.editBaseline,
                        forceReadOnly   : !this.editBaseline
                    }, me.baselineFinishConfig)
                ]
            },
            me.initFieldDefinition({
                xtype       : 'percentfield',
                fieldLabel  : me.L('baselinePercentDoneText'),
                name        : f.baselinePercentDoneField,
                labelWidth  : 110,
                width       : 200,
                cls         : 'gnt-baselinefield',
                value       : me.getTaskFieldValue(f.baselinePercentDoneField),
                readOnly    : !me.editBaseline
            }, me.baselinePercentDoneConfig));
        }

        if (me.showCalendar) {
            me.items.push(me.initFieldDefinition({
                xtype       : 'calendarfield',
                fieldLabel  : this.L('calendarText'),
                width       : 260,
                name        : f.calendarIdField,
                value       : me.getTaskFieldValue(f.calendarIdField)
            }, me.calendarConfig));
        }

        if (me.showManuallyScheduled) {
            me.items.push(me.initFieldDefinition({
                xtype       : 'manuallyscheduledfield',
                fieldLabel  : me.L('manuallyScheduledText'),
                name        : f.manuallyScheduledField,
                value       : me.getTaskFieldValue(f.manuallyScheduledField)
            }, me.manuallyScheduledConfig));
        }

        if (me.showSchedulingMode) {
            me.items.push(me.initFieldDefinition({
                xtype       : 'schedulingmodefield',
                fieldLabel  : me.L('schedulingModeText'),
                width       : 260,
                name        : f.schedulingModeField,
                value       : me.getTaskFieldValue(f.schedulingModeField),
                allowBlank  : false
            }, me.schedulingModeConfig));
        }

        if (me.showWbsCode) {
            me.items.push(me.initFieldDefinition({
                xtype       : 'textfield',
                fieldLabel  : me.L('wbsCodeText'),
                name        : 'wbsCode',
                width       : 260,
                readOnly    : true,
                value       : me.task && me.task.getWBSCode()
            }, me.wbsCodeConfig));
        }

        if (me.showRollup) {
            this.items.push(me.initFieldDefinition({
                xtype       : 'checkboxfield',
                fieldLabel  : this.L('rollupText'),
                name        : f.rollupField,
                value       : me.getTaskFieldValue(f.rollupField)
            }, me.rollupConfig));
        }

        if (me.showReadOnly) {
            this.items.push(me.initFieldDefinition({
                xtype       : 'readonlyfield',
                fieldLabel  : me.L('readOnlyText'),
                name        : f.readOnlyField,
                labelWidth  : 110,
                flex        : 1,
                value       : me.getTaskFieldValue(f.readOnlyField)
            }, me.readOnlyConfig));
        }

        if (me.showConstraint) {
            me.items.push(

                me.initFieldDefinition({
                    xtype      : 'constrainttypefield',
                    fieldLabel : me.L("Constraint Type"),
                    name       : f.constraintTypeField,
                    width      : 260,
                    value      : me.getTaskFieldValue(f.constraintTypeField)
                }, me.constraintTypeConfig),

                me.initFieldDefinition({
                    xtype      : 'constraintdatefield',
                    fieldLabel : me.L("Constraint Date"),
                    name       : f.constraintDateField,
                    width      : 260,
                    value      : me.getTaskFieldValue(f.constraintDateField)
                }, me.constraintDateConfig)
            );
        }

    },


    updateRecordWithFieldValue : function (task, field) {
        var me = this;

        // Constraint related fields require different approach
        if (field.name != me.fieldNames.constraintTypeField && field.name != me.fieldNames.constraintDateField) {
            return this.callParent(arguments);
        }
    },


    updateRecordFn : function (task) {
        var me                  = this,
            fieldNames          = me.fieldNames,
            form                = me.getForm(),
            constraintTypeField = form.findField(fieldNames.constraintTypeField),
            constraintDateField = form.findField(fieldNames.constraintDateField);

        task.beginEdit();

        this.callParent(arguments);

        // apply constraints if corresponding fields was shown
        // and task has constraint mixin mixed
        if (constraintTypeField && constraintDateField && task.setConstraint) {
            task.setConstraint(
                constraintTypeField.getValue(),
                constraintDateField.getValue()
            );
        }

        task.endEdit();
    },


    buildTaskBuffer : function (task) {
        this.callParent(arguments);

        // "isEditable" result depends on the task parent nodes readonly state
        // so if some of the task parents is readonly
        // we simply return true
        if (!task.getReadOnly() && task.isReadOnly()) {
            this.taskBuffer.isReadOnly = function () { return true; };
        }

    }
});
