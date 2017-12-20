StartTest(function (t) {
    var gantt, task1, task2, tickWidth;

    var getGantt = function (config) {
        var dragFn = function (record, start, duration, e) {
            var argsAreCorrect = arguments[0] instanceof Gnt.model.Task &&
                arguments[1] instanceof Date &&
                typeof arguments[2] === 'number' &&
                arguments[3] instanceof Ext.EventObjectImpl;

            if (!argsAreCorrect) t.fail('Correct `dndValidatorFn` function arguments');

            if (record == task1 && start > new Date(2010, 1, 5)) {
                return false;
            }
            return true;
        };

        var g = t.getGantt2(Ext.apply({
            margin         : 30,
            startDate      : new Date(2010, 1, 1),
            dndValidatorFn : dragFn,
            renderTo       : Ext.getBody(),
            taskStore      : new Gnt.data.TaskStore({
                proxy : 'memory',
                root  : {
                    children : [
                        {
                            Id        : 1,
                            Cls       : 'task1',
                            StartDate : new Date(2010, 1, 1),
                            Duration  : 3,
                            leaf      : true
                        },
                        {
                            Id        : 2,
                            Cls       : 'task2',
                            StartDate : new Date(2009, 11, 1),
                            Duration  : 100,
                            leaf      : true
                        },
                        {
                            Id        : 3,
                            Cls       : 'task3',
                            StartDate : new Date(2010, 1, 8),
                            Duration  : 3,
                            leaf      : true
                        }
                    ]
                }
            })
        }, config));

        return g;
    }

    t.it('Should be possible to drag a regular task', function (t) {
        gantt && gantt.destroy();

        gantt = getGantt();

        task1 = gantt.taskStore.getNodeById(1);

        tickWidth = gantt.timeAxisViewModel.getTickWidth();

        t.chain(
            { drag : '.task1', by : [ tickWidth, 0 ] },

            function (next) {
                t.is(task1.getStartDate(), new Date(2010, 1, 2), 'Task dragged properly');
            }
        );
    })


    t.it('Should be possible to block the drag with `dndValidatorFn`', function (t) {
        t.chain(
            { drag : '.task1', by : [ tickWidth * 10, 0 ] },

            function (next) {
                t.is(task1.getStartDate(), new Date(2010, 1, 2), 'Task drag blocked by dndValidatorFn');
                next();
            }
        );
    })


    t.it('Should be possible to drag a task that starts/ends outside of the view', function (t) {
        gantt && gantt.destroy();
        gantt = getGantt();

        task2 = gantt.taskStore.getNodeById(2);

        t.chain(
            // dragging a task that starts and ends outside of the current view
            { drag : '.task2', offset : [ 10, 5 ], by : [ tickWidth, 0 ] },

            function (next) {
                t.is(task2.getStartDate(), new Date(2009, 11, 2), 'Task dragged properly');
                next();
            },

            { drag : '.task2', offset : [ 2 * tickWidth, 5 ], by : [ -tickWidth, 0 ] },

            function (next) {
                t.is(task2.getStartDate(), new Date(2009, 11, 1), 'Task dragged properly');
                next();
            }
        );
    });

    t.it('Should cancel drop using async hook', function (t) {
        gantt && gantt.destroy();
        gantt = getGantt();

        tickWidth = gantt.timeAxisViewModel.getTickWidth();
        task1 = gantt.taskStore.getNodeById(1);

        t.wontFire(gantt, 'taskdrop', 'Task wasn\'t dropped');

        gantt.on('beforetaskdropfinalize', function (dz, dd, e) {
            setTimeout(function () {
                dd.finalize(false);
            }, 500);
            return false;
        });

        t.chain(
            { waitFor : 'rowsVisible', args : gantt },
            { drag : '.task1', by : [ tickWidth, 0 ] },
            function (next) {
                t.is(task1.getStartDate(), new Date(2010, 1, 1), 'Task hasn\'t moved');
                next();
            },
            { waitFor : 1000 },
            function (next) {
                t.is(task1.getStartDate(), new Date(2010, 1, 1), 'Task hasn\'t moved');
                next();
            }
        );
    });

    t.it('Should apply drop using async hook', function (t) {
        gantt && gantt.destroy();
        gantt = getGantt();

        gantt.on('beforetaskdropfinalize', function (dz, dd, e) {
            setTimeout(function () {
                dd.finalize(true);
            }, 500);
            return false;
        });
        t.firesOnce(gantt, 'taskdrop', 'Correct number of drop events');

        tickWidth = gantt.timeAxisViewModel.getTickWidth();
        task1 = gantt.taskStore.getNodeById(1);
        var task3 = gantt.taskStore.getNodeById(3);

        t.chain(
            { waitFor : 'rowsVisible', args : gantt },
            { drag : '.task1', by : [ tickWidth, 0 ] },
            function (next) {
                t.is(task1.getStartDate(), new Date(2010, 1, 1), 'Task hasn\'t moved');
                next();
            },
            { waitFor : 1000 },
            function (next) {
                t.is(task1.getStartDate(), new Date(2010, 1, 2), 'Task dragged');
                next();
            },
            { drag : '.task3', by : [ tickWidth * -1.5, 0 ] },
            function (next) {
                t.is(task3.getStartDate(), new Date(2010, 1, 8), 'Task hasn\'t moved');
                next();
            },
            { waitFor : 1000 },
            function (next) {
                t.is(task3.getStartDate(), new Date(2010, 1, 8), 'Task hasn\'t moved');
                next();
            }
        );
    });

    t.it('Should resize drag proxy', function (t) {
        gantt && gantt.destroy();
        gantt = getGantt({
            dndValidatorFn : null,
            dragDropConfig : {
                showExactDropPosition : true
            }
        });

        tickWidth = gantt.timeAxisViewModel.getTickWidth();
        task1 = gantt.taskStore.getNodeById(1);
        task1.setDuration(5);
        task1.setStartDate(new Date(2010, 1, 8));

        t.chain(
            { waitFor : 'rowsVisible', args : gantt },
            { drag : '.task1', by : [ tickWidth, 0 ], dragOnly : true },
            function (next) {
                t.isApprox(t.$('.x-dd-drag-ghost .task1').width(), tickWidth * 7, 2, 'Proxy resized');
                next();
            },
            { action : 'mouseUp' },
            { drag : '.task1', by : [ tickWidth * 5, 0 ], dragOnly : true },
            function (next) {
                t.isApprox(t.$('.x-dd-drag-ghost .task1').width(), tickWidth * 5, 2, 'Proxy resized');
                next();
            },
            { action : 'mouseUp' },
            { drag : '.task1', by : [ -3 * tickWidth, 0 ], dragOnly : true },
            function (next) {
                t.isApprox(t.$('.x-dd-drag-ghost .task1').width(), tickWidth * 7, 2, 'Proxy resized');
                next();
            },
            { action : 'mouseUp' }
        );
    });

    t.it('Mousedown + up should count as an invalid drop', function (t) {
        gantt && gantt.destroy();
        gantt = getGantt();

        task1 = gantt.taskStore.getNodeById(1);
        task1.setStartDate(new Date(2010, 1, 1));

        t.wontFire(gantt, 'taskdrop')

        t.chain(
            { drag : '.task1', by : [4, 0] },

            { mousedown : '.task1' },

            { waitFor : 1000 },

            { action : 'mouseup' },

            function (next) {
                t.is(task1.getStartDate(), new Date(2010, 1, 1), 'Task is untouched');
            }
        );
    });

    t.it('Should display correct drop position with snapToIncrement', function (t) {
        gantt && gantt.destroy();
        gantt = getGantt({
            snapToIncrement : true,
            dragDropConfig  : {
                showExactDropPosition : true
            }
        });

        var testBox;

        t.chain(
            { waitForSelector : '.task3' },
            function (next) {
                testBox = gantt.el.down('.task3').getBox();
                next();
            },
            { drag : '.task3', by : [10, 0], dragOnly : true },
            function (next) {
                var proxyBox = gantt.el.down('.x-dd-drag-ghost .sch-gantt-item').getBox();
                if (Ext.isIE8) {
                    t.isApprox(proxyBox.left, testBox.left, 1, 'Left position is correct');
                    t.isApprox(proxyBox.top, testBox.top, 1, 'Top position is correct');
                    t.is(proxyBox.width, testBox.width, 'Width is correct');
                    t.is(proxyBox.height, testBox.height, 'Height is correct');
                } else {
                    t.isDeeply(proxyBox, testBox, 'Proxy positioned correctly');
                }
                next();
            },
            { moveCursorBy : [
                [-20, 0]
            ] },
            function (next) {
                var proxyBox = gantt.el.down('.x-dd-drag-ghost .sch-gantt-item').getBox();
                if (Ext.isIE8) {
                    t.isApprox(proxyBox.left, testBox.left, 1, 'Left position is correct');
                    t.isApprox(proxyBox.top, testBox.top, 1, 'Top position is correct');
                    t.is(proxyBox.width, testBox.width, 'Width is correct');
                    t.is(proxyBox.height, testBox.height, 'Height is correct');
                } else {
                    t.isDeeply(proxyBox, testBox, 'Proxy positioned correctly');
                }
                next();
            },
            { action : 'mouseUp' }
        );
    });

    t.it('Should merge split task if pieces align after drop', function (t) {

        function setup() {

            return t.getGantt2({
                margin    : 30,
                height    : 180,
                startDate : new Date(2010, 0, 11),
                renderTo  : Ext.getBody(),
                taskStore : t.getTaskStore({
                    DATA : [
                        {
                            Id        : 1,
                            StartDate : new Date(2010, 0, 18),
                            leaf      : true,
                            Segments  : [
                                {
                                    Id        : 11,
                                    StartDate : "2010-01-18",
                                    Duration  : 1,
                                    Cls       : 'one'

                                },
                                {
                                    Id        : 12,
                                    StartDate : "2010-01-20",
                                    Duration  : 2,
                                    Cls       : 'two'
                                },
                                {
                                    Id        : 13,
                                    StartDate : "2010-01-25",
                                    Duration  : 5,
                                    Cls       : 'three'
                                }
                            ]
                        }
                    ]
                })
            });
        }

        t.it('drag middle piece far left, should be constrained', function (t) {
            gantt && gantt.destroy();
            gantt = setup();
            var task = gantt.getTaskStore().getNodeById(1);

            t.chain(
                { drag : '.two', to : '.one', dragOnly : true},

                function (next) {
                    var proxyLeft = t.$('.x-dd-drag-ghost .two').offset().left;
                    var firstSegmentRight = t.$('.one').offset().left + t.$('.one').width();
                    t.isApprox(proxyLeft, firstSegmentRight, Ext.isIE8 ? 3 : 2, 'Constrained ok');
                    next();
                },
                { action : 'mouseup' },
                { waitFor : function () {
                    return gantt.view.el.select('.sch-gantt-task-segment').getCount() === 2;
                } },
                function (next) {
                    var segments = task.getSegments();

                    t.is(segments.length, 2);

                    t.is(segments[0].getStartDate(), new Date(2010, 0, 18));
                    t.is(segments[0].getEndDate(), new Date(2010, 0, 21));
                    t.is(segments[1].getStartDate(), new Date(2010, 0, 25));
                    t.is(segments[1].getEndDate(), new Date(2010, 0, 30));
                }
            );
        });

        t.it('drag first piece far right, should be constrained', function (t) {
            gantt && gantt.destroy();
            gantt = setup();
            var task = gantt.getTaskStore().getNodeById(1);

            t.chain(
                { drag : '.two', to : '.three', dragOnly : true},

                function (next) {
                    var proxyRight = t.$('.x-dd-drag-ghost .two').offset().left + t.$('.x-dd-drag-ghost .two').width();
                    var lastSegmentLeft = t.$('.three').offset().left;
                    t.isApprox(proxyRight, lastSegmentLeft, 2, 'Constrained ok');
                    next();
                },
                { action : 'mouseup' },
                { waitFor : function () {
                    return gantt.view.el.select('.sch-gantt-task-segment').getCount() === 2;
                } },
                function (next) {
                    t.mouseUp();

                    var segments = task.getSegments();

                    t.is(segments.length, 2, 'proper segments number found');

                    t.is(segments[0].getStartDate(), new Date(2010, 0, 18), '#0 proper segment start');
                    t.is(segments[0].getEndDate(), new Date(2010, 0, 19), '#0 proper segment end');
                    t.is(segments[1].getStartDate(), new Date(2010, 0, 25), '#1 proper segment start');
                    t.is(segments[1].getEndDate(), new Date(2010, 1, 3), '#1 proper segment end');

                    next();
                },

                { drag : '.two', to : '.one'},

                { moveCursorBy : [[0, 40]] },

                function (next) {
                    var segments = task.getSegments();

                    t.is(segments, null);

                    t.selectorCountIs('.sch-gantt-task-segment', 0);
                    t.selectorCountIs('.sch-event-segmented', 0);
                }
            );
        });
    });
});
