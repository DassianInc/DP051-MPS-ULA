describe('Indent tests', function (t) {

    var g;

    var getFocusedRow = function (gantt, task) {
        window.focus();
        var activeElement = t.activeElement();
        var itemSelector = Gnt.view.Gantt.prototype.itemSelector;
        var focusedEl = Ext.fly(activeElement).up(itemSelector);

        return focusedEl && (focusedEl.dom === gantt.lockedGrid.view.getNode(task) ||
            focusedEl.dom === gantt.normalGrid.view.getNode(task));
    }

    var assertFocusedRow = function (t, gantt, task, title) {
        t.ok(getFocusedRow(gantt, task), title);
    };

    t.beforeEach(function () {
        g && g.destroy();
    })

    t.it('After indent, row selection/focus should be kept', function (t) {

        g = t.getGantt({
            lockedGridConfig : {
                width : 100
            },
            height           : 200,
            renderTo         : Ext.getBody(),
            taskStore        : new Gnt.data.TaskStore({
                proxy : 'memory',
                root  : {
                    children : [
                        {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {},
                        {Id : 1, leaf : true},
                        {Id : 2, leaf : true}
                    ]
                }
            })
        });

        var id = function (id) {
            return g.taskStore.getNodeById(id);
        }

        var task2 = id(2);
        var vertScroll;
        var lockedView = g.lockedGrid.view;

        t.chain(
            {waitForRowsVisible : g},

            function (next) {
                t.todo(function (t) {
                    t.wontFire(lockedView, 'refresh');
                }, 'Ext fires lots of refreshes in this case');

                // Seems focusRow is now async
                t.waitFor(function () {
                    return lockedView.el.dom.scrollTop > 0
                }, next);

                // focusItem is disabled in IE by us
                if (Ext.isIE) {
                    lockedView.scrollBy(0, 1000);
                } else {
                    lockedView.focusRow(task2);
                }
            },

            function (next) {
                vertScroll = lockedView.el.dom.scrollTop;

                // focusItem is disabled in IE by us
                if (!Ext.isIE) {
                    assertFocusedRow(t, g, task2, 'Focus correct after calling focusRow');
                }
                t.waitForEvent(g.taskStore, 'indentationchange', next);
                g.taskStore.indent(task2);
            },

            {
                waitFor : function () {
                    return Ext.isIE ? true : getFocusedRow(g, task2);
                }
            },

            function (next) {
                // focusItem is disabled in IE by us
                if (!Ext.isIE) {
                    assertFocusedRow(t, g, task2, "Correct row re-focused after indent");
                }
                t.is(lockedView.el.dom.scrollTop, vertScroll, 'Vertical scroll should not change');

                next();
            },

            function (next) {
                g.normalGrid.view.focusRow(task2);

                // focusItem is disabled in IE by us
                if (!Ext.isIE) {
                    assertFocusedRow(t, g, task2, "Correct row focused after indent");
                }
                t.waitForEvent(g.taskStore, 'indentationchange', next);
                g.taskStore.outdent(task2);
            },

            function (next) {

                // The Ext JS table panel will focus one of the locked/normal row els
                if (!Ext.isIE) {
                    assertFocusedRow(t, g, task2, "Correct row focused after outdent");
                }
                t.is(lockedView.el.dom.scrollTop, vertScroll, 'Vertical scroll should not change when removing last row');
            }
        );
    });

    t.it('No refreshes should be performed with buffered view when indenting', function (t) {

        g = t.getGantt({
            lockedGridConfig : {
                width : 100
            },
            plugins          : 'bufferedrenderer',
            height           : 200,
            renderTo         : Ext.getBody(),
            taskStore        : new Gnt.data.TaskStore({
                proxy : 'memory',
                root  : {
                    children : [
                        {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {},
                        {Id : 1, leaf : true},
                        {Id : 2, leaf : true},
                        {Id : 3, leaf : true},
                        {Id : 4, leaf : true}
                    ]
                }
            })
        });

        var id = function (id) {
            return g.taskStore.getNodeById(id);
        }

        var lockedView = g.lockedGrid.view;

        t.chain(
            {waitForRowsVisible : g},

            function (next) {
                var before = t.getTotalLayoutCounter();

                t.todo(function (t) {
                    t.firesOnce(lockedView, 'refresh');
                }, 'Ext fires lots of refreshes in this case');

                g.taskStore.indent([id(1), id(2), id(3), id(4)]);

                // We use suspendLayouts to limit the amount of Ext layouts
                t.isLess(t.getTotalLayoutCounter(), before + 10, 'Should not cause excessive layouts for indent');
            }
        );
    });

    t.it('Should support indent/outdent while filtered', function (t) {

        g = t.getGantt({
            renderTo         : Ext.getBody(),
            bufferedRenderer : false,
            taskStore : new Gnt.data.TaskStore({
                root             : {
                    expanded : true,
                    children : [
                        {
                            "Id"                : 1000,
                            "StartDate"         : "2010-01-13",
                            "EndDate"           : "2010-02-13",
                            "Name"              : "Project A",
                            "TaskType"          : "Gnt.examples.advanced.model.Project",
                            "Description"       : "Project A description",
                            "ManuallyScheduled" : true,
                            "AllowDependencies" : true,
                            "iconCls"           : "projectIcon",
                            "expanded"          : true,

                            children : [
                                {
                                    Name     : 'parent 2',
                                    expanded : true,
                                    children : [
                                        {},
                                        {},
                                        {},
                                        {
                                            Id   : 4,
                                            leaf : true,
                                            Name : 'child'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            })
        });

        t.chain(
            {waitForRowsVisible : g},

            function (next) {
                g.taskStore.filterTreeBy(function(node) { return node.getName().match('chil'); });
                //
                g.taskStore.outdent(g.taskStore.getNodeById(4));

                t.todo(function(t) {
                    t.is(g.lockedGrid.getView().getNodes().length, 2);
                    t.selectorExists('.x-grid-item:first-child:contains(Project A)')
                    t.selectorExists('.x-grid-item:last-child:contains(child)')
                }, 'https://www.assembla.com/spaces/bryntum/tickets/2171#/activity/ticket')
            }
        );
    });
});
