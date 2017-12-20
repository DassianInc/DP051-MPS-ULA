StartTest(function(t) {
    // Since we have a custom layout for the top containing 'treepanel', col resizing feature started breaking in 4.2.1

    var gantt       = t.getGantt({
        width       : 400,
        lockedGridConfig         : {
            collapsible : true,
            width    : 100,
            split : false
        },
        normalGridConfig : { collapsible : true },
        renderTo        : Ext.getBody()
    })

    t.it('Should have correct initial widths', function(t) {
        t.chain(
            { waitFor : 'rowsVisible' },

            function () {
                t.isApprox(gantt.lockedGrid.getWidth(), 100, 2, 'Locked');
                t.isApprox(gantt.normalGrid.getWidth(), 300, 2, 'Normal');
            }
        )
    })

    t.it('Collapse Locked => Locked collapsed, normal expanded', function(t) {
        t.chain(
            function (next) {
                gantt.lockedGrid.collapse();
                next();
            },

            function () {
                // remove width of placeholder with title, borders etc
                t.isApprox(gantt.normalGrid.getWidth(), 400, 30, 'Normal');
            }
        )
    })

    t.it('Collapse Normal => Locked expanded, normal collapsed', function(t) {
        t.chain(
            function (next) {
                gantt.normalGrid.collapse();
                next();
            },

            function () {
                // remove width of placeholder with title, borders etc
                t.isApprox(gantt.lockedGrid.getWidth(), 400, 30, 'Normal');
            }
        )
    })

    t.it('Collapse Locked=> Locked collapse, normal expanded', function(t) {
        t.chain(
            function (next) {
                gantt.lockedGrid.collapse();
                next();
            },

            function () {
                // remove width of placeholder with title, borders etc
                t.isApprox(gantt.normalGrid.getWidth(), 400, 30, 'Normal');
            }
        )
    })

    t.it('Collapse Scheduler => Locked expanded, normal collapsed', function(t) {
        t.chain(
            function (next) {
                gantt.normalGrid.collapse();
                next();
            },

            function () {
                // remove width of placeholder with title, borders etc
                t.isApprox(gantt.lockedGrid.getWidth(), 400, 30, 'Normal');
            }
        )
    })

    t.it('Expand Scheduler => Both expand, should have original widths', function(t) {
        t.chain(
            function (next) {
                gantt.normalGrid.expand();
                next();
            },

            function () {
                t.isApprox(gantt.lockedGrid.getWidth(), 100, 2, 'Locked');
                t.isApprox(gantt.normalGrid.getWidth(), 300, 2, 'Normal');
            }
        )
    })


})

