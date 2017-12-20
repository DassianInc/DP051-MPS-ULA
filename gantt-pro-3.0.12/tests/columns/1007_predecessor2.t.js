StartTest(function(t) {

    // Ensure that predecessors/successors cols update their values after taskStore.setRootNode() call (#1197)

    var startDate       = new Date(2013, 0, 1)
    var DATE            = Sch.util.Date;

    var g               = t.getGantt({
        renderTo    : Ext.getBody(),

        startDate   : startDate,
        endDate     : DATE.add(startDate, DATE.WEEK, 10),

        columns     : [
            {
                xtype       : 'treecolumn',
                dataIndex   : 'Id'
            },
            {
                xtype       : 'predecessorcolumn'
            },
            {
                xtype       : 'successorcolumn'
            }
        ],
        taskStore   : new Gnt.data.TaskStore(),

        dependencyStore : new Gnt.data.DependencyStore({ data : [{ From : 1, To : 2 }, { From : 2, To : 3 }]})
    });

    t.waitForComponentVisible(g, function () {
        g.getTaskStore().setRootNode({
            expanded  : true,
            children  : [
                { Id : 1, Name : 'Foo', StartDate : startDate, Duration : 10, leaf : true },
                { Id : 2, Name : 'Bar', StartDate : startDate, Duration : 10, leaf : true },
                { Id : 3, Name : 'Baz', StartDate : startDate, Duration : 10, leaf : true }
            ]
        });

        t.matchGridCellContent(g.lockedGrid, 0, 1, '&nbsp;', 'proper predecessor for Foo');
        t.matchGridCellContent(g.lockedGrid, 1, 1, '1', 'proper predecessor for Bar');
        t.matchGridCellContent(g.lockedGrid, 2, 1, '2', 'proper predecessor for Baz');

        t.matchGridCellContent(g.lockedGrid, 0, 2, '2', 'proper successor for Foo');
        t.matchGridCellContent(g.lockedGrid, 1, 2, '3', 'proper successor for Bar');
        t.matchGridCellContent(g.lockedGrid, 2, 2, '&nbsp;', 'proper successor for Baz');
    });

});
