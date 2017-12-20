StartTest(function(t) {

    // #1627
    var g = t.getGantt({
        renderTo        : Ext.getBody(),
        startDate       : new Date(2010, 0, 29),
        taskStore       : new Gnt.data.TaskStore({
            root            : {
                expanded : true,
                children : [
                    {
                        "Id"   : 1,
                        leaf   : true,
                        "Cls"  : "one"
                    },
                    {
                        "Id"   : 2,
                        leaf   : true,
                        "Cls"  : "two"
                    }
                ]
            }
        })
    });

    var ts = g.taskStore;
    var first = ts.getById(1);
    var second = ts.getById(2);
    var sm = g.getSelectionModel();
    var selectedRowSelector = '.' + Ext.grid.View.prototype.selectedItemCls;

    t.chain(
        { waitFor : 'rowsVisible' },

        function() {
            sm.select(ts.getById(1));

            t.selectorCountIs('.sch-timelineview ' + selectedRowSelector, 1);

            ts.filterTreeBy(function(task) {
                return task.data.Id === 1;
            });

            t.is(sm.selected.length, 0, 'No selections after filter');
            t.selectorCountIs(selectedRowSelector, 0);

            sm.select(ts.getById(1));

            ts.clearTreeFilter();

            t.is(sm.selected.length, 0, 'No selections after clearing filter');
            t.selectorCountIs(selectedRowSelector, 0);
        }
    );
});
