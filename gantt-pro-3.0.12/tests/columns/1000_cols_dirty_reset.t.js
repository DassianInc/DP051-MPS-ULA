StartTest(function(t) {

    // #958: check if columns reset dirty CSS after commit call

    var g = t.getGantt({
        startDate       : new Date(2010, 1, 1),
        endDate         : new Date(2010, 2, 1),
        renderTo        : Ext.getBody(),
        cascadeChanges  : false,
        columns         : [
            { xtype : 'namecolumn' },
            { xtype : 'startdatecolumn' },
            { xtype : 'enddatecolumn' },
            { xtype : 'percentdonecolumn' },
            { xtype : 'durationcolumn' },
            { xtype : 'effortcolumn' },
            { xtype : 'schedulingmodecolumn' }
        ],
        taskStore       : t.getTaskStore({
            DATA            : [{
                children        : null,
                leaf            : true,
                expanded        : false,
                Id              : 117,
                StartDate       : "2010-02-03T00:00:00",
                Duration        : 6,
                DurationUnit    : "d"
            }]
        })
    });

    var taskStore    = g.taskStore,
        firstTask    = t.getFirstLeafTask(taskStore);

    t.waitForEventsToRender(g, function () {

        firstTask.beginEdit();
        firstTask.setName('smth');
        firstTask.setPercentDone(50);
        firstTask.setStartDate(new Date(2010, 1, 2));
        firstTask.setDuration(5);
        firstTask.setEffort(12);
        firstTask.setSchedulingMode('FixedDuration');
        firstTask.endEdit();

        t.chain(
            { waitFor : 100 },

            function (next) {
                firstTask.commit(false, []);

                next();
            },

            { waitFor : 500 },

            function (next) {
                t.notOk( t.compositeQuery('ganttpanel => .' + Ext.baseCSSPrefix + 'grid-dirty-cell').length, 'There is no any dirty cell');
            }
        );
    })
});
