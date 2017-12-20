StartTest(function(t) {
    // https://www.assembla.com/spaces/bryntum/tickets/661

    var g = t.getGantt({
        renderTo        : Ext.getBody(),
        width           : 400,
        lockedGridConfig : { width : 200 }
    });

    t.waitForRowsVisible(g, function() {
        var view = g.getSchedulingView();
        var xy = view.body.getXY();
        xy[0] += 20;
        xy[1] += 20;

        t.waitFor(500, function() {

            view.el.dom.scrollLeft = 100;

            t.mouseDown(xy);

            t.is(g.normalGrid.getView().el.dom.scrollLeft, 100, 'Scroll intact after clicking schedule row');
        });
    });
});
