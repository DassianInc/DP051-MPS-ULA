StartTest(function (t) {

    var taskStore   = t.getTaskStore({
        assignmentStore : t.getAssignmentStore(),
        resourceStore   : t.getResourceStore(),
        dependencyStore : t.getDependencyStore()
    });

    var editor      = new Gnt.widget.TaskEditor({
        taskStore       : taskStore,
        assignmentStore : taskStore.getAssignmentStore(),
        resourceStore   : taskStore.getResourceStore(),
        margin          : 10,
        width           : 500,
        renderTo        : Ext.getBody()
    });

    var task    = taskStore.getById(117);

    editor.loadTask(task);
    editor.setActiveTab(editor.advancedForm);

    editor.advancedForm.getForm().findField(task.manuallyScheduledField).setValue(true);
    editor.updateTask();

    t.is(task.isManuallyScheduled(), true, 'Task is set to Manually Scheduled');

    editor.advancedForm.getForm().findField(task.manuallyScheduledField).setValue(false);
    editor.updateTask();

    t.is(task.isManuallyScheduled(), false, 'Manually Scheduled is set to false');
});
