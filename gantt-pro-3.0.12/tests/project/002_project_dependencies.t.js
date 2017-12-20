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

    var dragDependency = function (finish, from, to, fromTerm, toTerm) {

        t.chain(
            {
                moveCursorTo : function () {
                    var row = gantt.getSchedulingView().getNode(from);
                    return Ext.get(row).down('.sch-gantt-item');
                }
            },
            {
                action : 'drag',
                target : function (p) {
                    var el = p.args[0];
                    return el.down('.sch-gantt-terminal-' + fromTerm);
                },
                to : function () {
                    var row = gantt.getSchedulingView().getNode(to);
                    return Ext.get(row).down('.sch-gantt-item');
                },
                dragOnly : true
            },
            {
                moveCursorTo : function (p) {
                    var row = gantt.getSchedulingView().getNode(to);
                    return Ext.get(row).down('.sch-gantt-terminal-' + toTerm);
                }
            },
            {
                action : 'mouseUp'
            },
            function (next) {
                finish();
            }
        );

    };

    t.it('Dependencies between projects not allowed', function (t) {

        var drop = 0;

        gantt = getGantt(null, { DATA : [ t.getProject('Project'), t.getProject('OtherProject') ] });

        gantt.getDependencyView().on({
            'drop' : function (dep, fromId, toId, type, eOpts) {
                drop++;
            }
        });

        t.waitForEventsToRender(gantt, function () {
            t.chain(
                { moveCursorTo : '.sch-gantt-project-task' },
                function (next, el) {
                    var terminal = Ext.get(el).down('.sch-gantt-terminal');
                    t.notOk(terminal.isVisible(), false, 'Project terminal should be hidden');
                    next();
                },
                function (next) {
                    dragDependency(next, 2, 5, 'end', 'start');
                },
                function (next) {
                    t.is(drop, 0, 'No drop fired on other project');
                    dragDependency(next, 1, 2, 'end', 'start');
                },
                function (next) {
                    t.is(drop, 1, 'Drop fired on own project');
                }
            );
        });

    });

    t.it('Dependencies between projects allowed', function (t) {

        var drop = 0;

        gantt   = getGantt(null, {
            DATA : [ t.getProject('Project', false, true), t.getProject('OtherProject', false, true) ]
        });

        gantt.getDependencyView().on({
            'drop' : function (dep, fromId, toId, type, eOpts) {
                drop++;
            }
        });

        t.waitForEventsToRender(gantt, function () {
            t.chain(
                function (next) {
                    dragDependency(next, 2, 5, 'end', 'start');
                },
                function (next) {
                    t.is(drop, 1, 'Drop fired on other project');
                }
            );
        });
    });

    t.it('Dependencies from readonly projects not possible', function (t) {

        gantt   = getGantt(null, {
            DATA : [ t.getProject('Project', true, true), t.getProject('OtherProject', false, true) ]
        });

        t.waitForEventsToRender(gantt, function () {

            var view = gantt.getSchedulingView();

            t.chain(
                {
                    moveCursorTo : function () {
                        return Ext.get( view.getNode(2) ).down('.sch-gantt-item');
                    }
                },
                function (next, el) {
                    var terminal = Ext.get(el).down('.sch-gantt-terminal');
                    t.is(terminal.isVisible(), false, 'Task terminal should be hidden');
                    next();
                },
                {
                    moveCursorTo : function () {
                        return Ext.get( view.getNode(5) ).down('.sch-gantt-item');
                    }
                },
                function (next, el) {
                    var terminal = Ext.get(el).down('.sch-gantt-terminal');
                    t.is(terminal.isVisible(), true, 'Task terminal should be hidden');
                    var project = gantt.getTaskStore().getNodeById('Project');
                    project.setReadOnly(false);
                    next();
                },
                {
                    moveCursorTo : function () {
                        return Ext.get( view.getNode(2) ).down('.sch-gantt-item');
                    }
                },
                function (next, el) {
                    var terminal = Ext.get(el).down('.sch-gantt-terminal');
                    t.is(terminal.isVisible(), true, 'Task terminal should be hidden');
                    next();
                }
            );
        });
    });

});

