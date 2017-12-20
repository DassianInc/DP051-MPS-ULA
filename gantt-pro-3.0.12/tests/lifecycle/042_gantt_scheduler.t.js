StartTest(function(t) {
    
    t.diag('Setup')
    
    var gantt       = t.getGantt()
    var scheduler   = t.getScheduler()

    
    t.livesOk(function () {
        
        gantt.render(Ext.getBody())
        scheduler.render(Ext.getBody())
        
        t.ok(gantt.el, 'Gantt has been rendered')
        t.ok(scheduler.el, 'Gantt has been rendered')
        
    }, 'Gantt & Scheduler rendered ok')
    
    
    t.livesOk(function () {
        
        gantt.destroy()
        scheduler.destroy()
        
    }, 'Gantt & Scheduler destroyed ok')
    
})    
