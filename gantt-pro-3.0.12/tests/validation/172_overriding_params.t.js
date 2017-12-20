StartTest(function(t) {
    t.diag('Setup');
    
    t.expectGlobal('Custom')
    
    Ext.define("Custom.control.Gantt", {
        extend                      : "Gnt.panel.Gantt",
        
        // the opposites of the default values
        cascadeChanges              : true,
        weekendsAreWorkdays         : true,
        recalculateParents          : false,
        skipWeekendsDuringDragDrop  : false
    });    

    
    var gantt       = t.getGantt(null, 'Custom.control.Gantt')
    
    var taskStore   = gantt.taskStore
    
    t.is(taskStore.cascadeChanges, true, '`cascadeChanges` from the prototype was applied to task store by gantt')
    t.is(taskStore.calendar.weekendsAreWorkdays, true, '`weekendsAreWorkdays` from the prototype was applied to calendar by gantt')
    t.is(taskStore.recalculateParents, false, '`recalculateParents` from the prototype was applied to task store by gantt')
    t.is(taskStore.skipWeekendsDuringDragDrop, false, '`skipWeekendsDuringDragDrop` from the prototype was applied to task store by gantt')
});   
