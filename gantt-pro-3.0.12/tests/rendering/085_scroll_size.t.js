StartTest(function(t) {
    
    var gantt = t.getGantt2({
        height      : 100,
        renderTo    : Ext.getBody()
    });

    t.waitForEventsToRender(gantt, function () {
        var viewEl = gantt.getSchedulingView().el;
        var headerEl = gantt.normalGrid.headerCt.el;

        viewEl.scrollTo('left', viewEl.dom.clientWidth, true); // Without true, IE doesn't sync header correctly

        t.waitFor(1000, function(){
            t.isApprox(headerEl.dom.scrollLeft, viewEl.dom.scrollLeft, 1, 'Should find header/body in sync after scrolling max to the right')
        })
    })
})
