StartTest(function(t) {
    
    //======================================================================================================================================================================================================================================================
    t.diag('Setup');
    
    var g = t.getGantt({
        taskStore : t.getTaskStore({
            DATA : [
                { Id : 1, Name : 'foo', leaf : true },
                { Id : 2, Name : 'foo2', leaf : true },
                { Id : 3, Name : 'bar', leaf : true }
            ]
        }),
        renderTo        : Ext.getBody()
    });

    t.is(g.taskStore.getNodeById(1).data.index, 0, 'Index 0 before drag')

    t.chain(
        { waitFor : 'rowsVisible' },

        // should not throw any exceptions
        { drag : '.x-grid-cell-treecolumn', by : [0, 200] },

        { drag : '.x-grid-cell-treecolumn', by : [0, 60] },

        function() {
            t.is(g.taskStore.getNodeById(1).data.index, 2, 'Index 2 after drag')
        }
    );
});    
