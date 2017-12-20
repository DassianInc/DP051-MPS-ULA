StartTest(function(t) {

    var g = t.getGantt2({
        forceFit            : true,
        renderTo            : Ext.getBody()
    });
    
    Ext.each(['dependencyclick', 'dependencydblclick', 'dependencycontextmenu'], function(o) {
        t.firesAtLeastNTimes(g, o, 1);
    });
    
    t.waitForTasksAndDependenciesToRender(g, function() {
        g.getSchedulingView().el.select('.sch-event-wrap').remove();

        t.chain(
            { action : 'click', target : '.sch-dependency' },
            { waitFor : 100 },
            { action : 'rightClick', target : '.sch-dependency' },
            { waitFor : 100 },
            { action : 'doubleClick', target : '.sch-dependency' }
        )
    });
})    
