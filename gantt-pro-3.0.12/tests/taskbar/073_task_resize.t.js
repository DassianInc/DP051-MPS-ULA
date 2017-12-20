StartTest(function (t) {
    var valid = true,
        gantt = t.getGantt({
            width             : 500,
            columns           : [
                {xtype : 'treecolumn'}
            ],
            renderTo          : Ext.getBody(),
            viewConfig        : { forceFit : true },
            resizeValidatorFn : function () {
                return valid;
            },
            startDate : new Date(2010, 1, 1),
            endDate : new Date(2010, 2, 1),
            taskStore : new Gnt.data.TaskStore({
                root : {
                    expanded : true,
                    children : [
                        { StartDate : new Date(2010, 1, 8), Duration : 5, leaf : true }
                    ]
                }
            })
        });

    var fired = {
        'beforetaskresize'  : 0,
        'taskresizestart'   : 0,
        'partialtaskresize' : 0,
        'aftertaskresize'   : 0
    };

    gantt.on({
        'beforetaskresize' : function () {
            t.ok(arguments[0] instanceof Gnt.view.Gantt &&
                arguments[1] instanceof Gnt.model.Task && !!arguments[2].getTarget, 'Correct event signature of `beforetaskresize`')

            fired.beforetaskresize++;
        },
        'taskresizestart'  : function () {
            t.ok(arguments[0] instanceof Gnt.view.Gantt &&
                arguments[1] instanceof Gnt.model.Task, 'Correct event signature of `taskresizestart`')

            fired.taskresizestart++;
        },

        'aftertaskresize' : function () {
            t.ok(arguments[0] instanceof Gnt.view.Gantt &&
                arguments[1] instanceof Gnt.model.Task, 'Correct event signature of `taskresizeend`')

            fired.aftertaskresize++;
        }
    });

    gantt.on({
        'partialtaskresize' : function () {
            t.ok(arguments[0] instanceof Gnt.view.Gantt &&
                arguments[1] instanceof Gnt.model.Task &&
                arguments[2] instanceof Date &&
                arguments[3] instanceof Date &&
                arguments[4] instanceof Ext.Element, 'Correct event signature of `partialtaskresize`')

            fired.partialtaskresize++;
        },
        single              : true
    });

    var task = gantt.taskStore.getRootNode().firstChild,
        originalEnd = task.getEndDate(),
        originalStart = task.getStartDate();

    t.chain(
        { waitFor : 'rowsVisible', args : gantt },

        { action : 'drag', target : '.sch-resizable-handle-end', by : [7*gantt.timeAxisViewModel.getTickWidth(), 0]},

        function (next) {

            for (var o in fired) {
                t.ok(fired[o] === 1, Ext.String.format("'{0}' event fired", o));
            }

            t.is(task.getEndDate(), new Date(2010, 1, 20), 'Dragged end-handle, EndDate changed');
            next();
        },

        { action : 'drag', target : '.sch-resizable-handle-start', by : [-5*gantt.timeAxisViewModel.getTickWidth(), 0]},

        function (next) {
            t.is(task.getStartDate(), new Date(2010, 1, 3), 'Dragged start-handle, StartDate changed');

            gantt.on('beforetaskresize', function () {
                return false;
            }, null, { single : true });

            for (var o in fired) {
                fired[o] = 0;
            }
            next();
        },

        { action : 'drag', target : '.sch-resizable-handle-end', by : [gantt.timeAxisViewModel.getTickWidth(), 0]},

        function (next) {
            delete fired.beforetaskresize;

                // Make sure no events were fired, e.g. operation didn't start
                for (var o in fired) {
                    // http://www.sencha.com/forum/showthread.php?291037-relayEvents-broken&p=1063164#post1063164
                    t.todo(function(t) {
                        t.is(fired[o], 0, Ext.String.format("'{0}' event not fired since false was returned by beforetaskresize handler", o));
                    })
                }

            var end = task.getEndDate();
            var width = gantt.getSchedulingView().getElementFromEventRecord(task).getWidth();

            valid = false;
            t.dragBy('.sch-resizable-handle-end', [50, 0], function () {
                t.isDateEqual(task.getEndDate(), end, 'Dragged end-handle, EndDate not changed due to validator fn');
                t.is(gantt.getSchedulingView().getElementFromEventRecord(task).getWidth(), width, 'Width not changed due to validator fn');
            });
        }
    )
})
