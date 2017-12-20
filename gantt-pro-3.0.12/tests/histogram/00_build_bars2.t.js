StartTest(function (t) {
    var setup = function (config) {
        var calendar = t.getBusinessTimeCalendar(Ext.apply({
            calendarId  : 'custom'
        }, config.calendar));

        var resourceStore = t.getResourceStore(Ext.apply({
            data : [
                { Id : 'r1', Name : 'Albert', CalendarId : 'custom' }
            ]
        }, config.resourceStore));

        var assignmentStore = t.getAssignmentStore(Ext.apply({
            resourceStore   : resourceStore
        }, config.assignmentStore));

        var taskStore = t.getTaskStore(Ext.apply({
            resourceStore   : resourceStore,
            assignmentStore : assignmentStore
        }, config.taskStore));

        return new Gnt.panel.ResourceHistogram(Ext.apply({
            taskStore           : taskStore,
            resourceStore       : resourceStore,
            assignmentStore     : assignmentStore,
            startDate           : new Date(2010, 1, 8),
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

    t.it('Should render bars through weekend', function (t) {
        var histogram = setup({
            assignmentStore : {
                data            : [
                    { Id : 1, ResourceId : 'r1', TaskId : 1, Units : 100 },
                    { Id : 2, ResourceId : 'r1', TaskId : 2, Units : 100 },
                    { Id : 3, ResourceId : 'r1', TaskId : 3, Units : 100 },
                    { Id : 4, ResourceId : 'r1', TaskId : 4, Units : 100 }
                ]
            },
            taskStore : {
                DATA : [
                    { leaf : true, Id : 1, StartDate : new Date(2010, 1, 8, 8), Duration : 8, DurationUnit : 'h' },
                    { leaf : true, Id : 2, StartDate : new Date(2010, 1, 12, 8), Duration : 8, DurationUnit : 'h' },
                    { leaf : true, Id : 3, StartDate : new Date(2010, 1, 15, 8), Duration : 8, DurationUnit : 'h' },
                    { leaf : true, Id : 4, StartDate : new Date(2010, 1, 19, 8), Duration : 8, DurationUnit : 'h' }
                ]
            }
        });

        t.chain(
            { waitForRowsVisible : histogram },
            function (next) {
                var bars = histogram.allocationData.r1.bars;

                t.isDeeply([bars[0].startDate, bars[0].endDate], [new Date(2010, 1, 8, 8), new Date(2010, 1, 8, 17)], 'First monday bar is correct');
                t.isDeeply([bars[1].startDate, bars[1].endDate], [new Date(2010, 1, 12, 8), new Date(2010, 1, 12, 17)], 'First friday bar is correct');
                t.isDeeply([bars[2].startDate, bars[2].endDate], [new Date(2010, 1, 15, 8), new Date(2010, 1, 15, 17)], 'Second monday bar is correct');
                t.isDeeply([bars[3].startDate, bars[3].endDate], [new Date(2010, 1, 19, 8), new Date(2010, 1, 19, 17)], 'Second friday bar is correct');
            }
        );
    });
});