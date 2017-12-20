StartTest(function(t) {
    // Since we have a custom layout for the top containing 'treepanel', col resizing feature started breaking in 4.2.1

    var gantt       = t.getGantt({
        columns         : [
            { xtype : 'treecolumn', width : 100 },
            { width : 100 }
        ],
        lockedGridConfig         : {
            width    : 140
        },
        renderTo        : Ext.getBody()
    })
    
    t.chain(
        { waitFor : 'rowsVisible' },

        {
            drag    : [99, 20],
            by      : [20, 0]
        },

        function () {
            t.isApprox(t.cq1('treecolumn').getWidth(), 120, 2, 'Resizing column should work');
        }
    )
})

