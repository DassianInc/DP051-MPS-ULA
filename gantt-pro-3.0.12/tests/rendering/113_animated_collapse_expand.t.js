StartTest(function(t) {
    
    var gantt = t.getGantt({
        renderTo                : Ext.getBody(),
        enableAnimations        : true
    });
    
    var collapseCallbackCalled  = false
    var expandCallbackCalled    = false
    
    
    t.waitForEventsToRender(gantt, function () {
        
        gantt.collapseAll(function () {
            
            // Ext calls the callbacks twice for some reason
            if (collapseCallbackCalled) return
            collapseCallbackCalled = true
            
            gantt.expandAll(function () {
                // Ext calls the callbacks twice for some reason
                if (expandCallbackCalled) return
                expandCallbackCalled = true
                
                t.pass("Reached the end state, should be no exceptions thrown")
            });
        });
    });
})    

