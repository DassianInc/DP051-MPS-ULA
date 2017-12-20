StartTest(function (t) {

    var g = t.getGantt({
        renderTo  : Ext.getBody(),
        taskStore : new Gnt.data.TaskStore({
            root : {
                expanded : true,
                children : [
                    { },    // 1
                    { },    // 2
                    {
                        // 3
                        expanded : true,
                        children : [
                            {
                                // 3.1
                                expanded : true,
                                children : [
                                    {
                                        // 3.1.1
                                    }
                                ]
                            }
                        ]
                    },

                    {       // 4
                        expanded : true,
                        children : [
                            {
                                // 4.1
                            }
                        ]
                    }
                ]
            }
        }),
        columns   : [
            {
                xtype     : 'namecolumn',
                dataIndex : 'Id'
            },
            {
                xtype : 'wbscolumn'
            }
        ]
    });

    t.chain(
        { waitFor : 'rowsVisible', args : g},

        function (next) {
            var locked = g.lockedGrid;
            var root = g.taskStore.getRootNode();

            t.it('Should render correct WBS code', function (t) {
                t.matchGridCellContent(locked, 0, 1, '1', '1');
                t.matchGridCellContent(locked, 1, 1, '2', '2');
                t.matchGridCellContent(locked, 2, 1, '3', '3');
                t.matchGridCellContent(locked, 3, 1, '3.1', '3.1');
                t.matchGridCellContent(locked, 4, 1, '3.1.1', '3.1.1');
                t.matchGridCellContent(locked, 5, 1, '4', '4');
                t.matchGridCellContent(locked, 6, 1, '4.1', '4.1');
            })

            t.it('Should render correct WBS code after remove', function (t) {
                root.childNodes[1].remove();
                t.matchGridCellContent(locked, 0, 1, '1', '1');
                t.matchGridCellContent(locked, 1, 1, '2', '2');
                t.matchGridCellContent(locked, 2, 1, '2.1', '2.1');
                t.matchGridCellContent(locked, 3, 1, '2.1.1', '2.1.1');
                t.matchGridCellContent(locked, 4, 1, '3', '3');
                t.matchGridCellContent(locked, 5, 1, '3.1', '3.1');
            })

            t.it('Should render correct WBS code after add', function (t) {
                root.insertChild(1, {});
                // same as original
                t.matchGridCellContent(locked, 0, 1, '1', '1');
                t.matchGridCellContent(locked, 1, 1, '2', '2');
                t.matchGridCellContent(locked, 2, 1, '3', '3');
                t.matchGridCellContent(locked, 3, 1, '3.1', '3.1');
                t.matchGridCellContent(locked, 4, 1, '3.1.1', '3.1.1');
                t.matchGridCellContent(locked, 5, 1, '4', '4');
                t.matchGridCellContent(locked, 6, 1, '4.1', '4.1');
            })
        }
    )
});
