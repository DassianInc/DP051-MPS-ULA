StartTest(function (t) {

    var initGanttPanel = function () {

        if (g) g.destroy();

        var taskStore = Ext.create("Gnt.data.TaskStore", {
            proxy : {
                type   : 'ajax',
                url    : 'data/rolluptasks.json',
                reader : {
                    type         : 'json',
                    rootProperty : 'tasks'
                }
            },
            root  : {
                expanded : true
            }
        });

        g = t.getGantt({
            startDate       : new Date(2010, 0, 11),
            endDate         : Sch.util.Date.add(new Date(2010, 0, 4), Sch.util.Date.WEEK, 20),
            showRollupTasks : true,
            viewPreset      : 'weekAndDayLetter',
            renderTo        : Ext.getBody(),
            columns         : [
                { xtype : 'rollupcolumn' }
            ],
            taskStore       : taskStore
        });

        return g;

    };

    var g;

    var getModel = function (name) {
        return g.store.findRecord('Name', name);
    }

    t.it('Assert rollup task is set on parenttask', function (t) {
        g = initGanttPanel();

        t.chain(
            { waitForRowsVisible : g },

            function (next) {
                t.diag('Assert rollup set on model')
                t.expect(getModel('Investigate').getRollup()).toBeTruthy();

                t.validateRollupGantt(g);

                next();
            },

            { drag : '.sch-gantt-task:contains(Investigate)', by : [200, 0] },

            function (next) {

                t.validateRollupGantt(g);

                var model = getModel('Investigate');
                model.setRollup(false);

                t.validateRollupGantt(g);
                model.setRollup(true);

                t.validateRollupGantt(g);

                model.setStartDate(new Date(2010, 0, 18), false);

                t.validateRollupGantt(g);
            }
        );
    });

    t.it('Assert rollup milestone is set on parenttask', function (t) {

        g = initGanttPanel();

        t.chain(
            { waitForRowsVisible : g },

            function (next) {

                t.validateRollupGantt(g);

                next();
            },

            { drag : '.sch-gantt-milestone:contains(Report to management)', by : [200, 0] },

            function (next) {

                t.validateRollupGantt(g);

                //Change Milestone into normaltask
                var model = getModel('Report to management');
                model.setDuration(1);

                t.validateRollupGantt(g);
            }
        );

    });

    t.it('Assert rollup parenttask is set on parenttask', function (t) {

        g = initGanttPanel();

        t.chain(
            { drag : '.sch-gantt-parent-task:contains(Build prototype)', by : [150, 0] },

            function (next) {
                t.validateRollupGantt(g);
            }
        );

    });

    t.it('Assert rollup task cannot be dragged', function (t) {

        g = initGanttPanel();

        t.chain(
            { waitForRowsVisible : g },

            function() {
                t.elementIsNotTopElement('.sch-rollup-task', 'Can not interact with rollup task in the DOM');
            }
        );
    });

    t.it('Assert rollup setShowRollupTasks', function (t) {

        g = initGanttPanel();

        t.chain(

            { waitForRowsVisible : g },

            function (next) {
                g.setShowRollupTasks(false);

                t.selectorNotExists('.sch-rollup-wrap');
            }
        );
    });
});