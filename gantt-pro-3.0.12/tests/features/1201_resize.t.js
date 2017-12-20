StartTest(function(t) {

    var g = t.getGantt({
        startDate   : new Date(2010, 1, 1),
        renderTo    : Ext.getBody()
    });

    g.on({
        'beforetaskresize' : function() {
            t.ok(arguments[0] instanceof Gnt.view.Gantt &&
                arguments[1] instanceof Gnt.model.Task &&
                !!arguments[2].getTarget, 'Correct event signature of `beforetaskresize`');
            fired.beforetaskresize++;
        },
        'taskresizestart' : function() {
            t.ok(arguments[0] instanceof Gnt.view.Gantt &&
                arguments[1] instanceof Gnt.model.Task, 'Correct event signature of `taskresizestart`');
            fired.taskresizestart++
        },
        'partialtaskresize' : function() {
            t.ok(arguments[0] instanceof Gnt.view.Gantt &&
                arguments[1] instanceof Gnt.model.Task &&
                arguments[2] instanceof Date &&
                arguments[3] instanceof Date &&
                arguments[4] instanceof Ext.Element, 'Correct event signature of `partialtaskresize`');
            fired.partialtaskresize++;
        },
        'aftertaskresize' : function() {
            t.ok(arguments[0] instanceof Gnt.view.Gantt &&
                 arguments[1] instanceof Gnt.model.Task, 'Correct event signature of `aftertaskresize`');
            fired.aftertaskresize++;
        }
    });

    var fired = {
        'beforetaskresize'      : 0,
        'taskresizestart'       : 0,
        'partialtaskresize'     : 0,
        'aftertaskresize'       : 0
    };

    var task            = g.taskStore.getRootNode().firstChild.firstChild,
        originalEnd     = task.get('EndDate'),
        originalStart   = task.get('StartDate'),
        resizeStopper   = function() { return false; };

    t.chain(
        {
            waitFor     : 'eventsToRender',
            args        : g
        },
        function (next) {
            var taskEl          = t.getFirstTaskBarEl(g),
                resizeHandle    = taskEl.down('.sch-resizable-handle-end');

            var taskHeight = taskEl.getHeight();

            g.on('partialtaskresize', function() { t.is(taskEl.getHeight(), taskHeight, 'Task resize el height unchanged'); }, null, { single : true });

            // Drag end resize handle bar 20px to the right
            t.drag(resizeHandle, null, [20, 0], next)
        },
        function (next) {
            for (var o in fired) {
                if (o === 'partialtaskresize') {
                    t.isGreater(fired[o], 0, Ext.String.format("'{0}' event fired", o));
                } else {
                    t.is(fired[o], 1, Ext.String.format("'{0}' event fired", o));
                }
            }

            t.isGreater(task.get('EndDate'), originalEnd, 'Dragged end-handle, EndDate changed');

            var resizeHandle = t.getFirstTaskBarEl(g).down('.sch-resizable-handle-start');

            // Drag start resize handle bar 20px to the left
            t.drag(resizeHandle, null, [-20, 0], next)
        },
        function (next) {
            t.isLess(task.get('StartDate'), originalStart, 'Dragged start-handle, StartDate changed');

            g.on('beforetaskresize', resizeStopper);

            var resizeHandle = t.getFirstTaskBarEl(g).down('.sch-resizable-handle-end');

            for (var o in fired) {
                fired[o] = 0;
            }

            // Drag end resize handle bar 20px to the right
            t.drag(resizeHandle, null, [20, 0], function() {

                delete fired.beforetaskresize;

                // Make sure no events were fired, e.g. operation didn't start
                for (var o in fired) {
                    t.is(fired[o], 0, Ext.String.format("'{0}' event not fired since false was returned by beforetaskresize handler", o));
                }

                next();
            });
        },
        // here we check that task having start date set to Monday and end date set to Saturday will keep its left/right coordinates
        // after we trying to drag start/end date to weekend day (#653)
        function (next) {
            t.diag('Reset beforetaskresize handler');

            g.un('beforetaskresize', resizeStopper);

            t.diag('Insert new task');

            g.getTaskStore().getRootNode().insertChild(0, { Id : 9999, StartDate: new Date(2010, 1, 8), EndDate: new Date(2010, 1, 13), Duration : 5, leaf : true });

            var taskBar         = t.getFirstTaskBarEl(g);
            var originalX       = taskBar.getX();

            // Drag end resize handle bar 10px to the left
            t.drag(taskBar.down('.sch-resizable-handle-start'), null, [-20, 0], function() {

                t.is(t.getFirstTaskBarEl(g).getX(), originalX, 'Left coordinate of task bar stayed the same');

                t.drag(t.getFirstTaskBarEl(g).down('.sch-resizable-handle-end'), null, [20, 0], function() {
                    t.is(t.getFirstTaskBarEl(g).getX(), originalX, 'Right coordinate of task bar stayed the same');
                });
            });
        }
    )
})
