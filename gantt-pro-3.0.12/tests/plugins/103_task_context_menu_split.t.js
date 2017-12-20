StartTest(function(t) {

    var activeLevel     = 0,
        activeSubtest   = t;

    var min = 60*1000;
    var hr  = 60*min;
    var day = 24*hr;

    var checkDate = new Date(2010, 1, 15, 12);

    var view;

    var properSplitArguments = [
        [ day,  'ms' ],
        [ day,  'ms' ],
        [ day,  'ms' ],
        [ day,  'ms' ],
        [ day,  'ms' ],
        [ day,  'ms' ],
        [ day,  'ms' ],
        [ day,  'ms' ],
        [ day,  'ms' ],
        [ day,  'ms' ],
        [ day,  'ms' ],
        [ day,  'ms' ],
        [ day,  'ms' ],

        [ 6*hr, 'ms' ],
        [ 6*hr, 'ms' ],
        [ 2*hr, 'ms' ],
        [ hr,   'ms' ],

        [ hr,   'ms' ],
        [ hr,   'ms' ],
        [ hr,   'ms' ]
    ];


    Ext.define('Gnt.model.MyTask', {
        extend  : 'Gnt.model.Task',

        split : function (dt, duration, unit) {
            var tick = view.timeAxis.first();

            var args = properSplitArguments[activeLevel];

            var date;

            if (Sch.util.Date.getDurationInDays(tick.getStartDate(), tick.getEndDate()) >= 1) {
                date = view.timeAxis.roundDate(checkDate, this.getStartDate());
            } else {
                date = view.timeAxis.getAt(Math.floor(view.timeAxis.getTickFromDate(checkDate))).getStartDate();
            }

            activeSubtest.is(dt, date, 'Correct date argument');
            activeSubtest.isDeeply([duration, unit], args, 'proper split() call arguments');
        }
    })

    var setup = function () {
        var menu                = new Gnt.plugin.TaskContextMenu();

        var gantt               = t.getGantt({
            taskStore           : t.getTaskStore({
                model : 'Gnt.model.MyTask'
            }),
            lockedGridConfig    : { width : 1 },
            renderTo            : Ext.getBody(),
            autoAdjustTimeAxis  : false,
            startDate           : new Date(),
            endDate             : Ext.Date.add(new Date(), 'd', 1),
            width               : 950,
            plugins             : menu
        });

        return {
            gantt           : gantt,
            menu            : menu,
            getTaskElById   : function (id) {
                try {
                    var node = gantt.getSchedulingView().getNode(gantt.taskStore.getNodeById(id));
                    return Ext.get(node).down('.sch-gantt-item');
                } catch (e) {
                    return null;
                }
            },

            task            : function (id) { return gantt.taskStore.getNodeById(id); }
        };
    }

    var ctx     = setup(),
        menu    = ctx.menu,
        gantt   = ctx.gantt,
        task    = ctx.task;

    // #1863

    var duration    = task(120).getEndDate() - task(120).getStartDate();
    var middleDate  = task(120).getStartDate() - 0 + duration / 2;

    view = gantt.getSchedulingView();


    var testZoomLevel = function (level) {
        if (!properSplitArguments[level]) {
            return;
        }

        t.it(level + ': proper split duration for the level',  function (t) {

            activeLevel     = level;
            activeSubtest   = t;

            t.waitForEvent(view, 'refresh', function () {
                t.chain(
                    { waitForRowsVisible : gantt },

                    { rightClick : function () { return [ view.getCoordinateFromDate(checkDate, false), ctx.getTaskElById(120).getTop() ] } },

                    { waitForComponentVisible : menu, desc : 'context menu showed' },

                    { click : '>> #splitTask' },

                    function () {
                        if (level < gantt.zoomLevels.length - 1) {
                            // let's assert next zoom level (if any)
                            testZoomLevel(level+1);
                        }
                    }
                );
            });

            // zoom gantt to the provided level
            gantt.zoomToLevel(level, { start : Ext.Date.add(new Date(middleDate), 'd', -2), end : Ext.Date.add(new Date(middleDate), 'd', 2) }, { centerDate : checkDate });
        });
    };

    testZoomLevel(0);
});
