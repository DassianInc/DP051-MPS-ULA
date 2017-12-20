StartTest(function(t) {
    
    var DATE        = Sch.util.Date
    
    var gantt = t.getGantt({
        renderTo                : Ext.getBody(),
        enableAnimations        : true,
        
        startDate               : new Date(2010, 1, 4),
        endDate                 : DATE.add(new Date(2010, 1, 4), DATE.WEEK, 10)
    });
    
    
    t.waitForEventsToRender(gantt, function () {
        var taskStore       = gantt.taskStore
        var task117         = taskStore.getNodeById('117')
        
        gantt.getSelectionModel().select(task117)
        
        // insert task above
        task117.parentNode.insertBefore({
            Id          : '1000',
            leaf        : true,
            StartDate   : new Date(2010, 1, 2),
            EndDate     : new Date(2010, 1, 4)
        }, task117)
        
        // see #123
        t.is(gantt.getSchedulingView().el.select('.' + Ext.grid.View.prototype.selectedItemCls).getCount(), 1, 'Should be only 1 row selected')
        t.is(gantt.lockedGrid.getView().el.select('.' + Ext.grid.View.prototype.selectedItemCls).getCount(), 1, 'Should be only 1 row selected')
    });
})    

