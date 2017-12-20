StartTest(function(t) {

    var g = t.getGantt2({
        dependencyStore     : null,
        height              : 150,
        renderTo            : Ext.getBody(),
        
        taskStore           : t.getTaskStore({
            proxy               : {
                type            : 'memory',
                data            : [
                    {
                        Name            : 'Task1',
                        leaf            : true
                    },
                    {
                        Name            : 'Task2',
                        leaf            : true
                    }
                ]
            }
        })
    });
    
    t.firesOk(g, {
        scheduleclick       : '>=1',
        scheduledblclick    : '>=1',
        schedulecontextmenu : '>=1'
    });
    
    t.chain(
        { waitFor   : 'RowsVisible', args : g.normalGrid },
        { action : 'click', target : '.sch-timetd' },
        { waitFor : 100 },
        { action : 'rightClick', target : '.sch-timetd' },
        { waitFor : 100 },
        { action : 'doubleClick', target : '.sch-timetd' }
    )
})    
