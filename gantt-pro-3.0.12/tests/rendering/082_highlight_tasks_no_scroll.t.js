StartTest(function(t) {
    
    //======================================================================================================================================================================================================================================================
    t.diag('Setup')
    
    var gantt = t.getGantt({
        multiSelect     : true,
        
        height          : 150,
        
        renderTo        : Ext.getBody(),
        
        startDate       : new Date(2010, 1, 1),
        endDate         : new Date(2010, 2, 1)
    });
    
    
    t.waitForTasksAndDependenciesToRender(gantt, function () {
        var ganttView   = gantt.getSchedulingView()
        
        ganttView.highlightTask(120, true);
        
        t.waitFor(500, function () {
            t.is(ganttView.el.dom.scrollTop, 0, "Scrolling position hasn't changed")
        })
    })
})    
