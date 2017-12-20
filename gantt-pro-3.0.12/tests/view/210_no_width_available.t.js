StartTest(function(t) {
    t.diag('If the locked grid columns consume all space, there will not be any space left for the schedule view');

    var g = t.getGantt({
        width           : 500,
        columns         : [{ xtype : 'treecolumn', width : 500 }],
        renderTo        : Ext.getBody()
    });

    t.waitForRowsVisible(g, function() {
        g.switchViewPreset('year');

        t.cq1('treecolumn').setWidth(200);
    });
})
