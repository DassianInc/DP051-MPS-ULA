StartTest(function(t) {

    // Checks how ResourceHistogram renderers fill arrays for templates

    var scaleLines = [
        { value: 0, top: 49 }, // unit height is 3,769230769 (49/(8+5) since scale size is 8hrs plus 1 step (which is set to 5hrs))
        { value: 5, top: 30 },
        { value: 8, top: 19 }
    ];

    var limitLines   = [
        { top : 19, height : 0 },
        { top : 19, height : 31 },
//        { top : 49, height : 0 },
        { top : 19, height : 31 },
        { top : 19, height : 0 },
        { top : 19, height : 16 },
        { top : 34, height : 0 },
        { top : 34, height : 12 },
        { top : 45, height : 0 },
        { top : 45, height : 5 },
//        { top : 49, height : 0 },
        { top : 19, height : 31 },
        { top : 19, height : 0 },
        { top : 19, height : 31 }
//        { top : 49, height : 0 }
    ];

    var bars        = [
        { id : "r1-0", height : 15, top : 34 /* 49 - 15 */ },
        { id : "r1-1", height : 15, top : 34 }
    ];

    var calendar    = t.getBusinessTimeCalendar({
        calendarId  : "custom",
        data        : [
            {
                Date            : new Date(2010, 1, 11),
                IsWorkingDay    : true,
                Availability    : [ "08:00-12:00" ]
            },
            {
                Date            : new Date(2010, 1, 12),
                IsWorkingDay    : true,
                Availability    : [ "08:00-09:00" ]
            }
        ]
    });

    var resourceStore   = t.getResourceStore({
        data: [
            { Id: "r1", Name: "Mike", CalendarId: "custom" },
            { Id: "r2", Name: "Linda" },
            { Id: "r3", Name: "Don" }
        ]
    });

    var assignmentStore = t.getAssignmentStore({
        data: [
            { Id: "a1", ResourceId: "r1", TaskId : 117, Units : 50 }
        ]
    });

    var dependencyStore = t.getDependencyStore();

    var taskStore = t.getTaskStore({
        cascadeChanges  : false,
        resourceStore   : resourceStore,
        assignmentStore : assignmentStore,
        dependencyStore : dependencyStore,
        DATA            : [
            {
                leaf            : true,
                Id              : 117,
                StartDate       : "2010-02-03T00:00:00",
                Name            : "New task 1",
                Duration        : 6,
                SchedulingMode  : "FixedDuration"
            }
        ]
    });

    var histogram = new Gnt.panel.ResourceHistogram({
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
    });

    var view = histogram.getView().normalView;

    t.waitForRowsVisible(histogram, function () {

        var data = histogram.allocationData.r1;

        t.it("Should size columns / cells correctly", function (t) {
            var lockedGrid = histogram.lockedGrid;

            Ext.Array.each(lockedGrid.query('gridcolumn'), function(col, i) {
                t.is(col.getWidth(), t.getCell(lockedGrid, 0, i).getWidth(), 'Widths synced');
            })
        });

        t.it("Calculates scale lines values/positions correctly", function (t) {

            var lines = view.prepareLines();

            t.is(lines.length, 3, "3 scale lines");

            for (var i = 0, l = scaleLines.length; i < l; i++) {
                t.is(lines[i].value, scaleLines[i].value, i + ": correct scale level");
                t.is(lines[i].top, scaleLines[i].top, i + ": correct top coordinate");
            }
        });

        t.it("Calculates limit line position correctly", function (t) {

            var lines = view.prepareLimitLines(data.maxBars);

            t.is(lines.length, 12, "12 lines");

            for (var i in limitLines) {
                t.is(lines[i].top, limitLines[i].top, i + ": correct top coordinate");
                t.is(lines[i].height, limitLines[i].height, i + ": correct height");
            }
        });

        t.it("Calculates bars positions correctly", function (t) {

            var lines = view.prepareBars(data.bars, "r1");

            t.is(lines.length, 2, "2 bars");

            for (var i = 0, l = lines.length; i < l; i++) {
                t.is(lines[i].id, bars[i].id, i + ": correct identifier");
                t.is(lines[i].height, bars[i].height, i + ": correct height");
                t.is(lines[i].top, bars[i].top, i + ": correct top coordinate");
            }
        });

    });

});
