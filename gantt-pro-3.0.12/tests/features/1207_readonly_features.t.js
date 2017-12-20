StartTest(function (t) {

    var gantt;

    function getGantt(config, storeConfig) {

        if (gantt) gantt.destroy();

        var taskStore   = t.getTaskStore(storeConfig);

        return t.getGantt(Ext.apply({
            renderTo    : Ext.getBody(),
            startDate   : new Date(2015, 0, 1),
            endDate     : Sch.util.Date.add(new Date(2015, 0, 1), Sch.util.Date.WEEK, 20),
            taskStore   : taskStore
        }, config));
    }

    function assertDrag (t, finish, task, expectedDate, dragged, by) {

        var fn = [dragged ? 'isNot' : 'is'];

        t.dragBy('.' + task.getId(), by, function () {
            t[fn](task.getStartDate().getTime(), expectedDate.getTime(), 'Task ' + fn + ' dragged');

            if (task.isProject) {
                task.expand(false, finish);
            } else {
                finish();
            }
        });
    }


    t.it('Dragging task on readonly projects/tasks should be disabled', function (t) {

        gantt = getGantt(null, { DATA : [ t.getProject('Project', true, true) ] });

        var store   = gantt.taskStore,
            project = store.getNodeById('Project'),
            task    = store.getNodeById('Project_task_1');

        t.chain(
            { waitForRowsVisible : gantt },

            function (next) {
                assertDrag(t, next, task, new Date(2015, 0, 1), false, [50, 0]);
            },

            function (next) {
                assertDrag(t, next, project, new Date(2015, 0, 1), false, [50, 0]);
            },

            function (next) {
                project.setReadOnly(false);
                assertDrag(t, next, project, new Date(2015, 0, 1), true, [50, 0]);
            },
            function (next) {
                t.done();
            }

        );

    });

    t.it('Resizing handles and dependency terminals are hidden for a readonly project/task', function (t) {

        gantt       = getGantt({ enableProgressBarResize : true }, { DATA : [ t.getProject('Project', true) ] });

        t.chain(
            { waitForRowsVisible : gantt },
            {
                moveCursorTo : function () {
                    var row = gantt.getSchedulingView().getNode(0);
                    return Ext.get(row).down('.sch-gantt-item');
                }
            },
            function (next, el) {
                t.notOk(el.down('.sch-resizable-handle-start'), 'Start resizehandler should not be there');
                t.notOk(el.down('.sch-resizable-handle-end'), 'End resizehandler should not be there');

                t.notOk(el.down('.sch-gantt-progressbar-handle'));
                t.notOk(el.down('.sch-gantt-terminal-start').isVisible());
                t.notOk(el.down('.sch-gantt-terminal-end').isVisible());

                next();
            },
            {
                moveCursorTo : function () {
                    var row = gantt.getSchedulingView().getNode(1);
                    return Ext.get(row).down('.sch-gantt-item');
                }
            },
            function (next, el) {
                t.notOk(el.down('.sch-resizable-handle-start').isVisible(), 'Start resizehandler should be hidden');
                t.notOk(el.down('.sch-resizable-handle-end').isVisible(), 'End resizehandler should be hidden');

                t.notOk(el.down('.sch-gantt-progressbar-handle').isVisible());
                t.notOk(el.down('.sch-gantt-terminal-start').isVisible());
                t.notOk(el.down('.sch-gantt-terminal-end').isVisible());

                gantt.taskStore.getRoot().firstChild.setReadOnly(false);

                next();
            },

            {
                moveCursorTo : function () {
                    var row = gantt.getSchedulingView().getNode(0);
                    return Ext.get(row).down('.sch-gantt-item');
                }
            },
            function (next, el) {
                t.notOk(el.down('.sch-resizable-handle-start'), 'Start resizehandler should not be there');
                t.notOk(el.down('.sch-resizable-handle-end'), 'End resizehandler should not be there');

                t.notOk(el.down('.sch-gantt-progressbar-handle'), 'progress resizer is hidden');
                t.notOk(el.down('.sch-gantt-terminal-start').isVisible(), 'dependency start terminal is hidden');
                t.notOk(el.down('.sch-gantt-terminal-end').isVisible(), 'dependency end terminal is hidden');

                next();
            },
            {
                moveCursorTo : function () {
                    var row = gantt.getSchedulingView().getNode(1);
                    return Ext.get(row).down('.sch-gantt-item');
                }
            },
            function (next, el) {
                t.ok(el.down('.sch-resizable-handle-start').isVisible(), 'Start resize handler is visible');
                t.ok(el.down('.sch-resizable-handle-end').isVisible(), 'End resize handler is visible');

                t.ok(el.down('.sch-gantt-progressbar-handle').isVisible(), 'progress resizer is visible');
                t.ok(el.down('.sch-gantt-terminal-start').isVisible(), 'dependency start terminal is visible');
                t.ok(el.down('.sch-gantt-terminal-end').isVisible(), 'dependency end terminal is visible');
            }
        );
    });

    t.it('Dragcreate on readonly project should be disabled', function (t) {

        gantt = getGantt(null, { DATA : [ t.getProject('Project', true, true) ] });

        var store   = gantt.taskStore,
            project = store.getNodeById('Project'),
            task    = store.getNodeById('Project_task_3');

        t.chain(
            { waitForRowsVisible : gantt },

            function (next) {

                var startXY = t.getCell(gantt.normalGrid, 3, 0).getXY();
                startXY[0] = startXY[0] + 2;
                startXY[1] = startXY[1] + 2;

                t.dragBy(startXY, [150, 0], function () {
                    t.expect(task.getStartDate()).toBeNull();
                    project.setReadOnly(false);
                    next();
                });
            },

            function (next) {

                var startXY = t.getCell(gantt.normalGrid, 3, 0).getXY();
                startXY[0] = startXY[0] + 2;
                startXY[1] = startXY[1] + 2;

                t.dragBy(startXY, [150, 0], function () {
                    t.expect(task.getStartDate()).toBeDefined();
                });
            }
        );

    });

    // TreeViewDragDrop should take readonly state into account
    t.it('TreeViewDragDrop takes readonly state into account', function (t) {

        gantt = getGantt(null, {
            DATA : [
                {
                    Id        : 1,
                    Cls       : 1,
                    StartDate : '2015-01-05',
                    Duration  : 5,
                    ReadOnly  : true,
                    expanded  : true,
                    children  : [
                        {
                            Id        : 11,
                            Cls       : 11,
                            StartDate : '2015-01-05',
                            Duration  : 5,
                            expanded  : true,
                            leaf      : true
                        }
                    ]
                },
                {
                    Id        : 2,
                    Cls       : 2,
                    StartDate : '2015-01-05',
                    Duration  : 5,
                    expanded  : true,
                    children  : [
                        {
                            Id        : 21,
                            Cls       : 21,
                            StartDate : '2015-01-05',
                            Duration  : 5,
                            expanded  : true,
                            leaf      : true
                        }
                    ]
                }
            ]
        });

        var view   = gantt.lockedGrid.view,
            store  = gantt.taskStore,
            root   = store.getRoot(),
            task1  = store.getNodeById(1),
            task11 = store.getNodeById(11),
            task2  = store.getNodeById(2),
            task21 = store.getNodeById(21);

        t.chain(
            { waitForRowsVisible : gantt },

            function (next) {
                t.dragBy(
                    view.getNode(task1),
                    [0, 50],
                    function () {
                        t.is(task1.parentNode, root, 'task1 is still under the root');
                        t.notOk(task1.previousSibling, 'task1 prev sibling stayed intact');
                        next();
                    }
                );
            },

            function (next) {
                t.dragBy(
                    view.getNode(task11),
                    [0, 50],
                    function () {
                        t.is(task11.parentNode, task1, 'task11 is still under the task1');
                        t.notOk(task11.previousSibling, 'task11 prev sibling stayed intact');
                        next();
                    }
                );
            },

            function (next) {
                t.dragBy(
                    view.getNode(task2),
                    [0, -20],
                    function () {
                        t.is(task2.parentNode, root, 'task2 is still under the root');
                        t.is(task2.previousSibling, task1, 'task2 prev sibling stayed intact');
                        next();
                    }
                );
            },

            function (next) {
                t.dragBy(
                    view.getNode(task21),
                    [0, -40],
                    function () {
                        t.is(task21.parentNode, task2, 'task21 is still under the task2');
                        t.notOk(task21.previousSibling, 'task21 prev sibling stayed intact');
                        next();
                    }
                );
            }
        );

    });
});