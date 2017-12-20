StartTest(function (t) {

    var prepare = function (config) {

        config  = config || {};

        t.getBusinessTimeCalendar(Ext.apply({
            calendarId  : 'custom',
            data        : [
                {
                    Date            : new Date(2010, 1, 11),
                    Availability    : [ '08:00-12:00' ]
                },
                {
                    Date            : new Date(2010, 1, 12),
                    Availability    : [ '08:00-09:00' ]
                }
            ]
        }, config.calendar));

        var resourceStore   = t.getResourceStore(Ext.apply({
            data: [
                { Id: 'r1', Name: 'Mike', CalendarId: 'custom' }
            ]
        }, config.resourceStore));

        var assignmentStore = t.getAssignmentStore(Ext.apply({
            resourceStore   : resourceStore,
            data            : [
                { Id: 117, ResourceId: 'r1', TaskId : 117, Units : 50 }
            ]
        }, config.assignmentStore));

        var taskStore       = t.getTaskStore(Ext.apply({
            cascadeChanges  : false,
            resourceStore   : resourceStore,
            assignmentStore : assignmentStore,
            DATA            : [
                {
                    leaf            : true,
                    Id              : 117,
                    StartDate       : '2010-02-03T00:00:00',
                    Name            : 'New task 1',
                    Duration        : 6,
                    SchedulingMode  : 'FixedDuration'
                }
            ]
        }, config.taskStore));

        return new Gnt.panel.ResourceHistogram(Ext.apply({
            taskStore           : taskStore,
            resourceStore       : resourceStore,
            assignmentStore     : assignmentStore,
            startDate           : new Date(2010, 1, 1),
            endDate             : new Date(2010, 1, 22),
            rowHeight           : 50,
            scaleMin            : 0,
            scaleMax            : 8,
            scaleStep           : 5,
            scaleLabelStep      : 5,
            width               : 800,
            height              : 400,
            renderTo            : Ext.getBody()
        }, config.histogram));
    };

    t.it('Should not recalculate allocation on zoomIn, recalculate only for missing spans on zoomOut', function (t) {
        var histogram   = prepare();

        var resource            = histogram.resourceStore.getAt(0);
        var invokeCounter       = 0;
        var getAllocationInfo   = resource.getAllocationInfo;

        var startDate   = histogram.timeAxis.getStart();
        var endDate     = histogram.timeAxis.getEnd();

        var view        = histogram.getView().normalView;

        t.chain(
            { waitForRowsVisible : histogram },

            t.getSubTest('When the new timespan is inside the old one we do not calculate allocation', function (t) {

                resource.getAllocationInfo = function () {
                    invokeCounter++;
                    return getAllocationInfo.apply(this, arguments);
                };

                var renderBars = view.renderBars;

                view.renderBars = function (bars) {
                    t.is(bars[0].startDate, new Date(2010, 1, 8), 'Allocation start is correct');
                    t.is(bars[bars.length - 1].endDate, new Date(2010, 1, 10, 17), 'Allocation end is correct');

                    return renderBars.apply(this, arguments);
                };

                var renderLimitLines = view.renderLimitLines;

                view.renderLimitLines = function (maxBars) {
                    t.is(maxBars[0].startDate, new Date(2010, 1, 8), 'First max bar has correct start');
                    t.is(maxBars[maxBars.length - 1].endDate, new Date(2010, 1, 15), 'Last max bar has correct end');
                    t.isLess(maxBars.length, histogram.allocationData.r1.maxBars.length, 'Max bars array picked from cache');

                    return renderLimitLines.apply(this, arguments);
                };

                // set subset span as new span, cache shouldn't be recalculated
                histogram.setTimeSpan(new Date(2010, 1, 8), new Date(2010, 1, 15));

                t.notOk(invokeCounter, 'Allocation was not calculated');

                // restore original methods
                view.renderBars         = renderBars;
                view.renderLimitLines   = renderLimitLines;
            }),

            t.getSubTest('We calculate allocation for missing periods only', function (t) {

                resource.getAllocationInfo = function (options) {
                    invokeCounter++;

                    if (invokeCounter === 1) {
                        t.is(options.endDate, startDate, 'Allocation is calculated for missing left span');
                    } else {
                        t.is(options.startDate, endDate, 'Allocation is calculated for missing right span');
                    }

                    return getAllocationInfo.apply(this, arguments);
                };

                var renderBars = view.renderBars;

                view.renderBars = function (bars) {
                    t.is(bars[0].startDate, new Date(2010, 1, 3, 8), 'Allocation start is correct');
                    t.is(bars[0].endDate, new Date(2010, 1, 6), 'Allocation end is correct');

                    return renderBars.apply(this, arguments);
                };

                var renderLimitLines = view.renderLimitLines;

                view.renderLimitLines = function (maxBars) {
                    t.is(maxBars[0].endDate, new Date(2010, 0, 30), 'First max bar has correct end');
                    t.is(maxBars[maxBars.length - 1].startDate, new Date(2010, 1, 27), 'Last max bar has correct start');
                    t.is(maxBars.length, histogram.allocationData.r1.maxBars.length, 'Max bars array length equals total cache length');

                    return renderLimitLines.apply(this, arguments);
                };

                // set new span, that require cache to be calculated for new spans to the right/left
                histogram.setTimeSpan(new Date(2010, 0, 25), new Date(2010, 2, 1));

                // restore original methods
                resource.getAllocationInfo  = getAllocationInfo;
                view.renderBars             = renderBars;
                view.renderLimitLines       = renderLimitLines;

                var lastLine = view.body.down('.gnt-resourcehistogram-limitline-top:last-child');

                t.is(lastLine.getHeight(), 31, 'Last line height is correct');

                t.is(parseInt(lastLine.getStyle('left'), 10), view.getXFromDate(new Date(2010, 1, 27), true), 'Last line position is correct');

                t.is(invokeCounter, 2, 'Allocation was calculated called twice');

                histogram.destroy();
            })
        );
    });

    t.it('Allocation bars should be rendered correctly, when cache is extending', function (t) {

        var histogram   = prepare({
            calendar    : {
                 defaultAvailability    : [ '00:00-24:00' ]
            },
            histogram   : {
                startDate   : new Date(2010, 1, 8),
                endDate     : new Date(2010, 1, 15)
            }
        });

        var view = histogram.normalGrid.view;

        t.waitForRowsVisible(histogram, function () {
            var oldWidth = view.el.down('.gnt-resourcehistogram-bar').getWidth();

            histogram.setTimeSpan(new Date(2010, 1, 1), new Date(2010, 1, 22));

            var newWidth = view.el.down('.gnt-resourcehistogram-bar').getWidth();

            t.is(oldWidth, newWidth, 'Allocation bar width is correct');

            histogram.destroy();
        });

    });

    t.it('Histogram is able to suspend its store listeners', function (t) {

        var calendar = new Gnt.data.calendar.BusinessTime({
            calendarId  : 'calendar1',
            proxy       : {
                type    : 'memory',
                data    : [
                    { Date : new Date(2010, 1, 11) }
                ]
            }
        });

        var resourceStore   = new Gnt.data.ResourceStore({
            proxy   : {
                type    : 'memory',
                data    : [
                    { Id: 'r1', Name: 'Mike', CalendarId: 'calendar1' },
                    { Id: 'r2', Name: 'Alex' },
                    { Id: 'r3', Name: 'Ben' }
                ]
            }
        });

        var assignmentStore = new Gnt.data.AssignmentStore({
            resourceStore   : resourceStore,
            proxy           : {
                type    : 'memory',
                data    : [
                    { Id: 1, ResourceId: 'r1', TaskId : 1, Units : 50 },
                    { Id: 2, ResourceId: 'r2', TaskId : 2, Units : 50 },
                    { Id: 3, ResourceId: 'r3', TaskId : 3, Units : 50 }
                ]
            }
        });

        var taskStore       = new Gnt.data.TaskStore({
            calendar        : calendar,
            resourceStore   : resourceStore,
            assignmentStore : assignmentStore,
            proxy           : {
                type    : 'memory',
                data    : [
                    {
                        leaf            : true,
                        Id              : 1,
                        StartDate       : '2010-02-03T00:00:00',
                        Duration        : 6
                    },
                    {
                        leaf            : true,
                        Id              : 2,
                        StartDate       : '2010-02-03T00:00:00',
                        Duration        : 6
                    },
                    {
                        leaf            : true,
                        Id              : 3,
                        StartDate       : '2010-02-03T00:00:00',
                        Duration        : 6
                    }
                ]
            }
        });

        var histogram = new Gnt.panel.ResourceHistogram({
            resourceStore   : resourceStore,
            assignmentStore : assignmentStore,
            taskStore       : taskStore,
            startDate       : new Date(2010, 1, 1),
            endDate         : new Date(2010, 1, 13),
            width           : 800,
            height          : 400,
            renderTo        : Ext.getBody()
        });

        histogram.suspendStoreListeners();

        t.methodIsntCalled('processAllocationData', Gnt.panel.ResourceHistogram, 'No calculations while listeners suspended');

        calendar.load();
        resourceStore.load();
        assignmentStore.load();
        taskStore.load();

        histogram.resumeStoreListeners();

        histogram.destroy();
    });

    t.it('Histogram is able to resume its store listeners with refresh', function (t) {

        var calendar = new Gnt.data.calendar.BusinessTime({
            calendarId  : 'calendar1',
            proxy       : {
                type    : 'memory',
                data    : [
                    { Date : new Date(2010, 1, 11) }
                ]
            }
        });

        var resourceStore   = new Gnt.data.ResourceStore({
            proxy   : {
                type    : 'memory',
                data    : [
                    { Id: 'r1', Name: 'Mike', CalendarId: 'calendar1' },
                    { Id: 'r2', Name: 'Alex' },
                    { Id: 'r3', Name: 'Ben' }
                ]
            }
        });

        var assignmentStore = new Gnt.data.AssignmentStore({
            resourceStore   : resourceStore,
            proxy           : {
                type    : 'memory',
                data    : [
                    { Id: 1, ResourceId: 'r1', TaskId : 1, Units : 50 },
                    { Id: 2, ResourceId: 'r2', TaskId : 2, Units : 50 },
                    { Id: 3, ResourceId: 'r3', TaskId : 3, Units : 50 }
                ]
            }
        });

        var taskStore       = new Gnt.data.TaskStore({
            calendar        : calendar,
            resourceStore   : resourceStore,
            assignmentStore : assignmentStore,
            proxy           : {
                type    : 'memory',
                data    : [
                    {
                        leaf            : true,
                        Id              : 1,
                        StartDate       : '2010-02-03T00:00:00',
                        Duration        : 6
                    },
                    {
                        leaf            : true,
                        Id              : 2,
                        StartDate       : '2010-02-03T00:00:00',
                        Duration        : 6
                    },
                    {
                        leaf            : true,
                        Id              : 3,
                        StartDate       : '2010-02-03T00:00:00',
                        Duration        : 6
                    }
                ]
            }
        });

        var histogram = new Gnt.panel.ResourceHistogram({
            resourceStore   : resourceStore,
            assignmentStore : assignmentStore,
            taskStore       : taskStore,
            startDate       : new Date(2010, 1, 1),
            endDate         : new Date(2010, 1, 13),
            width           : 800,
            height          : 400,
            renderTo        : Ext.getBody()
        });

        histogram.suspendStoreListeners();

        t.methodIsCalledNTimes('processAllocationData', Gnt.panel.ResourceHistogram, 3, 'called one time for each resource');

        calendar.load();
        resourceStore.load();
        assignmentStore.load();
        taskStore.load();

        histogram.resumeStoreListeners(true);

        histogram.destroy();
    });

    t.it('Should limit cache', function (t) {

        var getTasks = function (n) {
            var data = [];

            for (var i = 0; i < n; i++) {
                data.push({ leaf : true, Id : i + 1, StartDate : Ext.Date.add(new Date(2010, 0, 25, 8), 'd', i + Math.floor(i / 5) * 2), Duration : 8, DurationUnit : 'h' });
            }

            return data;
        };

        var getAssignments = function (n) {
            var data = [];

            for (var i = 0; i < n; i++) {
                data.push({ Id: i + 1, ResourceId: 'r1', TaskId : i + 1 });
            }

            return data;
        };

        var n = 30;

        var histogram       = prepare({
            calendar        : {
                calendarId  : 'mycal',
                data        : []
            },
            resourceStore   : {
                data        : [
                    { Id: 'r1', Name: 'Mike', CalendarId : 'mycal' }
                ]
            },
            taskStore       : {
                DATA        : getTasks(n)
            },
            assignmentStore : {
                data        : getAssignments(n)
            },
            histogram       : {
                cacheLimitDurationUnit  : 'w',
                cacheLimitDuration      : 1,

                startDate   : new Date(2010, 1, 8),
                endDate     : new Date(2010, 1, 22)
            }
        });

        t.waitForRowsVisible(histogram, function () {
            var allocData = histogram.allocationData.r1;

            t.is(allocData.maxBars.length, 4, 'Correct amount of cached max bars');
            t.is(allocData.bars.length, 10, 'Correct amount of cached allocation bars');

            t.diag('Increase timespan to 25/01/2010 - 08/03/2010');
            histogram.setTimeSpan(new Date(2010, 0, 25), new Date(2010, 2, 8));

            t.is(allocData.maxBars.length, 12, 'Correct amount of cached max bars');
            t.is(allocData.bars.length, 30, 'Correct amount of cached allocation bars');
            t.is(allocData.cacheStart, new Date(2010, 0, 25), 'Cache start is correct');
            t.is(allocData.cacheEnd, new Date(2010, 2, 8), 'Cache end is correct');

            t.diag('Reduce timespan to 01/02/2010 - 01/03/2010');
            histogram.setTimeSpan(new Date(2010, 1, 1), new Date(2010, 2, 1));

            t.is(allocData.maxBars.length, 12, 'Correct amount of cached max bars');
            t.is(allocData.bars.length, 30, 'Correct amount of cached allocation bars');
            t.is(allocData.cacheStart, new Date(2010, 0, 25), 'Cache start is correct');
            t.is(allocData.cacheEnd, new Date(2010, 2, 8), 'Cache end is correct');


            t.diag('Reduce timespan to 08/02/2010 - 22/02/2010');
            histogram.setTimeSpan(new Date(2010, 1, 8), new Date(2010, 1, 22));

            t.is(allocData.maxBars.length, 8, 'Correct amount of cached max bars');
            t.is(allocData.bars.length, 20, 'Correct amount of cached allocation bars');
            t.is(allocData.cacheStart, new Date(2010, 1, 1), 'Cache start is correct');
            t.is(allocData.cacheEnd, new Date(2010, 2, 1), 'Cache end is correct');

            t.diag('Shift timespan to 15/02/2010 - 01/03/2010');
            histogram.shiftNext();

            t.is(allocData.maxBars.length, 6, 'Correct amount of cached max bars');
            t.is(allocData.bars.length, 15, 'Correct amount of cached allocation bars');
            t.is(allocData.cacheStart, new Date(2010, 1, 8), 'Cache start is correct');
            t.is(allocData.cacheEnd, new Date(2010, 2, 1), 'Cache end is correct');


            t.diag('Shift timespan to 08/02/2010 - 22/02/2010');
            histogram.shiftPrevious();

            t.is(allocData.maxBars.length, 6, 'Correct amount of cached max bars');
            t.is(allocData.bars.length, 15, 'Correct amount of cached allocation bars');
            t.is(allocData.cacheStart, new Date(2010, 1, 8), 'Cache start is correct');
            t.is(allocData.cacheEnd, new Date(2010, 2, 1), 'Cache end is correct');

            t.diag('Shift timespan to 01/02/2010 - 15/03/2010');
            histogram.shiftPrevious();

            t.is(allocData.maxBars.length, 6, 'Correct amount of cached max bars');
            t.is(allocData.bars.length, 15, 'Correct amount of cached allocation bars');
            t.is(allocData.cacheStart, new Date(2010, 1, 1), 'Cache start is correct');
            t.is(allocData.cacheEnd, new Date(2010, 1, 22), 'Cache end is correct');
        });
    });

    t.it('Should split cached allocation elements correctly', function (t) {

        var histogram       = prepare({
            calendar        : {
                calendarId  : 'mycal1',
                data        : []
            },
            resourceStore   : {
                data        : [
                    { Id: 'r1', Name: 'Mike', CalendarId : 'mycal1' }
                ]
            },
            taskStore       : {
                DATA : [
                    { Id : 1, StartDate : new Date(2010, 0, 25, 8), leaf : true, DurationUnit : 'h', Duration : 40 },
                    { Id : 2, StartDate : new Date(2010, 1, 1, 8), leaf : true, DurationUnit : 'h', Duration : 40 },
                    { Id : 3, StartDate : new Date(2010, 1, 8, 8), leaf : true, DurationUnit : 'h', Duration : 40 },
                    { Id : 4, StartDate : new Date(2010, 1, 15, 8), leaf : true, DurationUnit : 'h', Duration : 40 },
                    { Id : 5, StartDate : new Date(2010, 1, 22, 8), leaf : true, DurationUnit : 'h', Duration : 40 },
                    { Id : 6, StartDate : new Date(2010, 2, 1, 8), leaf : true, DurationUnit : 'h', Duration : 40 }
                ]
            },
            assignmentStore : {
                data : [
                    { Id : 1, ResourceId : 'r1', TaskId : 1 },
                    { Id : 2, ResourceId : 'r1', TaskId : 2 },
                    { Id : 3, ResourceId : 'r1', TaskId : 3 },
                    { Id : 4, ResourceId : 'r1', TaskId : 4 },
                    { Id : 5, ResourceId : 'r1', TaskId : 5 },
                    { Id : 6, ResourceId : 'r1', TaskId : 6 }
                ]
            },
            histogram       : {
                cacheLimitDurationUnit  : 'w',
                cacheLimitDuration      : 1,

                autoAdjustTimeAxis      : false,

                startDate   : new Date(2010, 1, 1),
                endDate     : new Date(2010, 2, 1)
            }
        });

        t.waitForRowsVisible(histogram, function () {
            var allocData = histogram.allocationData.r1;

            t.diag('Set timespan to 10/02/2010 - 18/02/2010');
            histogram.setTimeSpan(new Date(2010, 1, 10), new Date(2010, 1, 18));

            t.is(allocData.maxBars.length, 7, 'Max bars length is correct');
            t.is(allocData.maxBars[0].startDate, new Date(2010, 1, 1), 'First max bar start date is correct');
            t.is(allocData.maxBars[6].endDate, new Date(2010, 1, 27), 'Last max bar end date is correct');

            var bars = Ext.Array.slice(allocData.bars);

            t.is(allocData.bars.length, 4, 'Bars length is correct');
            t.is(allocData.bars[0].startDate, new Date(2010, 1, 1, 8), 'First bar start date is correct');
            t.is(allocData.bars[3].endDate, new Date(2010, 1, 26, 17), 'Last bar end date is correct');

            t.is(allocData.cacheStart, new Date(2010, 1, 3), 'Cache start is correct');
            t.is(allocData.cacheEnd, new Date(2010, 1, 25), 'Cache end is correct');

            t.diag('Set timespan to 01/02/2010 - 01/03/2010');
            histogram.setTimeSpan(new Date(2010, 1, 1), new Date(2010, 2, 1));

            t.is(allocData.maxBars.length, 10, 'Max bars length is correct');
            t.is(allocData.maxBars[0].startDate, new Date(2010, 1, 1), 'No gap');
            t.is(allocData.maxBars[9].endDate, new Date(2010, 2, 1), 'No gap');

            t.is(allocData.bars.length, 4, 'Bars length is correct');
            t.isDeeply(allocData.bars, bars, 'Bars has not changed');
        });
    });
});
