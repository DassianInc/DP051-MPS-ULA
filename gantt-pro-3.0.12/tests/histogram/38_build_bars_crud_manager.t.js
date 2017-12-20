StartTest(function(t) {

    t.expectGlobal('MyResource');

    // Here we check that the histogram gets stores from crud manager if provided.
    // Test code based on 00_build_bars test. Just data loading method switched fro sencha way to CRUD manager approach,

    Ext.define('MyResource', {
        extend              : 'Gnt.model.Resource',

        getAllocationInfo   : function () {
            var result  = this.callParent(arguments);

            if (this.getId() === 'r2 copy') {
                for (var i = result.length - 1; i >= 0; i--) {
                    var period  = result[i];

                    // for resource "r2 copy" we force to use whole interval no matter what totalAllocation % is provided
                    if (period.inResourceCalendar && period.totalAllocation && period.inTasksCalendar) {
                        period.totalOverAllocationMS = 1;
                    }
                }
            }

            return result;
        }
    });

    var taskStore       = t.getTaskStore({
        calendarManager : new Gnt.data.CalendarManager({
            className : 'Gnt.data.calendar.BusinessTime'
        }),
        resourceStore   : t.getResourceStore({
            model   : 'MyResource',
            data    : []
        }),
        cascadeChanges  : true,
        DATA            : []
    });

    var crudManager = new Gnt.data.CrudManager({
        taskStore  : taskStore
    });


    var histogram       = new Gnt.panel.ResourceHistogram({
        crudManager         : crudManager,
        startDate           : new Date(2013, 3, 1),
        endDate             : new Date(2013, 3, 12),
        renderTo            : Ext.getBody(),
        height              : 500
    });


    crudManager.loadData({
        "calendars"     : {

            "metaData"  : {
                "projectCalendar"   : "general"
            },

            "rows"  : [
                {
                    "Id"                  : "general",
                    "Name"                : "General",
                    "DaysPerMonth"        : 20,
                    "DaysPerWeek"         : 5,
                    "HoursPerDay"         : 8,
                    "WeekendsAreWorkdays" : false,
                    "WeekendFirstDay"     : 6,
                    "WeekendSecondDay"    : 0,
                    "DefaultAvailability" : [ "08:00-12:00", "13:00-17:00" ],
                    "leaf"                : true,
                    "Days"                : {
                        "rows" : [
                            {
                                "Date"          : new Date(2011, 6, 16),
                                "Availability"  : [ '11:00-16:00', '17:00-20:00' ]
                            },
                            {
                                "Date"          : new Date(2011, 6, 17),
                                "Availability"  : [ '12:00-16:00' ]
                            }
                        ]
                    }
                },
                {
                    "Id"                  : "custom",
                    "Name"                : "Custom",
                    "DaysPerMonth"        : 20,
                    "DaysPerWeek"         : 5,
                    "HoursPerDay"         : 8,
                    "WeekendsAreWorkdays" : false,
                    "WeekendFirstDay"     : 6,
                    "WeekendSecondDay"    : 0,
                    "DefaultAvailability" : [ "08:00-12:00", "13:00-17:00" ],
                    "leaf"                : true,
                    "Days"                : {
                        "rows" : [
                            {
                                "Date"          : new Date(2013, 3, 4),
                                "Availability"  : [ '09:00-13:00' ]
                            }
                        ]
                    }
                }
            ]
        },

        "tasks" : {
            "rows" : [
                {
                    Id              : 1,
                    leaf            : true,
                    Name            : "Task1",
                    StartDate       : new Date(2013, 3, 2, 8),
                    Duration        : 4
                },
                {
                    Id              : 2,
                    leaf            : true,
                    Name            : "Task2",
                    StartDate       : new Date(2013, 3, 3, 8),
                    Duration        : 2
                },
                {
                    Id              : 3,
                    leaf            : true,
                    Name            : "Task3",
                    StartDate       : new Date(2013, 3, 3, 8),
                    Duration        : 6,
                    SchedulingMode  : 'FixedDuration'
                },
                {
                    Id              : 4,
                    leaf            : true,
                    Name            : "Task3",
                    StartDate       : new Date(2013, 3, 5, 8),
                    Duration        : 3
                }
            ]
        },

        "assignments" : {
            "rows" : [
                { Id: 'a1', ResourceId: 'r1', TaskId : 1, Units : 50 },
                { Id: 'a2', ResourceId: 'r1', TaskId : 2 },
                { Id: 'a3', ResourceId: 'r2', TaskId : 3 },
                { Id: 'a4', ResourceId: 'r2', TaskId : 4 },
                { Id: 'a5', ResourceId: 'r2 copy', TaskId : 3 },
                { Id: 'a6', ResourceId: 'r2 copy', TaskId : 4 }
            ]
        },

        "resources" : {
            "rows" : [
                { Id: 'r1', Name: 'Mike' },
                { Id: 'r2', Name: 'Linda', CalendarId : 'custom' },
                { Id: 'r2 copy', Name: 'Smbdy', CalendarId : 'custom' }
            ]
        }
    });

    var assertMaxBars   = function (t, maxBars, values) {
        t.diag('Check resource limits array');

        t.is(maxBars.length, values.length, values.length+' lines found');

        for (var i in values) {
            t.is(maxBars[i].startDate, values[i].start, i+': line starts from '+values[i].start);
            t.is(maxBars[i].allocationMS/3600000, values[i].hrs, i+': line allocation time is '+values[i].hrs);
        }
    };


    t.it('Histogram processes "r1" allocation info correctly', function (t) {

        t.waitForRowsVisible(histogram, function () {
            var data = histogram.allocationData.r1;

            t.ok(!!data, 'Allocation data is filled');

            t.is(data.bars.length, 3, '3 bars found');

            t.is(data.bars[0].startDate, taskStore.getNodeById(1).getStartDate(), '1st bar starts at "Task1" start date');
            t.is(data.bars[0].totalAllocation, 50, '1st bar allocation is 50%');

            t.is(data.bars[1].startDate, new Date(2013, 3, 3), '2nd bar start is correct');
            t.is(data.bars[1].totalAllocation, 150, '2nd bar allocation is 150%');

            t.is(data.bars[2].startDate, new Date(2013, 3, 5), '3rd bar start is correct');
            t.is(data.bars[2].totalAllocation, 50, '3rd bar allocation is 50%');

            assertMaxBars(t, data.maxBars, [
                { start : new Date(2013, 3, 1), hrs : 8 },
                { start : new Date(2013, 3, 6), hrs : 0 },
                { start : new Date(2013, 3, 8), hrs : 8 },
                { start : new Date(2013, 3, 13), hrs : 0 }
            ]);

        });
    });


    t.it('Histogram processes "r2" allocation info correctly', function (t) {

        t.waitForRowsVisible(histogram, function () {
            var data = histogram.allocationData.r2;

            t.ok(!!data, 'Allocation data is filled');

            t.is(data.bars.length, 5, '5 bars found');

            t.is(data.bars[0].startDate, taskStore.getNodeById(3).getStartDate(), '0th bar starts at "Task3" start date');
            t.is(data.bars[0].totalAllocation, 100, '0th bar allocation is 100%');
            t.is(data.bars[0].allocationMS/3600000, 8, '0th bar allocation time is 8hrs');

            t.is(data.bars[1].startDate, new Date(2013, 3, 4), '1st bar starts when resource calendar for 4-Apr-2013 allows');
            t.is(data.bars[1].endDate, new Date(2013, 3, 5), '1st bar end is correct');
            t.is(data.bars[1].totalAllocation, 100, '1st bar allocation is 100%');
            t.is(data.bars[1].allocationMS/3600000, 4, '1st bar allocation time is 4hrs');

            t.is(data.bars[2].startDate, new Date(2013, 3, 5), '2nd bar start is correct');
            t.is(data.bars[2].endDate, new Date(2013, 3, 6), '2nd bar end is correct');
            t.is(data.bars[2].totalAllocation, 200, '2nd bar allocation is 200%');
            t.is(data.bars[2].allocationMS/3600000, 16, '2nd bar allocation time is 16hrs');

            t.is(data.bars[3].startDate, new Date(2013, 3, 8), '3rd bar starts right after weekend');
            t.is(data.bars[3].endDate, new Date(2013, 3, 10), '3rd bar end is correct');
            t.is(data.bars[3].totalAllocation, 200, '3rd bar allocation is 200%');
            t.is(data.bars[3].allocationMS/3600000, 16, '3rd bar allocation time is 16hrs');

            t.is(data.bars[4].startDate, new Date(2013, 3, 10), '4th bar start is correct');
            t.is(data.bars[4].endDate, taskStore.getNodeById(3).getEndDate(), '4th bar ends at "Task3" end date');
            t.is(data.bars[4].totalAllocation, 100, '4th bar allocation is 100%');
            t.is(data.bars[4].allocationMS/3600000, 8, '4th bar allocation time is 8hrs');

            assertMaxBars(t, data.maxBars, [
                { start : new Date(2013, 3, 1), hrs : 8 },
                { start : new Date(2013, 3, 4), hrs : 4 },
                { start : new Date(2013, 3, 5), hrs : 8 },
                { start : new Date(2013, 3, 6), hrs : 0 },
                { start : new Date(2013, 3, 8), hrs : 8 },
                { start : new Date(2013, 3, 13), hrs : 0 }
            ]);
        });
    });

    t.it('Histogram processes "r2 copy" allocation info correctly', function (t) {

        t.waitForRowsVisible(histogram, function () {
            var data = histogram.allocationData['r2 copy'];

            t.ok(!!data, 'Allocation data is filled');

            t.is(data.bars.length, 5, '5 bars found');

            t.is(data.bars[0].startDate, taskStore.getNodeById(3).getStartDate(), '0th bar starts at "Task3" start date');
            t.is(data.bars[0].totalAllocation, 100, '0th bar allocation is 100%');
            t.is(data.bars[0].allocationMS/3600000, 8, '0th bar allocation time is 8hrs');
            t.ok(data.bars[0].totalOverAllocationMS, '0th has overallocation');

            t.is(data.bars[1].startDate, new Date(2013, 3, 4), '1st bar starts when resource calendar for 4-Apr-2013 allows');
            t.is(data.bars[1].endDate, new Date(2013, 3, 5), '1st bar end is correct');
            t.is(data.bars[1].totalAllocation, 100, '1st bar allocation is 100%');
            t.is(data.bars[1].allocationMS/3600000, 4, '1st bar allocation time is 4hrs');
            t.ok(data.bars[1].totalOverAllocationMS, '1st has overallocation');

            t.is(data.bars[2].startDate, new Date(2013, 3, 5), '2nd bar start is correct');
            t.is(data.bars[2].endDate, new Date(2013, 3, 6), '2nd bar end is correct');
            t.is(data.bars[2].totalAllocation, 200, '2nd bar allocation is 200%');
            t.is(data.bars[2].allocationMS/3600000, 16, '2nd bar allocation time is 16hrs');
            t.ok(data.bars[2].totalOverAllocationMS, '2nd has overallocation');

            t.is(data.bars[3].startDate, new Date(2013, 3, 8), '3rd bar starts right after weekend');
            t.is(data.bars[3].endDate, new Date(2013, 3, 10), '3rd bar end is correct');
            t.is(data.bars[3].totalAllocation, 200, '3rd bar allocation is 200%');
            t.is(data.bars[3].allocationMS/3600000, 16, '3rd bar allocation time is 16hrs');
            t.ok(data.bars[3].totalOverAllocationMS, '3rd has overallocation');

            t.is(data.bars[4].startDate, new Date(2013, 3, 10), '4th bar start is correct');
            t.is(data.bars[4].endDate, taskStore.getNodeById(3).getEndDate(), '4th bar ends at "Task3" end date');
            t.is(data.bars[4].totalAllocation, 100, '4th bar allocation is 100%');
            t.is(data.bars[4].allocationMS/3600000, 8, '4th bar allocation time is 8hrs');
            t.ok(data.bars[4].totalOverAllocationMS, '4th has overallocation');

            assertMaxBars(t, data.maxBars, [
                { start : new Date(2013, 3, 1), hrs : 8 },
                { start : new Date(2013, 3, 4), hrs : 4 },
                { start : new Date(2013, 3, 5), hrs : 8 },
                { start : new Date(2013, 3, 6), hrs : 0 },
                { start : new Date(2013, 3, 8), hrs : 8 },
                { start : new Date(2013, 3, 13), hrs : 0 }
            ]);
        });

    });
});
