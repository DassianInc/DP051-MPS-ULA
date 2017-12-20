StartTest(function(t) {

    // #1131. here we check if start date field respect `editable` setting

    t.expectGlobals('NotEditableTask', 'EditableTask');

    Ext.define('NotEditableTask', {
        extend  : 'Gnt.model.Task',
        isEditable  : function () { return false; }
    });

    Ext.define('EditableTask', {
        extend  : 'Gnt.model.Task'
    });

    var notEditableTask = new NotEditableTask({ StartDate : new Date() });
    var editableTask    = new EditableTask({ StartDate : new Date() });

    var taskStore       = t.getTaskStore({
        DATA : [ notEditableTask, editableTask ]
    });

    var startDateField      = new Gnt.field.StartDate({
        task                : notEditableTask,
        taskStore           : taskStore,
        editable            : false,
        renderTo            : Ext.getBody()
    });

    var pickerTrigger   = startDateField.el.down('.x-form-date-trigger');

    t.ok(startDateField.inputEl.dom.readOnly, 'Field is readOnly');
    t.notOk(t.isElementVisible(pickerTrigger), 'Trigger button is hidden');

    startDateField.setTask(editableTask);

    t.ok(startDateField.inputEl.dom.readOnly, 'Field is readOnly');
    t.ok(t.isElementVisible(pickerTrigger), 'Trigger button is visible');

    startDateField.setEditable(true);

    startDateField.setTask(notEditableTask);

    t.ok(startDateField.inputEl.dom.readOnly, 'Field is readOnly');
    t.notOk(t.isElementVisible(pickerTrigger), 'Trigger button is hidden');

    startDateField.setTask(editableTask);

    t.notOk(startDateField.inputEl.dom.readOnly, 'Field is NOT readOnly');
    t.ok(t.isElementVisible(pickerTrigger), 'Trigger button is visible');
});
