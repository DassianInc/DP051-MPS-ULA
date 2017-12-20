StartTest(function(t) {
    t.beforeEach(function() {
        t.cq1('ganttpanel') && t.cq1('ganttpanel').destroy();
    })

    t.it("should see the resize handle on top of bar elements", function(t) {
        var g = t.getGantt2({
            startDate   : new Date(2010, 1, 1),
            height      : 200,
            cls         : 'one',
            renderTo    : Ext.getBody()
        });

        t.chain(
            { moveCursorTo : '.sch-gantt-task-bar' },
            { moveCursorTo : '.sch-resizable-handle-start' },

            {
                moveCursorTo : '.one .sch-resizable-handle-start',
                offset       : [-3, 6]
            },
            function(next) {

                t.moveByWithCallback([6, 0], function(e) {
                    var foundEl = t.elementFromPoint(e.getX(), e.getY());
                    var ok = Ext.fly(foundEl).hasCls('sch-gantt-terminal') || Ext.fly(foundEl).hasCls('sch-resizable-handle');

                    t.ok(ok, 'Should not see underlying bar elements');
                }, next)
            }
        )
    })

    t.it("should hide the tooltip even if the resize didn't update the task", function(t) {
        var g = t.getGantt2({
            startDate   : new Date(2010, 1, 1),
            height      : 200,
            cls         : 'one',
            renderTo    : Ext.getBody()
        });

        t.chain(
            {
                moveCursorTo : '.one .sch-resizable-handle-start'
            },
            {
                action : 'mouseDown'
            },
            { waitFor : 1000 },

            function(next) {
                t.selectorNotExists('.gnt-tooltip', 'Should not see tooltip visible after long mousedown without move');
                g.destroy();
            }
        )
    })

    t.it("should not start a resize if right clicking resize handle", function(t) {
        var g = t.getGantt2({
            startDate   : new Date(2010, 1, 1),
            renderTo    : Ext.getBody(),
            height      : 200,
            cls         : 'two'
        });

        t.wontFire(g, 'beforetaskresize');

        t.chain(
            {
                waitFor     : 'rowsVisible', args : g
            },
            {
                moveCursorTo : '.two .sch-gantt-task-handle'
            },
            {
                action : 'rightClick'
            },

            { waitFor : 100 },

            {
                action : 'moveCursor',
                by     : [-20, 0]
            },

            function() {
                g.destroy();
            }
        )
    });
    
    t.it('Should show exact drop position', function (t) {
        var g = t.getGantt2({
            startDate   : new Date(2010, 1, 1),
            renderTo    : Ext.getBody(),
            height      : 200,
            taskStore   : t.getTaskStore({
                calendar    : new Gnt.data.Calendar({
                    name        : 'General',
                    calendarId  : 'General'
                }),
                DATA : [
                    {
                        StartDate : new Date(2010, 1, 3),
                        Duration  : 6,
                        leaf      : true
                    }
                ]
            }),
            cls         : 'three',
            resizeConfig: { 
                showExactResizePosition : true
            }
        });
        
        var tickWidth = g.timeAxisViewModel.getTickWidth();

        t.chain(
            { waitFor : 'rowsVisible', args :g },
            { moveCursorTo : '.three .sch-gantt-item' },
            { mouseDown : '.three .sch-gantt-item .sch-resizable-handle-start' },
            { moveMouseBy : [[10, 0]] },
            { action : 'mouseUp' },
            { moveMouseBy : [[10, 0]] },
            function (next) {
                var element = g.el.down('.three .sch-gantt-item');
                t.is(element.getWidth(), 8 * tickWidth, 'Task hasn\'t resized');
                next();
            },
            { mouseDown : '.three .sch-gantt-item .sch-resizable-handle-start' },
            { moveMouseBy : [[15, 0]] },
            { action : 'mouseUp' },
            { moveMouseBy : [[10, 0]] },
            function (next) {
                var element = g.el.down('.three .sch-gantt-item');
                t.is(element.getWidth(), 7 * tickWidth, 'Task resized correctly');
                next();
            },
            { mouseDown : '.three .sch-gantt-item .sch-resizable-handle-end' },
            { moveMouseBy : [[10, 0]] },
            { action : 'mouseUp' },
            { moveMouseBy : [[10, 0]] },
            function (next) {
                var element = g.el.down('.three .sch-gantt-item');
                t.is(element.getWidth(), 7 * tickWidth, 'Task hasn\'t resized');
                next();
            },
            { mouseDown : '.three .sch-gantt-item .sch-resizable-handle-end' },
            { moveMouseBy : [[15, 0]] },
            { action : 'mouseUp' },
            { moveMouseBy : [[10, 0]] },
            function (next) {
                var element = g.el.down('.three .sch-gantt-item');
                t.is(element.getWidth(), 8 * tickWidth, 'Task resized correctly');
                next();
            },
            { mouseDown : '.three .sch-gantt-item .sch-resizable-handle-end' },
            { moveMouseBy : [[4 * tickWidth, 0]] },
            { action : 'mouseUp' },
            { moveMouseBy : [[10, 0]] },
            function (next) {
                var element = g.el.down('.three .sch-gantt-item');
                t.is(element.getWidth(), 12 * tickWidth, 'Task resized correctly');
                next();
            },
            { mouseDown : '.three .sch-gantt-item .sch-resizable-handle-start' },
            { moveMouseBy : [[2 * tickWidth, 0]] },
            { action : 'mouseUp' },
            { moveMouseBy : [[10, 0]] },
            function (next) {
                var element = g.el.down('.three .sch-gantt-item');
                t.is(element.getWidth(), 8 * tickWidth, 'Task resized correctly');
                
                g.destroy();
            }
        )
    });
    
    t.it('Should hide resize tip', function (t) {
        var g = t.getGantt2({
            startDate   : new Date(2010, 1, 1),
            renderTo    : Ext.getBody(),
            height      : 200,
            taskStore   : t.getTaskStore({
                calendar    : new Gnt.data.Calendar({
                    name        : 'General',
                    calendarId  : 'General'
                }),
                DATA : [
                    {
                        StartDate : new Date(2010, 1, 3),
                        Duration  : 6,
                        leaf      : true
                    }
                ]
            })
        });
        
        t.chain(
            { waitForEventsToRender : g },
            { moveMouseTo   : '.sch-gantt-item' },
            { mouseDown   : '.sch-resizable-handle-end' },
            { moveMouseBy : [[-10, 0]] },
            { action : 'mouseUp' },
            { moveMouseBy : [[0, 30]] },
            { moveMouseTo   : '.sch-gantt-item' },
            { waitFor : 1000 },
            function (next) {
                t.notOk(g.getSchedulingView().taskResizer.tip.isVisible(), 'Tip is hidden');
                next();
            },
            { click : g.getSchedulingView() },
            { moveMouseTo   : '.sch-gantt-item' },
            { waitFor : 1000 },
            function (next) {
                t.notOk(g.getSchedulingView().taskResizer.tip.isVisible(), 'Tip is hidden');
            }
        );
    });
});
