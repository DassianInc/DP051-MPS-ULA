StartTest(function (t) {

    t.it('Should be able to use all actions of the menu',  function(t) {
        var menu    = new Gnt.plugin.TaskContextMenu({
            triggerEvent : ['taskcontextmenu', 'containercontextmenu']
        });

        var g = t.getGantt({
            lockedGridConfig    : { width : 150 },
            renderTo   : Ext.getBody(),
            forceFit   : true,
            plugins    : menu
        });

        t.chain(
            { waitForTasksAndDependenciesToRender : g },
            { rightClick : t.getFirstLeafTaskEl(g) },
            { waitForComponentVisible : menu },

            function (next) {
                var store = g.taskStore,
                    root = store.getRootNode();

                var firstTask = g.resolveTaskRecord(t.getFirstLeafTaskEl(g));

                t.pass('Context menu shown after task bar contextmenu click');
                menu.addTaskAboveAction();
                t.is(g.getSchedulingView().el.select('.' + Ext.grid.View.prototype.selectedItemCls).getCount(), 1, '1 row selected (bug #123)');

                menu.addMilestone();
                var newTask = firstTask.nextSibling;
                t.ok(newTask.isMilestone(), 'Milestone added');

                t.isStartEnd(newTask, firstTask.getEndDate(), firstTask.getEndDate(), 'Correct dates for milestone');

                menu.toggleMilestone();
                t.ok(firstTask.isMilestone(), 'Converted to milestone');
                t.is(firstTask.getDuration(), 0, 'Correct duration for milestone');

                menu.toggleMilestone();
                t.notOk(firstTask.isMilestone(), 'Converted to regular task');
                t.is(firstTask.getDuration(), 1, 'Correct duration for milestone');


                menu.addTaskBelowAction();
                menu.addSubtask();
                menu.addSuccessor();
                menu.addPredecessor();
                menu.editLeftLabel();
                menu.editRightLabel();
                menu.deleteTask();
                menu.hide();

                root.removeAll();
                menu.hide();
                t.ok(!menu.isVisible(), 'Context menu hidden');

                next();
            },
             //wait for 100ms here to zones to disappear, otherwise we can click on the timespan zone by accident
             //(since all tasks were removed from store they will be reachable)
            'waitFor(100)',
            { rightClick : g.getSchedulingView().el },

            function () {
                t.ok(menu.isVisible(), 'Context menu shown after contextmenu click on empty gantt body');
                menu.addTaskAboveAction();
                g.destroy();
                t.notOk(menu.el, 'Menu element destroyed');
            }
        );
    });

    t.it('Should function correctly when no tasks exist',  function(t) {
        var menu2   = new Gnt.plugin.TaskContextMenu();

        var g2 = t.getGantt({
            renderTo : Ext.getBody(),
            viewConfig : { forceFit : true },
            startDate : new Date(1980, 1, 1),
            endDate : new Date(1980, 6, 1),
            forceFit : true,
            plugins : menu2
        });

        t.chain(
            { waitForRowsVisible : g2 },
            { rightClick : t.getFirstScheduleRowEl(g2) },
            { waitForComponentVisible : menu2 },

            function (next) {
                var store = g2.taskStore,
                    root = store.getRootNode();

                t.pass('Context menu shown after row contextmenu click');
                menu2.hide();

                root.removeAll();
                next();
            },

            { click : null },

            function(next) {
                t.ok(!menu2.isVisible(), 'Context menu hidden');
                next();
            },

            { rightClick : null } ,

            function(next) {
                t.ok(menu2.isVisible(), 'Context menu shown after contextmenu click on empty gantt body');

                menu2.hide();
                next();
            },

            { rightClick : g2.lockedGrid.getView().el },

            function(next) {
                t.ok(menu2.isVisible(), 'Context menu shown after contextmenu click on empty locked grid body');
                next();
            },
            function () { g2.destroy(); }
        )
    });

    // #1371
    t.it('Task context does not work for a tasks store root node',  function(t) {
        var menu = new Gnt.plugin.TaskContextMenu();

        var g = t.getGantt({
            rootVisible         : true,
            lockedGridConfig    : { width : 100 },
            renderTo            : Ext.getBody(),
            forceFit            : true,
            plugins             : menu
        });

        t.chain(
            { waitForRowsVisible : g },
            { rightClick : t.getFirstScheduleRowEl(g) },
            // give it enough time to show
            { waitFor : 2000 },
            function(next) {
                t.notOk(menu.isVisible(), 'Context menu hidden');
                next();
            },
            function () { g.destroy(); }
        );
    });

    // #1889
    t.it('Task context menu disappears when clicking another grid row',  function(t) {
        var menu    = new Gnt.plugin.TaskContextMenu();

        var g       = t.getGantt({
            lockedGridConfig    : { width : 100 },
            renderTo            : Ext.getBody(),
            forceFit            : true,
            plugins             : menu,
            eventRenderer       : function (record) {
                return  { cls : 'task-' + record.getId() }
            }
        });

        t.chain(
            { waitForRowsVisible : g },
            { rightClick : g.el.down('.task-114') },
            { waitForComponentVisible : menu, desc : 'context menu showed' },
            { click : g.el.down('.task-117'), offset : [10, 5] },
            { waitForComponentNotVisible : menu, desc : 'Click on task closed menu' },

            { rightClick : g.el.down('.task-114') },
            { waitForComponentVisible : menu, desc : 'context menu showed' },
            { click : t.getNthScheduleRowEl(g, 1), offset : [ 10, 10 ] }, // provide offset to not interfere w/ the opened menu
            { waitForComponentNotVisible : menu, desc : 'Click on scheduling area closed menu' },
            function () { g.destroy(); }
        );
    });

    // #2057
    t.it('Task context menu disables corresponding menu entry when left/right editor is absent',  function(t) {
        var menu    = new Gnt.plugin.TaskContextMenu();

        var g       = t.getGantt({
            renderTo        : Ext.getBody(),
            plugins         : menu,
            leftLabelField  : {
                dataIndex   : 'Name',
                editor      : { xtype : 'textfield' }
            },
            eventRenderer   : function (record) {
                return  { cls : 'foo-' + record.getId() }
            }
        });

        t.chain(
            { waitForRowsVisible : g },
            { rightClick : '.foo-114' },
            { waitForComponentVisible : menu, desc : 'Context menu showed' },

            function () {
                t.notOk(t.cq1('#editLeftLabel').isDisabled(), 'Left label editing enabled');
                t.ok(t.cq1('#editRightLabel').isDisabled(), 'Right label editing disabled');
                g.destroy();
            }

        );
    });

    // ReadOnly #342
    t.it('Task context menu disables corresponding menu entries when task is readonly',  function(t) {
        var menu    = new Gnt.plugin.TaskContextMenu(),
            addMenu = menu.query('#addTaskMenu')[0];

        var g       = t.getGantt({
            renderTo        : Ext.getBody(),
            plugins         : menu,
            leftLabelField  : {
                dataIndex   : 'Name',
                editor      : { xtype : 'textfield' }
            },
            eventRenderer   : function (record) {
                return  { cls : 'task-' + record.getId() }
            }
        });

        var task = g.taskStore.getNodeById(117);
        task.setReadOnly(true);

        t.chain(
            { waitForRowsVisible : g },
            { rightClick : '.task-117' },
            { waitForComponentVisible : menu, desc : 'Context menu showed' },

            function (next) {
                t.notOk(t.cq1('#deleteTask').isDisabled(), 'Delete task is enabled');
                t.ok(t.cq1('#editRightLabel').isDisabled(), 'Left label editing is disabled');
                t.ok(t.cq1('#toggleMilestone').isDisabled(), 'Toggle Milestone is disabled');
                t.ok(t.cq1('#splitTask').isDisabled(), 'Splitting task is disabled');
                next();
            },
            { moveCursorTo : '>> #addTaskMenu' },
            { waitForComponentVisible : addMenu, desc : 'Add menu showed' },

            function (next) {
                t.notOk(t.cq1('#addTaskAbove').isDisabled(), 'Add task above is enabled');
                t.notOk(t.cq1('#addTaskBelow').isDisabled(), 'Add task below is enabled');
                t.ok(t.cq1('#addMilestone').isDisabled(), 'Add Milestone is disabled');
                t.ok(t.cq1('#addSubtask').isDisabled(), 'Add subtask is disabled');
                t.notOk(t.cq1('#addSuccessor').isDisabled(), 'Add successor is enabled');
                t.notOk(t.cq1('#addPredecessor').isDisabled(), 'Add successor is enabled');
                next();
            },

            function (next) {
                menu.hide();
                task.parentNode.setReadOnly(true);
                next();
            },

            { rightClick : '.task-117' },
            { waitForComponentVisible : menu, desc : 'Context menu showed' },
            { moveCursorTo : '>> #addTaskMenu' },
            { waitForComponentVisible : addMenu, desc : 'Add menu showed' },

            function (next) {
                t.ok(t.cq1('#addTaskAbove').isDisabled(), 'Add task above is disabled');
                t.ok(t.cq1('#addTaskBelow').isDisabled(), 'Add task below is disabled');
                t.ok(t.cq1('#addSuccessor').isDisabled(), 'Add successor is disabled');
                t.ok(t.cq1('#addPredecessor').isDisabled(), 'Add successor is disabled');
                g.destroy();
            }
        );
    });

});
