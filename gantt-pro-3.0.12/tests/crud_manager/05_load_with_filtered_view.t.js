describe('#2187: Loading data to filtered task store produces buggy view', function (t) {

    t.it('View should handle reloading CrudManager while being filtered', function (t) {

        Ext.ux.ajax.SimManager.init().register(
            {
                'load.json' : {
                    stype : 'json',  // use JsonSimlet (stype is like xtype for components)
                    data  : {
                        "success" : true,
                        "tasks"   : {
                            "rows" : [
                                {
                                    Name     : 'root1',
                                    expanded : true,
                                    children : [
                                        {Id : 1, Name : 'foo', leaf : true},
                                        {Id : 2, Name : 'bar', leaf : true},
                                        {Id : 3, Name : 'baz', leaf : true}
                                    ]
                                },
                                {
                                    Name     : 'root2',
                                    expanded : true,
                                    children : [
                                        {Id : 11, Name : 'foobar', leaf : true},
                                        {Id : 21, Name : 'bar', leaf : true},
                                        {Id : 31, Name : 'baz', leaf : true}
                                    ]
                                }
                            ]
                        }
                    }
                }
            }
        );

        var cm = new Gnt.data.CrudManager({
            taskStore : new Gnt.data.TaskStore(),
            autoLoad  : true,
            transport : {
                load : {
                    method : 'GET',
                    url    : 'load.json'
                }
            }
        });

        var gantt = t.getGantt({
            renderTo    : document.body,
            columns     : [{xtype : 'namecolumn'}],
            crudManager : cm
        });

        var as = t.beginAsync();

        setTimeout(function() {

            gantt.taskStore.filterTreeBy(function (t) {
                return t.data.Name.match('foo');
            });

            cm.load(function() {
                t.endAsync(as);

                // Broken in Ext 5.1.0
                if (Ext.versions.extjs.isGreaterThan('5.1.0.107')) {
                    t.matchGridCellContent(gantt.lockedGrid, 0, 0, 'root1');
                    t.matchGridCellContent(gantt.lockedGrid, 1, 0, 'foo');
                    t.matchGridCellContent(gantt.lockedGrid, 2, 0, 'root2');
                    t.matchGridCellContent(gantt.lockedGrid, 3, 0, 'foo');
                }
            });

        }, 100)
    });
});
