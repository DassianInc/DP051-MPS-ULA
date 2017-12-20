StartTest(function(t) {

    t.it('Should support locked grid being collapsed initially', function(t) {
        var g1 = t.getGantt({
            id     : 'grid1',
            height : 200,
            width  : 600,
            lockedGridConfig : {
                collapsible : true,
                collapsed : true
            },
            renderTo        : Ext.getBody()
        });

        t.chain(
            { waitFor : function() { return g1.lockedGrid.getCollapsed() === 'left'; } },

            function() {
                t.pass('Locked grid initially collapsed');
                t.isApprox(g1.normalGrid.getWidth(), 580, 'Scheduler grid initially expanded fully');
            }
        );
    })

    t.it('Should support normal grid being collapsed initially', function(t) {

        var g2 = t.getGantt({
            height : 200,
            width : 600,
            schedulerConfig : {
                collapsible : true,
                collapsed : true
            },
            renderTo        : Ext.getBody()
        });

        t.chain(
            { waitFor : function() { return g2.normalGrid.getCollapsed() === 'right'; } },

            function() {
                t.isApprox(g2.lockedGrid.getWidth(), 580, 'Locked grid initially expanded fully');
                t.ok(g2.normalGrid.getCollapsed(), 'Scheduler grid initially collapsed');
            }
        );
    });
});