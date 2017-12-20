/* globals Gnt: true */
StartTest(function (t) {
    var gantt;

    var setup = function (config) {
        gantt && gantt.destroy();

        gantt = t.getGantt(Ext.apply({
            renderTo    : Ext.getBody(),
            startDate   : new Date(2010, 1, 1),
            endDate     : new Date(2011, 1, 1),
            viewPreset  : 'monthAndYear',
            height      : 200,
            width       : 500,
            columns     : [{ xtype : 'treecolumn', width : 50 }],
            taskStore  : new Gnt.data.TaskStore({
                root : {
                    children : [
                        {
                            Name        : 'foo',
                            leaf        : true,
                            StartDate   : new Date(2010, 10, 1),
                            EndDate     : new Date(2010, 11, 1)
                        }
                    ]
                }
            })
        }, config));
    };

    t.it('should support scrollIntoView', function(t) {
        setup();

        t.chain(
            { waitForRowsVisible : gantt },

            function(next) {
                var view = gantt.getSchedulingView(),
                    viewEl = view.el;

                t.waitForScrollLeftChange(viewEl, next);
                view.scrollEventIntoView(gantt.taskStore.getRootNode().firstChild);
            },

            function (next, scrollValue) {
                t.isGreater(scrollValue, 0, 'Scrolled right direction');

                t.waitFor(300, next);
            },

            function() {
                var eventEl = gantt.el.down('.sch-gantt-task-bar');
                t.ok(eventEl, 'Should find event el in the DOM');

                t.elementIsTopElement(eventEl, true, 'Should find event visible in the viewport');
            }
        );
    });

    t.it('should support scrollIntoView if target node is in a collapsed root', function(t) {
        setup();

        t.chain(
            { waitForRowsVisible : gantt },
            function(next) {
                var view = gantt.getSchedulingView(),
                    task = gantt.taskStore.getRootNode().firstChild,
                    viewEl = view.el;

                gantt.taskStore.getRootNode().collapse();

                gantt.setTimeSpan(new Date(2009, 1, 1), new Date(2010, 1, 1));
                view.scrollEventIntoView(task);
                next();
            },
            { waitFor : 500 },

            function () {
                var task = gantt.taskStore.getRootNode().firstChild;
                var eventEl = gantt.el.down('.sch-gantt-task-bar');

                t.ok(eventEl, 'Should find event el in the DOM');
                t.isLess(gantt.getStartDate(), task.getStartDate(), 'Should find start date in axis');
                t.isGreater(gantt.getEndDate(), task.getEndDate(), 'Should find end date in axis');
                t.elementIsTopElement(eventEl, true, 'Should find event visible in the viewport');
            }
        );
    });

    t.it('should support scrollIntoView if target task has no date info, should scroll to row', function(t) {
        setup();
        
        t.chain(
            { waitForRowsVisible : gantt },
            function(next) {
                var view = gantt.getSchedulingView(),
                    store = gantt.taskStore,
                    viewEl = view.el;

                store.getRootNode().removeAll();

                for(var i = 0; i < 20; i++) store.getRootNode().appendChild({ Name : 'task ' + i });

                var task = store.getRootNode().lastChild;
                view.scrollEventIntoView(task);
                next();
            },

            { waitFor : 500 },

            function () {
                var lastRowCellEl = t.safeSelect(Ext.grid.View.prototype.itemSelector + ':last-child .x-grid-cell-inner', gantt.lockedGrid.el.dom);
                t.elementIsTopElement(lastRowCellEl, true, 'Should find event visible in the viewport');
            }
        );
    });

    t.it('should support scrollIntoView in buffered views', function(t) {
        setup({
            plugins   : 'bufferedrenderer',
            columns   : [{ xtype : 'treecolumn', dataIndex : 'Name' }],
            taskStore : new Gnt.data.TaskStore({
                sortOnLoad : false,

                root : {
                    expanded : true,
                    children : t.getLargeDataset()
                }
            })
        });
        
        var task;

        t.chain(
            { waitForRowsVisible : gantt },

            function (next) {
                task = new Gnt.model.Task({ Name : 'foo', cls : 'bar' });

                gantt.taskStore.getRootNode().appendChild(task);
                gantt.getSchedulingView().scrollEventIntoView(task, false, false, next);
            },

            // Should find task visible in the viewport
            { waitForElementTop : '.bar' }
        );
    });

    t.it('Should correct node into view when store is filtered', function (t) {
        setup({
            columns   : [{ xtype : 'treecolumn', dataIndex : 'Name' }],
            startDate : new Date(2010, 0, 3),
            endDate : new Date(2010, 0, 6),
            viewPreset : 'dayAndWeek',
            taskStore : t.getTaskStore({
                DATA : (function () {
                    var data = [];

                    for (var i = 0; i < 1000; i++) {
                        data.push({
                            StartDate : '2010-01-04',
                            Duration : '1',
                            Id : i + 1,
                            Name : i + 1,
                            leaf : true
                        });
                    }

                    return data;
                })()
            })
        });

        var view = gantt.getSchedulingView();
        var task = gantt.taskStore.getById(150);

        t.chain(
            { waitForEventsToRender : gantt },
            function (next) {
                gantt.taskStore.filterTreeBy(function (task) {
                    return task.getId() % 2 === 0;
                });

                view.scrollEventIntoView(task, false, null, next);
            },
            function () {
                t.is(view.getElementsFromEventRecord(task).length, 1, 'Task is rendered');
            }
        )
    });
});