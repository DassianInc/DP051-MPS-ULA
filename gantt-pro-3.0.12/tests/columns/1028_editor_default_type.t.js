StartTest(function(t) {

    // #2287 - Task columns: custom editor w/o xtype provided causes exception

    var columns = [];

    // collect all columns mixed in with TaskFieldColumn
    Ext.Array.each(Ext.ClassManager.getNamesByExpression('widget.ganttcolumn.*'), function (n) {
        var c = Ext.ClassManager.get(n);
        if (c) {
            var proto = c.prototype;

            if (proto.mixins['Gnt.column.mixin.TaskFieldColumn']) {
                var alias = proto.alias;

                columns.push({
                    xtype  : (alias.length ? alias[0] : alias).replace('widget.', ''),
                    // provide editor w/o "xtype"
                    editor : {
                        foo : 'bar'
                    }
                })
            }
        }
    });

    var g = t.getGantt({
        startDate       : new Date(2010, 1, 1),
        endDate         : new Date(2010, 2, 1),
        cascadeChanges  : false,
        columns         : columns,
        taskStore       : t.getTaskStore({
            DATA            : [{
                leaf            : true,
                Id              : 117,
                StartDate       : "2010-02-03T00:00:00",
                Duration        : 6,
                DurationUnit    : "d"
            }]
        }),
        plugins : 'scheduler_treecellediting'
    });

    t.livesOk(function () { g.render(Ext.getBody()); }, 'renders w/o exceptions');
});
