StartTest(function(t) {
    var Type = Gnt.model.Dependency.Type;
    var rtl = t.url.match('rtl');
    var gantt;

    t.beforeEach(function(){
        gantt && gantt.destroy();
    })

    // 1. Figure out direction based on start XY
    // 2. Walk until next xy point is not the same el, OR it's a dependency arrow
    // 3. If it's not an arrow, figure out which direction to go, repeat #2

    var Walker = function(t, ganttPanel, dependency) {

        Ext.apply(this, {
            dependencyRecord        : dependency,
            dir                     : null,
            steps                   : 0,
            getNextPoint            : function(x, y) {
                switch(this.dir) {
                    case 'l': return [x-1, y];
                    case 'r': return [x+1, y];
                    case 'u': return [x, y-1];
                    case 'd': return [x, y+1];
                }
            },

            // For debugging
            markPixel : function(x, y) {
//                Ext.getBody().createChild({
//                    style : 'background:black;width:1px;height:1px;position:absolute;top:' + y + 'px;left:' + x + 'px'
//                });
            },

            getStartPoint  : function () {
                var taskEl = ganttPanel.getSchedulingView().getElementFromEventRecord(this.dependencyRecord.getSourceTask());
                var xy = taskEl.getXY();
                var dir, found = false;

                if (ganttPanel.rtl) {
                    if (this.dependencyRecord.getType() === Type.StartToEnd ||
                        this.dependencyRecord.getType() === Type.StartToStart) {
                        dir = 'r';
                        xy[0] += taskEl.getWidth() + 1;
                    } else {
                        dir = 'l';
                        // IE9/10 fail to lookup dependency in rtl gantt like normal browsers
                        if (Ext.isIE) {
                            xy[0] -= 2;
                        } else {
                            xy[0] -= 1;
                        }
                    }
                } else {
                    if (this.dependencyRecord.getType() === Type.EndToEnd ||
                        this.dependencyRecord.getType() === Type.EndToStart) {
                        dir = 'r';
                        xy[0] += taskEl.getWidth() + 1;
                    } else {
                        dir = 'l';
                        xy[0] -= 1;
                    }
                }

                // Locate the dependency start point
                for (var i = 0; i < taskEl.getHeight(); i++) {
                    var secondaryXPosition = xy[0] + (rtl ? -1 : 1);
                    var elAtPoint = document.elementFromPoint(xy[0], xy[1]+i);
                    var elAtPoint2 = document.elementFromPoint(secondaryXPosition, xy[1]+i);

                    if (elAtPoint.className.match('sch-dependency')) {
                        xy[1] = xy[1]+i;
                        found = true;
                        break;
                    } else if (elAtPoint2.className.match('sch-dependency')) {
                        xy[0] = secondaryXPosition;
                        xy[1] = xy[1]+i;
                        found = true;
                        break;
                    }
                }

                t.ok(found, 'Found start point of dependency next to task element');

                t.isApprox(i, (taskEl.getHeight()/2), 2, 'Outgoing dependency line vertically centered');

                return {
                    dir : dir,
                    x   : xy[0],
                    y   : xy[1]
                };
            },

            getNewDirection : function (x, y) {
                var dir, el;

                if (this.dir === 'l' || this.dir === 'r') {
                    el = Ext.Element.fromPoint(x, y-3);

                    if (el.dom.className.match('sch-dependency')) {
                        dir = 'u';
                    } else {
                        dir = 'd';
                    }
                }
                else {
                    el = Ext.Element.fromPoint(x-3, y);

                    if (el.dom.className.match('sch-dependency')) {
                        dir = 'l';
                    } else {
                        dir = 'r';
                    }
                }

                return dir;
            },

            walkToArrow: function (x, y) {
                if (Ext.isIE8m) return;

                if (!this.dir) {
                    var point = this.getStartPoint();
                    this.dir = point.dir;
                    x = point.x;
                    y = point.y;
                }

                if (this.steps < 500) {
                    this.steps++;
                } else {
                    t.fail('Too many steps');
                    return null;
                }

                var elAtCurrentPoint = document.elementFromPoint(x, y);
                var nextPoint = this.getNextPoint(x, y);
                var nextEl    = document.elementFromPoint.apply(document, nextPoint);

                this.markPixel(x, y);

                if (!Ext.fly(elAtCurrentPoint).hasCls('sch-dependency')) {
                    t.fail('Step: ' + this.steps + ': Gap found at ' + x + ',' + y);
                    return null;
                }

                if (Ext.fly(nextEl).hasCls('sch-dependency-arrow')) {
                    this.markPixel(nextPoint[0], nextPoint[1]);

                    t.pass('Was able to walk to the arrow');

                    var xy = [x, y];
                    var i = 0;
                    var node = nextEl;

                    while(node.className.match('sch-dependency-arrow') || i < 1) {
                        xy = this.getNextPoint(xy[0], xy[1]);

                        node = document.elementFromPoint.apply(document, xy);

                        if (!node.className.match('sch-dependency-arrow')) {
                            i++;
                        }
                    }
                    
                    // step one extra pixel in the same direction
                    // this fixes one failure in FF
                    xy          = this.getNextPoint(xy[0], xy[1]);

                    var el = document.elementFromPoint(xy[0], xy[1]);

                    return {
                        arrowEl         : nextEl,
                        targetTaskEl    : el
                    };
                }

                if (elAtCurrentPoint === nextEl) {
                    // Keep walking same direction
                    return this.walkToArrow(nextPoint[0], nextPoint[1]);
                } else {
                    // New direction
                    this.dir = this.getNewDirection(nextPoint[0], nextPoint[1]);
                    var nextXY = this.getNextPoint(nextPoint[0], nextPoint[1]);

                    this.markPixel(nextPoint[0], nextPoint[1]);

                    return this.walkToArrow(nextXY[0], nextXY[1]);
                }
            },

            verifyTaskBar : function(gantt, result, taskId) {
                if (Ext.isIE8m) return;

                var el = result.targetTaskEl;
                var taskEl = el.className.match('sch-gantt-item') ? Ext.get(el) : Ext.fly(el).up('.sch-gantt-item');

                var task = taskEl && gantt.getSchedulingView().resolveTaskRecord(taskEl);

                t.ok(task, 'Found a task after the arrow');
                t.is(task && task.data.Id, taskId, 'Found target task');
            },

            verifyLinesAndArrow : function(gantt, data) {
                if (Ext.isIE8m) return;

                var dir = data.dir;

                if (rtl) {
                    if      (dir === 'left') dir = 'right';
                    else if (dir === 'right') dir = 'left';
                }

                t.is(gantt.el.select('.sch-dependency-line').getCount(), data.nbrLines, 'Should find ' + data.nbrLines + ' lines');
                t.is(gantt.el.select('.sch-dependency-arrow-' + dir).getCount(), 1, 'Should find arrow pointing ' + dir);
            }
        });
    };

    // ------ EOF SETUP
    var getGantt = function (tasks, dependencies) {
        var g = t.getGantt2({
            width               : 200,
            height              : 120,
            forceFit            : true,
            style               : 'float:left',
            renderTo            : Ext.getBody(),
            startDate           : new Date(2010, 1, 1),
            endDate             : new Date(2010, 1, 11),
            rtl                 : rtl,
            viewConfig          : {
                deferInitialRefresh     : false,
                dependencyViewConfig    : { lineWidth : 2 }
            },
            dependencyStore     : t.getDependencyStore({
                data : dependencies
            }),
            taskStore           : new Gnt.data.TaskStore({
                root : { children : tasks }
            })
        });

        // Put dependencies above tasks
        g.el.select('.sch-event-wrap').setStyle('z-index', 0);

        return g;
    }

    t.it('End to Start, 2 lines', function(t) {

        gantt = getGantt(
            [
                { leaf : true, Id : 1, StartDate : new Date(2010, 1, 3), Duration : 2 },
                { leaf : true, Id : 2, StartDate : new Date(2010, 1, 5), Duration : 2 }
            ],

            [ { From : 1, To : 2, Type : Type.EndToStart} ]
        )

        t.waitForTasksAndDependenciesToRender(gantt, function() {

            var walker = new Walker(t, gantt, gantt.dependencyStore.first());
            var result = walker.walkToArrow();
            walker.verifyTaskBar(gantt, result, 2);

            walker.verifyLinesAndArrow(gantt, {
                nbrLines : 2,
                dir      : 'down'
            });
        })
    });

    t.it('End to Start, target before/below source', function(t) {

        gantt = getGantt(
            [
                { leaf : true, Id : 1, StartDate : new Date(2010, 1, 5), Duration : 2 },
                { leaf : true, Id : 2, StartDate : new Date(2010, 1, 3), Duration : 2 }
            ],

            [ { From : 1, To : 2, Type : Type.EndToStart} ]
        )

        t.waitForTasksAndDependenciesToRender(gantt, function() {

            var walker = new Walker(t, gantt, gantt.dependencyStore.first());
            var result = walker.walkToArrow();
            walker.verifyTaskBar(gantt, result, 2);

            walker.verifyLinesAndArrow(gantt, {
                nbrLines : 5,
                dir      : 'right'
            });
        })
    })

    t.it('End to Start, target before/above source', function(t){


        gantt = getGantt(
            [
                { leaf : true, Id : 1, StartDate : new Date(2010, 1, 3), Duration : 2 },
                { leaf : true, Id : 2, StartDate : new Date(2010, 1, 7), Duration : 2 }
            ],

            [ { From : 2, To : 1, Type : Type.EndToStart} ]
        )

        t.waitForTasksAndDependenciesToRender(gantt, function() {

            var walker = new Walker(t, gantt, gantt.dependencyStore.first());
            var result = walker.walkToArrow();
            walker.verifyTaskBar(gantt, result, 1);

            walker.verifyLinesAndArrow(gantt, {
                nbrLines : 5,
                dir      : 'right'
            });
        })
    })

    t.it('End to Start, target after/above source', function(t) {

        gantt = getGantt(
            [
                { leaf : true, Id : 1, StartDate : new Date(2010, 1, 9), Duration : 2 },
                { leaf : true, Id : 2, StartDate : new Date(2010, 1, 2), Duration : 2 }
            ],

            [ { From : 2, To : 1, Type : Type.EndToStart} ]
        )

        t.waitForTasksAndDependenciesToRender(gantt, function() {

            var walker = new Walker(t, gantt, gantt.dependencyStore.first());
            var result = walker.walkToArrow();
            walker.verifyTaskBar(gantt, result, 1);

            walker.verifyLinesAndArrow(gantt, {
                nbrLines : 3,
                dir      : 'right'
            });
        })
    });

    t.it('End to Start, milestones', function(t){

        gantt = getGantt(
            [
                { leaf : true, Id : 1, StartDate : new Date(2010, 1, 9), Duration : 0 },
                { leaf : true, Id : 2, StartDate : new Date(2010, 1, 9), Duration : 0 }
            ],

            [ { From : 1, To : 2, Type : Type.EndToStart} ]
        )

        t.waitForTasksAndDependenciesToRender(gantt, function() {

            var walker = new Walker(t, gantt, gantt.dependencyStore.first());
            var result = walker.walkToArrow();
            walker.verifyTaskBar(gantt, result, 2);

            walker.verifyLinesAndArrow(gantt, {
                nbrLines : 5,
                dir      : 'right'
            });
        })
    });

    t.it('End to Start, zero width', function(t){

        gantt = getGantt(
            [
                { leaf : true, Id : 1, StartDate : new Date(2010, 1, 9), Duration : 1, DurationUnit : 'mi' },
                { leaf : true, Id : 2, StartDate : new Date(2010, 1, 9, 0, 1), Duration : 1, DurationUnit : 'mi' }
            ],

            [ { From : 1, To : 2, Type : Type.EndToStart} ]
        )

        t.waitForTasksAndDependenciesToRender(gantt, function() {

            var walker = new Walker(t, gantt, gantt.dependencyStore.first());
            var result = walker.walkToArrow();
            walker.verifyTaskBar(gantt, result, 2);

            walker.verifyLinesAndArrow(gantt, {
                nbrLines : 2,
                dir      : 'down'
            });
        })
    });

    t.it('Start to Start', function(t) {

        gantt = getGantt(
            [
                { leaf : true, Id : 1, StartDate : new Date(2010, 1, 6), Duration : 5 },
                { leaf : true, Id : 2, StartDate : new Date(2010, 1, 6), Duration : 5 }
            ],

            [ { From : 1, To : 2, Type : Type.StartToStart} ]
        )

        t.waitForTasksAndDependenciesToRender(gantt, function() {

            var walker = new Walker(t, gantt, gantt.dependencyStore.first());
            var result = walker.walkToArrow();
            walker.verifyTaskBar(gantt, result, 2);

            walker.verifyLinesAndArrow(gantt, {
                nbrLines : 3,
                dir      : 'right'
            });
        })
    });

    t.it('Start to Start 2', function(t) {

        gantt = getGantt(
            [
                { leaf : true, Id : 1, StartDate : new Date(2010, 1, 6), Duration : 5 },
                { leaf : false, Id : 2, StartDate : new Date(2010, 1, 6), Duration : 5 }
            ],

            [ { From : 1, To : 2, Type : Type.StartToStart} ]
        )

        t.waitForTasksAndDependenciesToRender(gantt, function() {

            var walker = new Walker(t, gantt, gantt.dependencyStore.first());
            var result = walker.walkToArrow();
            walker.verifyTaskBar(gantt, result, 2);

            walker.verifyLinesAndArrow(gantt, {
                nbrLines : 3,
                dir      : 'right'
            });
        })
    });

    t.it('Start to Start Milestone', function(t) {

        gantt = getGantt(
            [
                { leaf : true, Id : 1, StartDate : new Date(2010, 1, 6), Duration : 0 },
                { leaf : false, Id : 2, StartDate : new Date(2010, 1, 6), Duration : 0 }
            ],

            [ { From : 1, To : 2, Type : Type.StartToStart} ]
        )

        t.waitForTasksAndDependenciesToRender(gantt, function() {

            var walker = new Walker(t, gantt, gantt.dependencyStore.first());
            var result = walker.walkToArrow();
            walker.verifyTaskBar(gantt, result, 2);

            walker.verifyLinesAndArrow(gantt, {
                nbrLines : 3,
                dir      : 'right'
            });
        })
    });

    t.it('Start to Start', function(t) {

        gantt = getGantt(
            [
                { leaf : true, Id : 1, StartDate : new Date(2010, 1, 6), Duration : 5 },
                { leaf : true, Id : 2, StartDate : new Date(2010, 1, 8), Duration : 5 }
            ],

            [ { From : 1, To : 2, Type : Type.StartToStart} ]
        )

        t.waitForTasksAndDependenciesToRender(gantt, function() {

            var walker = new Walker(t, gantt, gantt.dependencyStore.first());
            var result = walker.walkToArrow();
            walker.verifyTaskBar(gantt, result, 2);

            walker.verifyLinesAndArrow(gantt, {
                nbrLines : 3,
                dir      : 'right'
            });
        })
    });

    t.it('End to End', function(t) {

        gantt = getGantt(
            [
                { leaf : true, Id : 1, StartDate : new Date(2010, 1, 4), Duration : 2 },
                { leaf : true, Id : 2, StartDate : new Date(2010, 1, 4), Duration : 2 }
            ],

            [ { From : 1, To : 2, Type : Type.EndToEnd} ]
        )

        t.waitForTasksAndDependenciesToRender(gantt, function() {

            var walker = new Walker(t, gantt, gantt.dependencyStore.first());
            var result = walker.walkToArrow();
            walker.verifyTaskBar(gantt, result, 2);

            walker.verifyLinesAndArrow(gantt, {
                nbrLines : 3,
                dir      : 'left'
            });
        })
    });

    t.it('End to End 2', function(t) {
        gantt = getGantt(
            [
                { leaf : true, Id : 1, StartDate : new Date(2010, 1, 4), Duration : 2 },
                { leaf : false, Id : 2, StartDate : new Date(2010, 1, 4), Duration : 2 }
            ],

            [ { From : 1, To : 2, Type : Type.EndToEnd} ]
        )

        t.waitForTasksAndDependenciesToRender(gantt, function() {

            var walker = new Walker(t, gantt, gantt.dependencyStore.first());
            var result = walker.walkToArrow();
            walker.verifyTaskBar(gantt, result, 2);

            walker.verifyLinesAndArrow(gantt, {
                nbrLines : 3,
                dir      : 'left'
            });
        })
    });

    t.it('End to End 3: Milestones', function(t) {

        gantt = getGantt(
            [
                { leaf : true, Id : 1, StartDate : new Date(2010, 1, 4), Duration : 0 },
                { leaf : false, Id : 2, StartDate : new Date(2010, 1, 4), Duration : 0 }
            ],

            [ { From : 1, To : 2, Type : Type.EndToEnd} ]
        )

        t.waitForTasksAndDependenciesToRender(gantt, function() {

            var walker = new Walker(t, gantt, gantt.dependencyStore.first());
            var result = walker.walkToArrow();
            walker.verifyTaskBar(gantt, result, 2);

            walker.verifyLinesAndArrow(gantt, {
                nbrLines : 3,
                dir      : 'left'
            });
        })
    });

    t.it('Start to End', function(t) {

        gantt = getGantt(
            [
                { leaf : true, Id : 1, StartDate : new Date(2010, 1, 4), Duration : 2 },
                { leaf : true, Id : 2, StartDate : new Date(2010, 1, 4), Duration : 2 }
            ],

            [ { From : 1, To : 2, Type : Type.StartToEnd} ]
        )

        t.waitForTasksAndDependenciesToRender(gantt, function() {

            var walker = new Walker(t, gantt, gantt.dependencyStore.first());
            var result = walker.walkToArrow();
            walker.verifyTaskBar(gantt, result, 2);

            walker.verifyLinesAndArrow(gantt, {
                nbrLines : 5,
                dir      : 'left'
            });
        })
    });

    t.it('Start to End, target below, before source', function(t) {

        gantt = getGantt(
            [
                { leaf : true, Id : 1, StartDate : new Date(2010, 1, 10), Duration : 2 },
                { leaf : true, Id : 2, StartDate : new Date(2010, 1, 4), Duration : 2 }
            ],

            [ { From : 1, To : 2, Type : Type.StartToEnd} ]
        )

        t.waitForTasksAndDependenciesToRender(gantt, function() {

            var walker = new Walker(t, gantt, gantt.dependencyStore.first());
            var result = walker.walkToArrow();
            walker.verifyTaskBar(gantt, result, 2);

            walker.verifyLinesAndArrow(gantt, {
                nbrLines : 3,
                dir      : 'left'
            });
        })
    });

    t.it('Start to End, milestone', function(t) {

        gantt = getGantt(
            [
                { leaf : true, Id : 1, StartDate : new Date(2010, 1, 10), Duration : 0 },
                { leaf : true, Id : 2, StartDate : new Date(2010, 1, 4), Duration : 0 }
            ],

            [ { From : 1, To : 2, Type : Type.StartToEnd} ]
        )

        t.waitForTasksAndDependenciesToRender(gantt, function() {

            var walker = new Walker(t, gantt, gantt.dependencyStore.first());
            var result = walker.walkToArrow();
            walker.verifyTaskBar(gantt, result, 2);

            walker.verifyLinesAndArrow(gantt, {
                nbrLines : 3,
                dir      : 'left'
            });
        })
    });
});
