StartTest(function(t) {
    t.expectGlobals('MyTask1', 'MySegment1');

    // costomized field names
    var taskFields                  = {
        baselinePercentDoneField    : 'MyBaselinePercentDone',
        baselineStartDateField      : 'MyBaselineStartDate',
        calendarIdField             : 'MyCalendarId',
        constraintDateField         : 'MyConstraintDate',
        constraintTypeField         : 'MyConstraintType',
        draggableField              : 'MyDraggable',
        durationField               : 'MyDuration',
        durationUnitField           : 'MyDurationUnit',
        effortField                 : 'MyEffort',
        effortUnitField             : 'MyEffortUnit',
        endDateField                : 'MyEndDate',
        manuallyScheduledField      : 'MyManuallyScheduled',
        nameField                   : 'MyName',
        noteField                   : 'MyNote',
        percentDoneField            : 'MyPercentDone',
        phantomIdField              : 'MyPhantomId',
        phantomParentIdField        : 'MyPhantomParentId',
        resizableField              : 'MyResizable',
        rollupField                 : 'MyRollup',
        schedulingModeField         : 'MySchedulingMode',
        segmentsField               : 'MySegments',
        startDateField              : 'MyStartDate'
    };

    // costomized segment field names
    var segmentFields               = {
        baselinePercentDoneField    : 'MyBaselinePercentDone2',
        baselineStartDateField      : 'MyBaselineStartDate2',
        calendarIdField             : 'MyCalendarId2',
        constraintDateField         : 'MyConstraintDate2',
        constraintTypeField         : 'MyConstraintType2',
        draggableField              : 'MyDraggable2',
        durationField               : 'MyDuration2',
        durationUnitField           : 'MyDurationUnit2',
        effortField                 : 'MyEffort2',
        effortUnitField             : 'MyEffortUnit2',
        endDateField                : 'MyEndDate2',
        manuallyScheduledField      : 'MyManuallyScheduled2',
        nameField                   : 'MyName2',
        noteField                   : 'MyNote2',
        percentDoneField            : 'MyPercentDone2',
        phantomIdField              : 'MyPhantomId2',
        phantomParentIdField        : 'MyPhantomParentId2',
        resizableField              : 'MyResizable2',
        rollupField                 : 'MyRollup2',
        schedulingModeField         : 'MySchedulingMode2',
        segmentsField               : 'MySegments2',
        startDateField              : 'MyStartDate2'
    };

    Ext.define('MySegment1', Ext.apply({
        extend              : 'Gnt.model.TaskSegment'
    }, segmentFields));

    Ext.define('MyTask1', Ext.apply({
        extend              : 'Gnt.model.Task',
        segmentClassName    : 'MySegment1'
    }, taskFields));

    var cleanup = function (setup) {
        setup.taskStore.destroy();
    };

    var setup   = function (config) {
        var taskStore   = new Gnt.data.TaskStore(Ext.apply({
            model       : 'MyTask1',
            root        : {
                children    : config.tasks
            }
        }, config.taskStore));

        return {
            taskStore       : taskStore,
            firstTask       : taskStore.getRootNode().firstChild,
            // gets a task by its identifier
            task            : function (id) { return taskStore.getNodeById(id); },
            // validates task segments to match the passed dates and offsets values
            checkSegments   : function (t, task, dates, offsets, text) {

                var list    = task.getSegments();

                t.it(text || 'Task #'+ task.getId() +' has correct segments list', function (t) {

                    t.is(list.length, dates.length, 'proper number of segments');

                    for (var i = 0, l = list.length; i < l; i++) {
                        var segment = list[i],
                            range   = dates[i],
                            offset  = offsets[i];

                        t.is(segment.getStartDate(),    range[0],   '#'+ i +' proper start date');
                        t.is(segment.getEndDate(),      range[1],   '#'+ i +' proper end date');

                        t.is(segment.getStartOffset(),  offset[0]*24*3600000,  '#'+ i +' proper start offset');
                        t.is(segment.getEndOffset(),    offset[1]*24*3600000,  '#'+ i +' proper end offset');

                        t.is(segment.getNextSegment(),  list[i + 1], '#'+ i +' proper next segment');
                        t.is(segment.getPrevSegment(),  list[i - 1], '#'+ i +' proper previous segment');
                    }
                });

            }
        };
    };


    t.it('Loads content of Splits field correctly', function (t) {
        var x       = setup({
            tasks   : [
                {
                    Id          : 2,
                    MyStartDate : new Date(2014, 4, 1),
                    MySegments  : [
                        {
                            Id           : 1,
                            MyStartDate2 : new Date(2014, 4, 1),
                            MyDuration2  : 1
                        },
                        {
                            Id           : 2,
                            MyStartDate2 : new Date(2014, 4, 5),
                            MyDuration2  : 2
                        },
                        {
                            Id           : 3,
                            MyStartDate2 : new Date(2014, 4, 8),
                            MyDuration2  : 2
                        }
                    ],
                    leaf        : true
                },
                {
                    Id          : 3,
                    expanded    : true,
                    MyStartDate : new Date(2014, 4, 1),
                    MyDuration  : 2,
                    children    : [
                        {
                            Id          : 32,
                            leaf        : true,
                            MyStartDate : new Date(2014, 4, 1),
                            MySegments  : [
                                {
                                    Id           : 1,
                                    MyStartDate2 : new Date(2014, 4, 1),
                                    MyDuration2  : 1
                                },
                                {
                                    Id           : 2,
                                    MyStartDate2 : new Date(2014, 4, 5),
                                    MyDuration2  : 2
                                },
                                {
                                    Id           : 3,
                                    MyStartDate2 : new Date(2014, 4, 5),
                                    MyDuration2  : 1
                                },
                                {
                                    Id           : 4,
                                    MyStartDate2 : new Date(2014, 4, 8),
                                    MyDuration2  : 1
                                },
                                {
                                    Id           : 5,
                                    MyStartDate2 : new Date(2014, 4, 9),
                                    MyDuration2  : 1
                                },
                                {
                                    Id           : 6,
                                    MyStartDate2 : new Date(2014, 4, 8),
                                    MyDuration2  : 2
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        var checkSegments   = x.checkSegments,
            task2           = x.task(2),
            task32          = x.task(32);

        checkSegments(t, task2, [
            [ task2.getStartDate(),     new Date(2014, 4, 2) ],
            [ new Date(2014, 4, 5),     new Date(2014, 4, 7) ],
            [ new Date(2014, 4, 8),     new Date(2014, 4, 10) ]
        ], [
            [ 0,    1 ],
            [ 2,    4 ],
            [ 5,    7 ]
        ]);

        checkSegments(t, task32, [
            [ task32.getStartDate(),    new Date(2014, 4, 2) ],
            [ new Date(2014, 4, 5),     new Date(2014, 4, 7) ],
            [ new Date(2014, 4, 8),     new Date(2014, 4, 10) ]
        ], [
            [ 0,    1 ],
            [ 2,    4 ],
            [ 5,    7 ]
        ]);

        cleanup(x);
    });


    t.it('Doesn`t split task in some cases', function (t) {

        var x = setup({
            tasks : [
                {
                    Id          : 1,
                    leaf        : true
                },
                {
                    Id          : 3,
                    expanded    : true,
                    MyStartDate : new Date(2014, 4, 1),
                    MyDuration  : 2,
                    children    : [
                        {
                            Id          : 31,
                            leaf        : true,
                            MyStartDate : new Date(2014, 4, 1),
                            MyDuration  : 3
                        },
                        {
                            Id          : 33,
                            leaf        : true,
                            MyStartDate : new Date(2014, 4, 1),
                            MyDuration  : 0
                        }
                    ]
                }
            ]
        });

        var task = x.task;

        task(1).split(new Date());

        t.notOk(task(1).getSegments(), 'no split was done for a not scheduled task');

        task(3).split(new Date());

        t.notOk(task(3).getSegments(), 'no split was done for a summary task');

        task(33).split(new Date(2014, 4, 2));

        t.notOk(task(33).getSegments(), 'no split was done for milestone');

        task(31).split();

        t.notOk(task(31).getSegments(), 'no split was done since no split date was provided');

        task(31).split(new Date(2014, 3, 30));

        t.notOk(task(31).getSegments(), 'no split was done since provided date was before task start');

        task(31).split(new Date(2014, 4, 6));

        t.notOk(task(31).getSegments(), 'no split was done since provided date was after task end');

        cleanup(x);
    });


    t.it('Splits solid task properly', function (t) {
        var x = setup({
            tasks : [{
                leaf           : true,
                MyStartDate    : new Date(2014, 4, 1),
                MyDuration     : 72,
                MyDurationUnit : 'h'
            }]
        });

        var task     = x.firstTask;

        t.notOk(task.getSegments(), 'no segments initially');
        t.notOk(task.isSegmented(), 'not segmented initially');

        var duration = task.getDuration();

        task.split(new Date(2014, 4, 2), 24);

        t.is(task.getDuration(), duration, 'kept duration');
        t.ok(task.isSegmented(), 'segmented now');
        t.ok(task.dirty, 'task got dirty');
        t.ok('MySegments' in task.modified, 'MySegments field got dirty');

        x.checkSegments(t, task, [
            [ new Date(2014, 4, 1), new Date(2014, 4, 2) ],
            [ new Date(2014, 4, 5), new Date(2014, 4, 7) ]
        ], [
            [ 0,    1 ],
            [ 2,    4 ]
        ]);

        t.is(task.getStartDate(),   new Date(2014, 4, 1), 'correct task start date');
        t.is(task.getEndDate(),     new Date(2014, 4, 7), 'correct task end date');

        cleanup(x);
    });


    t.it('Splits separated task properly', function (t) {

        var x = setup({
            tasks : [{
                leaf           : true,
                MyStartDate    : new Date(2014, 4, 1),
                MyDuration     : 72,
                MyDurationUnit : 'h',
                MySegments     : [
                    {
                        MyStartDate2 : new Date(2014, 4, 1),
                        MyDuration2  : 1
                    },
                    {
                        MyStartDate2 : new Date(2014, 4, 5),
                        MyDuration2  : 2
                    }
                ]
            }]
        });

        var checkSegments   = x.checkSegments,
            task            = x.firstTask;

        var duration    = task.getDuration();

        task.split(new Date(2014, 4, 6), 24);

        t.is(task.getDuration(), duration, 'kept duration');
        t.ok(task.isSegmented(), 'still segmented');
        t.ok(task.dirty, 'task got dirty');
        t.ok('MySegments' in task.modified, 'MySegments field got dirty');

        checkSegments(t, task, [
            [ new Date(2014, 4, 1), new Date(2014, 4, 2) ],
            [ new Date(2014, 4, 5), new Date(2014, 4, 6) ],
            [ new Date(2014, 4, 7), new Date(2014, 4, 8) ]
        ], [
            [ 0,    1 ],
            [ 2,    3 ],
            [ 4,    5 ]
        ]);

        t.is(task.getStartDate(),   new Date(2014, 4, 1), 'correct task start date');
        t.is(task.getEndDate(),     new Date(2014, 4, 8), 'correct task end date');

        cleanup(x);
    });


    t.it('forEachAvailabilityInterval takes split into account', function (t) {

        var x = setup({
            tasks : [{
                leaf        : true,
                MyStartDate : new Date(2014, 4, 1),
                MyDuration  : 3,
                MySegments  : [
                    {
                        MyStartDate2 : new Date(2014, 4, 1),
                        MyDuration2  : 1
                    },
                    {
                        MyStartDate2 : new Date(2014, 4, 5),
                        MyDuration2  : 1
                    },
                    {
                        MyStartDate2 : new Date(2014, 4, 7),
                        MyDuration2  : 1
                    }
                ]
            }]
        });

        var task    = x.firstTask;

        var result  = [];

        task.forEachAvailabilityInterval({
            startDate   : task.getStartDate(),
            endDate     : task.getEndDate(),
            fn          : function (from, to) {
                result.push([ from, to ]);
            }
        });

        t.isDeeply(result, [
            [ new Date(2014, 4, 1) - 0, new Date(2014, 4, 2) - 0 ],
            [ new Date(2014, 4, 5) - 0, new Date(2014, 4, 6) - 0 ],
            [ new Date(2014, 4, 7) - 0, new Date(2014, 4, 8) - 0 ]
        ], 'correct set of intervals was enumerated');

        cleanup(x);
    });


    t.it('Start date driven move works correctly', function (t) {

        var x               = setup({
                tasks : [{
                    leaf        : true,
                    MyStartDate : new Date(2014, 4, 1),
                    MySegments  : [
                        {
                            MyStartDate2 : new Date(2014, 4, 1),
                            MyDuration2  : 1
                        },
                        {
                            MyStartDate2 : new Date(2014, 4, 5),
                            MyDuration2  : 2
                        },
                        {
                            MyStartDate2 : new Date(2014, 4, 8),
                            MyDuration2  : 2
                        }
                    ]
                }]
            }),
            task            = x.firstTask,
            checkSegments   = x.checkSegments;

        task.setStartDate(new Date(2014, 4, 2), true, true);

        t.ok(task.dirty, 'task got dirty');
        t.ok('MySegments' in task.modified, 'MySegments field got dirty');

        checkSegments(t, task, [
            [ task.getStartDate(),      new Date(2014, 4, 3) ],
            [ new Date(2014, 4, 6),     new Date(2014, 4, 8) ],
            [ new Date(2014, 4, 9),     task.getEndDate() ]
        ], [
            [ 0,    1 ],
            [ 2,    4 ],
            [ 5,    7 ]
        ], 'reacted on start date move (keeping duration)');

        cleanup(x);
    });


    t.it('End date driven move works correctly', function (t) {

        var x = setup({
            tasks : [{
                leaf        : true,
                MyStartDate : new Date(2014, 4, 2),
                MySegments  : [
                    {
                        MyStartDate2 : new Date(2014, 4, 2),
                        MyDuration2  : 1
                    },
                    {
                        MyStartDate2 : new Date(2014, 4, 6),
                        MyDuration2  : 2
                    },
                    {
                        MyStartDate2 : new Date(2014, 4, 9),
                        MyDuration2  : 2
                    }
                ]
            }]
        });

        var task            = x.firstTask,
            checkSegments   = x.checkSegments;

        task.setEndDate(new Date(2014, 4, 10), true, true);

        t.is(task.getStartDate(), new Date(2014, 4, 1), 'correct start date');
        t.ok(task.dirty, 'task got dirty');
        t.ok('MySegments' in task.modified, 'MySegments field got dirty');

        checkSegments(t, task, [
            [ task.getStartDate(),      new Date(2014, 4, 2) ],
            [ new Date(2014, 4, 5),     new Date(2014, 4, 7) ],
            [ new Date(2014, 4, 8),     task.getEndDate() ]
        ], [
            [ 0,    1 ],
            [ 2,    4 ],
            [ 5,    7 ]
        ], 'reacted on end date move (keeping duration)');

        cleanup(x);
    });


    t.it('Start date driven resize works correctly', function (t) {

        var x = setup({
            tasks : [{
                leaf        : true,
                MyStartDate : new Date(2014, 4, 1),
                MySegments  : [
                    {
                        MyStartDate2 : new Date(2014, 4, 1),
                        MyDuration2  : 1
                    },
                    {
                        MyStartDate2 : new Date(2014, 4, 5),
                        MyDuration2  : 2
                    },
                    {
                        MyStartDate2 : new Date(2014, 4, 8),
                        MyDuration2  : 2
                    }
                ]
            }]
        });

        var task    = x.firstTask;

        task.setStartDate(new Date(2014, 4, 3), false, true);

        t.is(task.getDuration(), 4, 'kept correct duration');
        t.ok(task.dirty, 'task got dirty');
        t.ok('MySegments' in task.modified, 'MySegments field got dirty');

        x.checkSegments(t, task, [
            [ task.getStartDate(),      new Date(2014, 4, 6) ],
            [ new Date(2014, 4, 7),     task.getEndDate() ]
        ], [
            [ 0,    1 ],
            [ 2,    5 ]
        ], 'reacted on start date move (resizing)');

        cleanup(x);
    });


    t.it('Both start and end date resize works correctly', function (t) {

        var x = setup({
            tasks : [{
                leaf        : true,
                MyStartDate : new Date(2014, 4, 5),
                MySegments  : [
                    {
                        MyStartDate2 : new Date(2014, 4, 5),
                        MyDuration2  : 1
                    },
                    {
                        MyStartDate2 : new Date(2014, 4, 7),
                        MyDuration2  : 3
                    }
                ]
            }]
        });

        var task    = x.firstTask;

        task.setStartEndDate(new Date(2014, 4, 1), new Date(2014, 4, 9), true);

        t.ok(task.dirty, 'task got dirty');
        t.ok('MySegments' in task.modified, 'MySegments field got dirty');

        x.checkSegments(t, task, [
            [ task.getStartDate(),      new Date(2014, 4, 2) ],
            [ new Date(2014, 4, 5),     task.getEndDate() ]
        ], [
            [ 0,    1 ],
            [ 2,    6 ]
        ], 'reacted on start and end date change (resizing)');

        cleanup(x);
    });


    t.it('setSegments() calculates task duration and aligns task based on segments', function (t) {

        var x = setup({
            tasks : [{
                leaf        : true,
                MyStartDate : new Date(2014, 4, 1),
                MySegments  : [
                    {
                        MyStartDate2 : new Date(2014, 4, 1),
                        MyDuration2  : 1
                    },
                    {
                        MyStartDate2 : new Date(2014, 4, 5),
                        MyDuration2  : 4
                    }
                ]
            }]
        });

        var task    = x.firstTask;

        task.setSegments([
            {
                MyStartDate2 : new Date(2014, 4, 1),
                MyDuration2  : 1
            },
            {
                MyStartDate2 : new Date(2014, 4, 5),
                MyDuration2  : 2
            },
            {
                MyStartDate2 : new Date(2014, 4, 8),
                MyDuration2  : 2
            }
        ]);

        t.is(task.getEndDate(), new Date(2014, 4, 10), 'task end date was aligned to the last segment end');
        t.ok(task.dirty, 'task got dirty');
        t.ok('MySegments' in task.modified, 'MySegments field got dirty');

        x.checkSegments(t, task, [
            [ task.getStartDate(), new Date(2014, 4, 2) ],
            [ new Date(2014, 4, 5), new Date(2014, 4, 7) ],
            [ new Date(2014, 4, 8), task.getEndDate() ]
        ], [
            [ 0,    1 ],
            [ 2,    4 ],
            [ 5,    7 ]
        ]);

        cleanup(x);
    });


    t.it('getSegment() returns individual segment', function (t) {

        var x = setup({
            tasks : [{
                leaf        : true,
                MyStartDate : new Date(2014, 4, 1),
                MySegments  : [
                    {
                        MyStartDate2 : new Date(2014, 4, 1),
                        MyDuration2  : 1
                    },
                    {
                        MyStartDate2 : new Date(2014, 4, 5),
                        MyDuration2  : 2
                    },
                    {
                        MyStartDate2 : new Date(2014, 4, 8),
                        MyDuration2  : 2
                    }
                ]
            }]
        });

        var task    = x.firstTask;

        t.ok(task.getSegment(0), '#0 segment presented');
        t.ok(task.getSegment(1), '#1 segment presented');
        t.ok(task.getSegment(2), '#2 segment presented');

        t.isDeeply([ task.getSegment(0), task.getSegment(1), task.getSegment(2) ], task.getSegments(), 'correct results of getSegments() and getSegment() calls');

        cleanup(x);
    });


    t.it('Last segment end date resize causes master task recalculation', function (t) {

        var x = setup({
            tasks : [{
                leaf        : true,
                MyStartDate : new Date(2014, 4, 1),
                MySegments  : [
                    {
                        MyStartDate2 : new Date(2014, 4, 1),
                        MyDuration2  : 1
                    },
                    {
                        MyStartDate2 : new Date(2014, 4, 5),
                        MyDuration2  : 2
                    },
                    {
                        MyStartDate2 : new Date(2014, 4, 8),
                        MyDuration2  : 2
                    }
                ]
            }]
        });

        var task    = x.firstTask;

        task.getSegment(2).setEndDate(new Date(2014, 4, 13), false);

        t.is(task.getEndDate(), new Date(2014, 4, 13), 'task end date was aligned to the last segment end');
        t.is(task.getDuration('d'), 6, 'duration correct');

        x.checkSegments(t, task, [
            [ task.getStartDate(),  new Date(2014, 4, 2) ],
            [ new Date(2014, 4, 5), new Date(2014, 4, 7) ],
            [ new Date(2014, 4, 8), task.getEndDate() ]
        ], [
            [ 0,    1 ],
            [ 2,    4 ],
            [ 5,    8 ]
        ]);

        cleanup(x);
    });

    t.it('Segments ## 0,1,3. Segment #1 resize causes its merge with segment #2', function (t) {

        var x = setup({
            tasks : [{
                leaf        : true,
                MyStartDate   : new Date(2014, 4, 1),
                MySegments    : [
                    {
                        MyStartDate2  : new Date(2014, 4, 1),
                        MyDuration2   : 1
                    },
                    {
                        MyStartDate2  : new Date(2014, 4, 5),
                        MyDuration2   : 2
                    },
                    {
                        MyStartDate2  : new Date(2014, 4, 8),
                        MyDuration2   : 3
                    }
                ]
            }]
        });

        var task    = x.firstTask;

        task.getSegment(1).setEndDate(new Date(2014, 4, 8), false);

        t.is(task.getEndDate(), new Date(2014, 4, 13), 'task end date was aligned to the last segment end');
        t.is(task.getDuration('d'), 7, 'duration correct');
        t.ok(task.dirty, 'task got dirty');
        t.ok('MySegments' in task.modified, 'MySegments field got dirty');

        x.checkSegments(t, task, [
            [ task.getStartDate(), new Date(2014, 4, 2) ],
            [ new Date(2014, 4, 5), task.getEndDate() ]
        ], [
            [ 0,    1 ],
            [ 2,    8 ]
        ]);

        cleanup(x);
    });

    t.it('Segments ## 0,1. Segment #0 resize causes its merge with segment #1', function (t) {

        var x = setup({
            tasks : [{
                leaf        : true,
                MyStartDate : new Date(2014, 4, 1),
                MySegments  : [
                    {
                        MyStartDate2 : new Date(2014, 4, 1),
                        MyDuration2  : 1
                    },
                    {
                        MyStartDate2 : new Date(2014, 4, 5),
                        MyDuration2  : 6
                    }
                ]
            }]
        });

        var task    = x.firstTask;

        task.getSegment(0).setEndDate(new Date(2014, 4, 5), false);

        t.is(task.getEndDate(), new Date(2014, 4, 13), 'task end date was aligned to the last segment end');
        t.is(task.getDuration('d'), 8, 'duration correct');
        t.ok(task.dirty, 'task got dirty');
        t.ok('MySegments' in task.modified, 'MySegments field got dirty');

        t.notOk(task.getSegments(), 'no segments');

        cleanup(x);
    });


    t.it('Enlarging of master task duration causes last segment duration grow', function (t) {

        var x = setup({
            tasks : [{
                leaf        : true,
                MyStartDate : new Date(2014, 4, 1),
                MySegments  : [
                    {
                        MyStartDate2 : new Date(2014, 4, 1),
                        MyDuration2  : 1
                    },
                    {
                        MyStartDate2 : new Date(2014, 4, 5),
                        MyDuration2  : 2
                    },
                    {
                        MyStartDate2 : new Date(2014, 4, 8),
                        MyDuration2  : 2
                    }
                ]
            }]
        });

        var task    = x.firstTask;

        task.setDuration(6);

        t.is(task.getEndDate(), new Date(2014, 4, 13), 'proper task end date');
        t.ok(task.dirty, 'task got dirty');
        t.ok('MySegments' in task.modified, 'MySegments field got dirty');

        x.checkSegments(t, task, [
            [ task.getStartDate(),  new Date(2014, 4, 2) ],
            [ new Date(2014, 4, 5),     new Date(2014, 4, 7) ],
            [ new Date(2014, 4, 8),     task.getEndDate() ]
        ], [
            [ 0,    1 ],
            [ 2,    4 ],
            [ 5,    8 ]
        ]);

        cleanup(x);
    });

    t.it('Reducing of master task duration causes last segment duration reducing', function (t) {

        var x = setup({
            tasks : [{
                leaf        : true,
                MyStartDate : new Date(2014, 4, 1),
                MySegments  : [
                    {
                        MyStartDate2  : new Date(2014, 4, 1),
                        MyDuration2   : 1
                    },
                    {
                        MyStartDate2  : new Date(2014, 4, 5),
                        MyDuration2   : 2
                    },
                    {
                        MyStartDate2  : new Date(2014, 4, 8),
                        MyDuration2   : 2
                    }
                ]
            }]
        });

        var task    = x.firstTask;

        task.setDuration(4);

        t.is(task.getEndDate(), new Date(2014, 4, 9), 'proper task end date');
        t.ok(task.dirty, 'task got dirty');
        t.ok('MySegments' in task.modified, 'MySegments field got dirty');

        x.checkSegments(t, task, [
            [ task.getStartDate(),  new Date(2014, 4, 2) ],
            [ new Date(2014, 4, 5),     new Date(2014, 4, 7) ],
            [ new Date(2014, 4, 8),     task.getEndDate() ]
        ], [
            [ 0,    1 ],
            [ 2,    4 ],
            [ 5,    6 ]
        ]);

        cleanup(x);
    });

    t.it('#0,1,2: merge(1,2) works as expected', function (t) {

        var x = setup({
            tasks : [{
                leaf        : true,
                MyStartDate : new Date(2014, 4, 1),
                MySegments  : [
                    {
                        MyStartDate2  : new Date(2014, 4, 1),
                        MyDuration2   : 1
                    },
                    {
                        MyStartDate2  : new Date(2014, 4, 5),
                        MyDuration2   : 2
                    },
                    {
                        MyStartDate2  : new Date(2014, 4, 8),
                        MyDuration2   : 1
                    }
                ]
            }]
        });

        var task    = x.firstTask;

        task.merge( task.getSegment(1), task.getSegment(2) );

        t.is(task.getStartDate(), new Date(2014, 4, 1), 'proper task start date');
        t.is(task.getEndDate(), new Date(2014, 4, 9), 'proper task end date');
        t.ok(task.dirty, 'task got dirty');
        t.ok('MySegments' in task.modified, 'MySegments field got dirty');

        x.checkSegments(t, task, [
            [ task.getStartDate(),  new Date(2014, 4, 2) ],
            [ new Date(2014, 4, 5),     task.getEndDate() ]
        ], [
            [ 0,    1 ],
            [ 2,    6 ]
        ]);

        cleanup(x);
    });

    t.it('#0,1: merge(0,1) works as expected', function (t) {

        var x = setup({
            tasks : [{
                leaf        : true,
                MyStartDate : new Date(2014, 4, 1),
                MySegments  : [
                    {
                        MyStartDate2  : new Date(2014, 4, 1),
                        MyDuration2   : 1
                    },
                    {
                        MyStartDate2  : new Date(2014, 4, 5),
                        MyDuration2   : 4
                    }
                ]
            }]
        });

        var task    = x.firstTask;

        task.merge( task.getSegment(1), task.getSegment(0) );

        t.is(task.getStartDate(), new Date(2014, 4, 1), 'proper task start date');
        t.is(task.getEndDate(), new Date(2014, 4, 9), 'proper task end date');
        t.notOk(task.isSegmented(), 'task is not segmented any more');
        t.ok(task.dirty, 'task got dirty');
        t.ok('MySegments' in task.modified, 'MySegments field got dirty');

        cleanup(x);
    });


    t.it('setSegments(null) call works correctly', function (t) {

        var x = setup({
            tasks : [{
                leaf        : true,
                MyStartDate : new Date(2014, 4, 1),
                MyDuration  : 3,
                MySegments  : [
                    {
                        MyStartDate2 : new Date(2014, 4, 1),
                        MyDuration2  : 1
                    },
                    {
                        MyStartDate2 : new Date(2014, 4, 5),
                        MyDuration2  : 2
                    }
                ]
            }]
        });

        var task            = x.firstTask;

        task.setSegments(null);

        t.notOk(task.isSegmented(), 'is not segmented any more');
        t.ok(task.dirty, 'task got dirty');
        t.ok('MySegments' in task.modified, 'MySegments field got dirty');

        cleanup(x);
    });


    t.it('segments should be reverted correctly after model.reject()', function (t) {

        var x       = setup({
            tasks   : [{
                Id          : 2,
                MyStartDate : new Date(2014, 4, 1),
                leaf        : true,
                MySegments  : [
                    {
                        Id           : 1,
                        MyStartDate2 : new Date(2014, 4, 1),
                        MyDuration2  : 1
                    },
                    {
                        Id           : 2,
                        MyStartDate2 : new Date(2014, 4, 5),
                        MyDuration2  : 2
                    },
                    {
                        Id           : 3,
                        MyStartDate2 : new Date(2014, 4, 8),
                        MyDuration2  : 2
                    }
                ]
            }]
        });

        var task                = x.firstTask;
        var originalSegments    = task.getSegments().slice();

        t.is(originalSegments.length, 3, '3 segments');

        task.getSegment(1).setDuration(3);

        t.is(task.getSegment(1).getStartDate(), new Date(2014, 4, 5), 'Start date ok after merge');
        t.is(task.getSegment(1).getEndDate(), new Date(2014, 4, 10), 'End date ok after merge');

        t.is(task.getSegments().length, 2, '2 segments after merge');
        t.ok(task.dirty, 'Task dirty after segment changed');

        task.modified.MySegments[0].data.PhantomId = originalSegments[0].data.PhantomId = null;
        task.modified.MySegments[1].data.PhantomId = originalSegments[1].data.PhantomId = null;

        t.isDeeply(task.modified.MySegments[0].data, originalSegments[0].data, 'A copy of segment #0 kept in "modified" hash');
        t.isDeeply(task.modified.MySegments[1].data, originalSegments[1].data, 'A copy of segment #1 kept in "modified" hash');

        t.it('Should handle reject properly for Segments', function(t) {

            task.reject();

            t.is(task.getSegments().length, 3, '3 segments after reject');

            t.is(task.getSegment(0).getStartDate(), new Date(2014, 4, 1),   '#0 Start date ok after reject');
            t.is(task.getSegment(0).getEndDate(), new Date(2014, 4, 2),     '#0 End date ok after reject');

            t.is(task.getSegment(1).getStartDate(), new Date(2014, 4, 5),   '#1 Start date ok after reject');
            t.is(task.getSegment(1).getEndDate(), new Date(2014, 4, 7),     '#1 End date ok after reject');

            t.is(task.getSegment(2).getStartDate(), new Date(2014, 4, 8),   '#2 Start date ok after reject');
            t.is(task.getSegment(2).getEndDate(), new Date(2014, 4, 10),    '#2 End date ok after reject');

            cleanup(x);
        });
    });

    t.it('Splits segment in the middle properly', function (t) {

        var x   = setup({
            tasks : [{
                leaf        : true,
                MyStartDate : new Date(2014, 4, 1),
                MySegments  : [
                    {
                        MyStartDate2  : new Date(2014, 4, 1),
                        MyDuration2   : 1
                    },
                    {
                        MyStartDate2  : new Date(2014, 4, 5),
                        MyDuration2   : 2
                    },
                    {
                        MyStartDate2  : new Date(2014, 4, 8),
                        MyDuration2   : 2
                    }
                ]
            }]
        });

        x.firstTask.split(new Date(2014, 4, 6));

        x.checkSegments(t, x.firstTask,
            [
                [ new Date(2014, 4, 1), new Date(2014, 4, 2) ],
                [ new Date(2014, 4, 5), new Date(2014, 4, 6) ],
                [ new Date(2014, 4, 7), new Date(2014, 4, 8) ],
                [ new Date(2014, 4, 9), new Date(2014, 4, 13) ]
            ],
            [
                [ 0, 1 ],
                [ 2, 3 ],
                [ 4, 5 ],
                [ 6, 8 ]
            ]
        );

        cleanup(x);
    });

    t.it('When indenting, we should clear segments since parent tasks cannot be split', function (t) {
        var task    = t.getAllStoresDataSet(
            [
                {
                    Id        : 1,
                    leaf      : true,
                    StartDate : new Date(2014, 4, 1),
                    Segments  : [
                        {
                            Id        : 11,
                            StartDate : new Date(2014, 4, 1),
                            Duration  : 1
                        },
                        {
                            Id        : 22,
                            StartDate : new Date(2014, 4, 5),
                            Duration  : 2
                        }
                    ]
                },
                {
                    Id        : 2,
                    leaf      : true,
                    StartDate : new Date(2014, 4, 1)
                }
            ]
        ).task;

        task(2).indent();

        t.is(task(1).getSegments(), null, 'Segments cleared after indent');
    });


    // #1902
    t.it('Splits effort driven task properly', function (t) {

        var x   = setup({
            tasks : [{
                leaf             : true,
                Id               : 1,
                MyStartDate      : new Date(2014, 4, 5),
                MyEffort         : 5,
                MyEffortUnit     : 'd',
                MySchedulingMode : 'EffortDriven'
            }],
            taskStore : {
                resourceStore   : t.getResourceStore({ data : [{ Id : 'r1' }] }),
                assignmentStore : t.getAssignmentStore({ data : [{ ResourceId : 'r1', TaskId : 1, Units : 100 }] })
            }
        });

        x.firstTask.split(new Date(2014, 4, 6));

        x.checkSegments(t, x.firstTask,
            [
                [ new Date(2014, 4, 5), new Date(2014, 4, 6) ],
                [ new Date(2014, 4, 7), new Date(2014, 4, 13) ]
            ],
            [
                [ 0, 1 ],
                [ 2, 6 ]
            ]
        );

        cleanup(x);
    });

    // #1586
    t.it('When split date falls to a segment start the segment gets pushed by split duration length', function (t) {

        var x   = setup({
            tasks : [{
                leaf             : true,
                Id               : 1,
                MyStartDate      : new Date(2014, 4, 5),
                MySegments  : [
                    {
                        Id           : 1,
                        MyStartDate2 : new Date(2014, 4, 5),
                        MyDuration2  : 1
                    },
                    {
                        Id           : 2,
                        MyStartDate2 : new Date(2014, 4, 7),
                        MyDuration2  : 1
                    },
                    {
                        Id           : 3,
                        MyStartDate2 : new Date(2014, 4, 9),
                        MyDuration2  : 1
                    }
                ]
            }]
        });

        x.firstTask.split(new Date(2014, 4, 7), 1, 'd');

        x.checkSegments(t, x.firstTask,
            [
                [ new Date(2014, 4, 5), new Date(2014, 4, 6) ],
                [ new Date(2014, 4, 8), new Date(2014, 4, 9) ],
                [ new Date(2014, 4, 12), new Date(2014, 4, 13) ]
            ],
            [
                [ 0, 1 ],
                [ 3, 4 ],
                [ 5, 6 ]
            ]
        );

        cleanup(x);
    });
});
