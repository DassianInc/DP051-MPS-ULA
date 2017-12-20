StartTest(function(t) {
    
    var g = t.getGantt({
        renderTo    : Ext.getBody(),
        taskStore   : new Gnt.data.TaskStore({
            root : {
                children : [
                    { leaf : true, PercentDone : 0 },
                    { leaf : true, PercentDone : 100 },
                    { leaf : true, PercentDone : 110 },
                    { leaf : true }
                ]
            }
        }),
        columns : [
            {
                xtype : 'treecolumn'
            },
            {
                xtype : 'percentdonecolumn'
            }
        ]
    });

    t.chain(
        { waitFor : 'rowsVisible', args : g},

        function (next){
            var locked = g.lockedGrid;

            t.matchGridCellContent(locked, 0, 1, '0', '0');
            t.matchGridCellContent(locked, 1, 1, '100', '100');
            t.matchGridCellContent(locked, 2, 1, '110', '110');
            t.matchGridCellContent(locked, 3, 1, '0', 'Default zero');
        }
    )
});
