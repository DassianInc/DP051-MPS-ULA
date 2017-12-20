StartTest(function (t) {

    // Test for #1315 (Task editor raises exception for effort driven task)

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

    var task    = taskStore.getNodeById(117);

    editor.loadTask(task);
    editor.setActiveTab(editor.assignmentGrid);
    editor.assignmentGrid.store.remove(editor.assignmentGrid.store.getAt(0));

    t.livesOk(function () {
        editor.advancedForm.getForm().findField(task.schedulingModeField).setValue('EffortDriven');
    }, 'does not throw any exception');

});
