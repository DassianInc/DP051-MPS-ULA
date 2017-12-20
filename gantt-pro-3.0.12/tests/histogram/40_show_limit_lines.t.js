StartTest(function (t) {

    var prepare = function (config) {

        config  = config || {};

        t.getBusinessTimeCalendar(Ext.apply({
            calendarId  : "custom",
            data        : [
                { "Date" : new Date(2010, 1, 11), Availability : [ "08:00-12:00" ] },
                { "Date" : new Date(2010, 1, 12), Availability : [ "08:00-09:00" ] }
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
                { Id : 117, ResourceId : "r1", TaskId : 117, Units : 50 }
            ]
        });

        var taskStore       = t.getTaskStore({
            resourceStore   : resourceStore,
            assignmentStore : assignmentStore,
            DATA            : [
                {
                    leaf            : true,
                    Id              : 117,
                    StartDate       : "2010-02-03T00:00:00",
                    Duration        : 6,
                    SchedulingMode  : "FixedDuration"
                }
            ]
        });

        return new Gnt.panel.ResourceHistogram(Ext.apply({
            taskStore           : taskStore,
            resourceStore       : resourceStore,
            assignmentStore     : assignmentStore,
            startDate           : new Date(2010, 1, 1),
            endDate             : new Date(2010, 1, 22),
            width               : 800,
            height              : 400,
            renderTo            : Ext.getBody()
        }, config.histogram));
    };

    t.it('Doesn`t show vertical limit lines when `showVerticalLimitLines` is `false`', function (t) {

        var histogram   = prepare({
            histogram   : {
                showVerticalLimitLines  : false
            }
        });

        t.waitForRowsVisible(histogram, function () {
            t.selectorNotExists('.'+histogram.normalGrid.view._limitLineVerticalCls, 'No vertical lines');

            histogram.destroy();
        });
    });

    t.it('Shows vertical limit lines when `showVerticalLimitLines` is `true` (which is its default state)', function (t) {

        var histogram   = prepare();

        t.waitForRowsVisible(histogram, function () {
            t.selectorExists('.'+histogram.normalGrid.view._limitLineVerticalCls, 'There are vertical lines');

            histogram.destroy();
        });
    });

    t.it('Limit lines take calendar into account', function (t) {

        Ext.create('Gnt.data.calendar.BusinessTime', {
            calendarId  : 'MatsCalendar',
            data        : [
                { "Date" : new Date(2010, 0, 11) },
                { "Date" : new Date(2010, 0, 12) }
            ]
        });

        var resourceStore   = Ext.create("Gnt.data.ResourceStore", {
            data : [
                { Id : 1, Name : "Mats", CalendarId : "MatsCalendar" }
            ]
        });

        var taskStore       = t.getTaskStore({
            resourceStore   : resourceStore,
            DATA            : []
        });

        var histogram = new Gnt.panel.ResourceHistogram({
            taskStore       : taskStore,
            resourceStore   : resourceStore,
            startDate       : new Date(2010, 0, 11),
            endDate         : new Date(2010, 0, 25),
            viewPreset      : 'weekAndDayLetter',
            labelMode       : 'units',
            scaleMax        : 8,
            scaleStep       : 1,
            scaleLabelStep  : 4,
            height          : 300,
            width           : 1000,
            renderTo        : Ext.getBody()
        });

        t.waitForRowsVisible(histogram, function () {
            var viewEl = histogram.getSchedulingView().el;

            var els = viewEl.select('.gnt-resourcehistogram-limitline');

            var width = histogram.timeAxisViewModel.getTickWidth();
            t.is(els.item(1).getWidth(), width * 3, 'First segment width is correct');

            t.hasCls(els.item(0), 'gnt-resourcehistogram-limitline-vertical', 'First element is a vertical line');
            t.is(els.item(0).getStyle('left'), els.item(1).getStyle('left'), 'Left position is synced');
        });
    });
});