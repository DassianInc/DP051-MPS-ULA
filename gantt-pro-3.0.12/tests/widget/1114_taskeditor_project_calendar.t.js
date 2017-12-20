StartTest(function (t) {

    // Check that cloned task store binds calendar in sync with "master" task store #1575

    var calendar1       = new Gnt.data.calendar.BusinessTime({ calendarId : 'calendar1' }),
        calendar2       = new Gnt.data.calendar.BusinessTime({ calendarId : 'calendar2' });

    var taskStore       = t.getTaskStore({
        calendar        : calendar1,
        assignmentStore : t.getAssignmentStore(),
        resourceStore   : t.getResourceStore(),
        dependencyStore : t.getDependencyStore()
    });

    var taskEditor      = new Gnt.widget.TaskEditor({
        taskStore       : taskStore,
        assignmentStore : taskStore.getAssignmentStore(),
        resourceStore   : taskStore.getResourceStore(),
        margin          : 10,
        width           : 500,
        renderTo        : Ext.getBody()
    });

    t.it('Task store copy binds proper calendar after changing it on the original store', function (t) {
        t.is(taskEditor.clonedStores.taskStore.getCalendar(), calendar1, 'proper initial project calendar');
        taskStore.setCalendar(calendar2);
        t.is(taskEditor.clonedStores.taskStore.getCalendar(), calendar2, 'proper project calendar found after original task store change');
    });

});
