StartTest(function (t) {

    // Test for #1872 ticket

    t.it('Should not raise exception while redrawing hidden columns', function (t) {
        var gantt       = t.getGantt({
            renderTo    : Ext.getBody(),
            taskStore   : t.getTaskStore({
                DATA : {
                    expanded    : true,
                    children    : [{
                        Name        : 'P',
                        StartDate   : new Date(2010, 0, 5),
                        Duration    : 1,
                        expanded    : true,
                        children    : [{
                            Name        : 'T',
                            StartDate   : new Date(2010, 0, 5),
                            Duration    : 1,
                            leaf        : true
                        }]
                    }]
                }
            }),
            columns     : [
                {
                    xtype               : 'predecessorcolumn',
                    useSequenceNumber   : true,
                    hidden              : true
                }
            ]
        });

        t.chain(
            { waitForEventsToRender : gantt },

            function (next) {
                gantt.getTaskStore().getRoot().firstChild.collapse();
            }
        );
    });
});