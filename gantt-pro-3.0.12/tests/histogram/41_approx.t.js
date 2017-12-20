StartTest(function (t) {

    // Here we check that histogram view merges limit lines based on "showLimitLinesThreshold" value

    var prepare = function (config) {

        config  = config || {};

        t.getBusinessTimeCalendar(Ext.apply({
            calendarId  : "custom",
            data        : [
                { "Date" : new Date(2015, 1, 16), Availability : [ "08:00-16:00" ] },
                { "Date" : new Date(2015, 1, 17), Availability : [ "08:00-15:00" ] },
                { "Date" : new Date(2015, 1, 18), Availability : [ "08:00-14:00" ] },
                { "Date" : new Date(2015, 1, 19), Availability : [ "08:00-13:00" ] },
                { "Date" : new Date(2015, 1, 20), Availability : [ "08:00-12:00" ] }
            ]
        }, config.calendar));

        var resourceStore   = t.getResourceStore({
            data    : [
                { Id : "r1", Name : "Mike", CalendarId : "custom" }
            ]
        });

        var assignmentStore = t.getAssignmentStore({
            resourceStore   : resourceStore,
            data            : [
                { Id : 1, ResourceId : "r1", TaskId : 1, Units : 50 }
            ]
        });

        var taskStore       = t.getTaskStore({
            resourceStore   : resourceStore,
            assignmentStore : assignmentStore,
            DATA            : [{
                leaf            : true,
                Id              : 1,
                StartDate       : "2015-02-16T00:00:00",
                Duration        : 5,
                SchedulingMode  : 'FixedDuration'
            }]
        });

        return new Gnt.panel.ResourceHistogram(Ext.apply({
            taskStore               : taskStore,
            resourceStore           : resourceStore,
            assignmentStore         : assignmentStore,
            showVerticalLimitLines  : false,
            scaleMax                : 8,
            width                   : 800,
            height                  : 400,
            renderTo                : Ext.getBody()
        }, config.histogram));
    };

    t.it('Doesn`t merge when `showLimitLinesThreshold`=90', function (t) {

        var histogram   = prepare({
            histogram   : {
                showLimitLinesThreshold : 90,
                normalViewConfig        : {
                    prepareLimitLines : function () {
                        var result      = this.self.prototype.prepareLimitLines.apply(this, arguments);
                        var rowHeight   = this.getAvailableRowHeight();

                        t.is(result.length, 5, 'proper number of limit lines');

                        t.is(result[0].width, 100, '#0 proper width');
                        t.is(result[1].width, 100, '#1 proper width');
                        t.is(result[2].width, 100, '#2 proper width');
                        t.is(result[3].width, 100, '#3 proper width');
                        t.is(result[4].width, 100, '#4 proper width');
                        t.isApprox(result[0].top, rowHeight - this.unitHeight * 8, 1, '#0 top matches 8 hrs');
                        t.isApprox(result[1].top, rowHeight - this.unitHeight * 7, 1, '#1 top matches 7 hrs');
                        t.isApprox(result[2].top, rowHeight - this.unitHeight * 6, 1, '#2 top matches 6 hrs');
                        t.isApprox(result[3].top, rowHeight - this.unitHeight * 5, 1, '#3 top matches 5 hrs');
                        t.isApprox(result[4].top, rowHeight - this.unitHeight * 4, 1, '#4 top matches 4 hrs');

                        return result;
                    }
                }
            }
        });

        t.waitForRowsVisible(histogram, function () {
            histogram.destroy();
        });
    });

    t.it('Merges properly when `showLimitLinesThreshold`=105', function (t) {

        var histogram   = prepare({
            histogram   : {
                showLimitLinesThreshold : 105,
                normalViewConfig        : {
                    prepareLimitLines : function () {
                        var result      = this.self.prototype.prepareLimitLines.apply(this, arguments);
                        var rowHeight   = this.getAvailableRowHeight();

                        t.is(result.length, 2, 'proper number of limit lines');

                        t.is(result[0].width, 200, '#0 proper width');
                        t.is(result[1].width, 300, '#1 proper width');
                        // merges two lines: 8hr and 7hr, calculated as rowHeight - unitHeight * (8 + 7)/2
                        t.isApprox(result[0].top, rowHeight - this.unitHeight * (8 + 7) / 2, 1, '#0 top is average of 8 and 7 hrs');
                        // merges 3 lines: 6hr, 5hr and 4hr, calculated as rowHeight - unitHeight * (6 + 5)/2
                        // (4hr line is not taken into account for "top" calculation)
                        t.isApprox(result[1].top, rowHeight - this.unitHeight * (6 + 5) / 2, 1, '#1 top is average of 6 and 5 hrs');

                        return result;
                    }
                }
            }
        });

        t.waitForRowsVisible(histogram, function () {
            histogram.destroy();
        });
    });

    t.it('Merges properly when `showLimitLinesThreshold`=205', function (t) {

        var histogram   = prepare({
            histogram   : {
                showLimitLinesThreshold : 205,
                normalViewConfig        : {
                    prepareLimitLines : function () {
                        var result      = this.self.prototype.prepareLimitLines.apply(this, arguments);
                        var rowHeight   = this.getAvailableRowHeight();

                        t.is(result.length, 1, 'proper number of limit lines');
                        t.is(result[0].width, 700, '#0 proper width');
                        // merges all lines:
                        // top calculation is average between 8hr, 7hr and 6hr lines
                        t.isApprox(result[0].top, rowHeight - this.unitHeight * (8 + 7 + 6) / 3, 1, '#0 top is average of 8,7,6 hrs');

                        return result;
                    }
                }
            }
        });

        t.waitForRowsVisible(histogram, function () {
            histogram.destroy();
        });
    });

});