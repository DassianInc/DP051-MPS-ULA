StartTest(function (t) {
    t.diag('Creating a new dependency using drag drop');

    var gantt;

    var getGantt        = function (cfg) {
        gantt && gantt.destroy();

        gantt = t.getGantt2(Ext.apply({
            startDate       : new Date(2011, 6, 1),
            endDate         : new Date(2011, 6, 28),
            renderTo        : Ext.getBody()
        }, cfg));

        return gantt;
    };

    var getDataSet = function (cfg) {
        cfg                 = cfg || {};

        var dependencyStore = t.getDependencyStore(Ext.apply({ data : [] }, cfg.dependencyStore));

        var taskStore       = t.getTaskStore(Ext.apply({
            cascadeDelay    : 0,
            dependencyStore : dependencyStore,

            DATA : [
                {
                    Id        : 1,
                    leaf      : true,
                    Name      : 'Foo',
                    StartDate : new Date(2011, 6, 1),
                    EndDate   : new Date(2011, 6, 5),
                    Cls       : 'T1'
                },
                {
                    Id        : 2,
                    leaf      : true,
                    Name      : 'Bar',
                    StartDate : new Date(2011, 6, 5),
                    EndDate   : new Date(2011, 6, 7),
                    Cls       : 'T2'
                }
            ]
        }, cfg.taskStore));

        return {
            taskStore       : taskStore,
            dependencyStore : dependencyStore
        };
    };


    var assertDragDropLabels = function (t, fromLabel, toLabel){

        var toolTip = Ext.getBody().down('.sch-dd-dependency');

        t.ok(toolTip, 'Tooltip is here');

        var from =  toolTip.down('.sch-dd-dependency-from');

        t.ok(from, 'From label is there');

        var fromNameEl = toolTip.down('.sch-dd-dependency-from-name');

        t.ok(fromNameEl, 'From name is there');

        t.contentLike(fromNameEl, fromLabel, 'From label is correct');

        var to = toolTip.down('.sch-dd-dependency-to');

        t.ok(to, 'To label is there');

        var toName = toolTip.down('.sch-dd-dependency-to-name');

        t.ok(toName, 'To name is there');

        var toNameValue = toolTip.down('span.sch-dd-dependency-to-name');

        t.contentLike(toNameValue, toLabel, 'To label is correct');

    };

    t.it('Should be possible to setup a dependency between two regular tasks using drag drop', function (t) {
        var dataSet         = getDataSet();
        var dependencyStore = dataSet.dependencyStore;

        getGantt(dataSet);

        t.chain(
            { moveCursorTo : [1, 1] },

            { moveCursorTo : '.sch-gantt-item' },

            { action : 'moveCursorTo', target : '.sch-gantt-item .sch-gantt-terminal-start' },

            { action : 'mouseDown' },

            { moveCursorTo : '.sch-ganttview ' + Ext.grid.View.prototype.itemSelector + ':last-child .sch-gantt-item' },

            { moveCursorTo : '.sch-ganttview ' + Ext.grid.View.prototype.itemSelector + ':last-child .sch-gantt-terminal-start' },

            function (next) {
                t.selectorExists('.sch-gantt-connector-proxy', 'Should find sch-gantt-connector-proxy class during drag drop');
                t.selectorExists('.sch-gantt-dep-dd-dragging', 'Should find sch-gantt-dep-dd-dragging class added to the view container el');
                t.selectorExists('.sch-ganttview ' + Ext.grid.View.prototype.itemSelector + ':last-child .sch-gantt-terminal-start.sch-gantt-terminal-drophover', 'Should find sch-gantt-terminal-drophover class added to the target connector el');

                assertDragDropLabels(t, 'Foo', 'Bar');
                next();
            },

            { action : 'mouseUp' },

            { waitFor : 1000 },

            function (next) {
                t.selectorNotExists('.sch-gantt-connector-proxy', 'Should not find sch-gantt-connector-proxy after drop');
                t.selectorNotExists('.sch-gantt-dep-dd-dragging', 'Should not find sch-gantt-dep-dd-dragging class after drop');
                next();
            },

            function () {
                var depView = gantt.getSchedulingView().getDependencyView();
                var els = depView.getDependencyElements();
                t.is(dependencyStore.getCount(), 1, '1 dependency in store');
                t.isGreater(els.getCount(), 0, '1 dependency rendered');

                var depRecord = dependencyStore.first();
                els = depView.getElementsForDependency(depRecord);

                // At least one arrow element + the lines, so always 2 or more
                t.isGreater(els.getCount(), 1, 'Found rendered dependency elements');

                // Verify dependency els are 'below' task elements
                var firstTaskEl = t.getFirstTaskEl(gantt);

                // Move dependency element on top of task
                els.first().setXY(firstTaskEl.getXY());
                t.elementIsNotTopElement(els.first(), true, 'Task found on top of dependency el');
            }
        );
    });

    t.it('Should be possible to setup a dependency between two milestone tasks using drag drop', function (t) {
        var dataSet         = getDataSet();
        var taskStore       = dataSet.taskStore;
        var dependencyStore = dataSet.dependencyStore;

        getGantt(dataSet);

        taskStore.getNodeById(1).setStartEndDate(new Date(2011, 6, 1), new Date(2011, 6, 1));
        taskStore.getNodeById(2).setStartEndDate(new Date(2011, 6, 1), new Date(2011, 6, 1));

        t.chain(
            { moveCursorTo : [1, 1] },
            { moveCursorTo : '.sch-gantt-item' },

            { moveCursorTo : '.sch-gantt-item .sch-gantt-terminal-start' },

            { action : 'mouseDown' },

            { moveCursorTo : '.sch-ganttview ' + Ext.grid.View.prototype.itemSelector + ':last-child .sch-gantt-item' },

            { moveCursorTo : '.sch-ganttview ' + Ext.grid.View.prototype.itemSelector + ':last-child .sch-gantt-terminal-start' },

            function (next) {
                t.selectorExists('.sch-gantt-connector-proxy', 'Should find sch-gantt-connector-proxy class during drag drop');
                t.selectorExists('.sch-gantt-dep-dd-dragging', 'Should find sch-gantt-dep-dd-dragging class added to the view container el');
                t.selectorExists('.sch-ganttview ' + Ext.grid.View.prototype.itemSelector + ':last-child .sch-gantt-terminal-start.sch-gantt-terminal-drophover', 'Should find sch-gantt-terminal-drophover class added to the target connector el');

                assertDragDropLabels(t, 'Foo', 'Bar');

                next();
            },

            { action : 'mouseUp' },

            { waitFor : 1000 },

            function (next) {
                t.selectorNotExists('.sch-gantt-connector-proxy', 'Should not find sch-gantt-connector-proxy after drop');
                t.selectorNotExists('.sch-gantt-dep-dd-dragging', 'Should not find sch-gantt-dep-dd-dragging class after drop');
                next();
            },

            function () {
                var depView = gantt.getSchedulingView().getDependencyView();
                var els = depView.getDependencyElements();
                t.is(dependencyStore.getCount(), 1, '1 dependency in store');
                t.isGreater(els.getCount(), 0, '1 dependency rendered');

                var depRecord = dependencyStore.first();
                els = depView.getElementsForDependency(depRecord);

                // At least one arrow element + the lines, so always 2 or more
                t.isGreater(els.getCount(), 1, 'Found rendered dependency elements');

                // Verify dependency els are 'below' task elements
                var firstTaskEl = t.getFirstTaskEl(gantt);

                // Move dependency element on top of task
                els.first().setXY(firstTaskEl.getXY());
                t.elementIsNotTopElement(els.first(), true, 'Task found on top of dependency el');
            }
        );
    });

    t.it('Should be possible to prevent certain types of dependencies', function (t) {
        Ext.define('Sch.depStore', {
            extend              : 'Gnt.data.DependencyStore',

            isValidDependency   : function (from, to, type) {
                t.is(type, Gnt.model.Dependency.Type.StartToStart, 'isValidDependency called with type property');

                return type !== Gnt.model.Dependency.Type.StartToStart &&
                       this.callParent(arguments);
            }
        });

        var dataSet         = getDataSet({
            dependencyStore : {
                xclass : 'Sch.depStore'
            }
        });

        var dependencyStore = dataSet.dependencyStore;

        t.wontFire(dependencyStore, 'add');

        getGantt(dataSet);

        t.chain(
            { moveCursorTo : [1, 1] },
            { moveCursorTo : '.sch-gantt-item' },

            { moveCursorTo : '.sch-gantt-item .sch-gantt-terminal-start' },

            { action : 'mouseDown' },

            { moveCursorTo : '.sch-ganttview ' + Ext.grid.View.prototype.itemSelector + ':last-child .sch-gantt-item' },

            { moveCursorTo : '.sch-ganttview ' + Ext.grid.View.prototype.itemSelector + ':last-child .sch-gantt-terminal-start' },

            function (next) {
                t.selectorExists('.sch-gantt-connector-proxy', 'Should find sch-gantt-connector-proxy class during drag drop');
                t.selectorExists('.sch-gantt-dep-dd-dragging', 'Should find sch-gantt-dep-dd-dragging class added to the view container el');
                t.selectorExists('.sch-ganttview ' + Ext.grid.View.prototype.itemSelector + ':last-child .sch-gantt-terminal-start.sch-gantt-terminal-drophover', 'Should find sch-gantt-terminal-drophover class added to the target connector el');

                // Lowercase to please IE8 which uses uppercase tag names
                assertDragDropLabels(t, 'Foo', 'Bar');
                next();
            },

            { action : 'mouseUp' },

            { waitFor : 1000 },

            function (next) {
                t.selectorNotExists('.sch-gantt-connector-proxy', 'Should not find sch-gantt-connector-proxy after drop');
                t.selectorNotExists('.sch-gantt-dep-dd-dragging', 'Should not find sch-gantt-dep-dd-dragging class after drop');
                next();
            },

            function () {
                t.is(dependencyStore.getCount(), 0, 'No dependencies in store');
            }
        );
    });

    t.it('Should see the dependency proxy connector line after a view refresh too', function (t) {

        getGantt(getDataSet());

        t.chain(
            { moveCursorTo : [1, 1] },
            { moveCursorTo : '.sch-gantt-item' },

            { moveCursorTo : '.sch-gantt-item .sch-gantt-terminal-start' },

            { action : 'mouseDown' },

            { moveCursorTo : '.sch-ganttview ' + Ext.grid.View.prototype.itemSelector + ':last-child .sch-gantt-item' },

            { moveCursorTo : '.sch-ganttview ' + Ext.grid.View.prototype.itemSelector + ':last-child .sch-gantt-terminal-start' },

            function (next) {
                t.selectorExists('.sch-gantt-connector-proxy', 'Should find sch-gantt-connector-proxy class during drag drop');
                t.selectorExists('.sch-gantt-dep-dd-dragging', 'Should find sch-gantt-dep-dd-dragging class added to the view container el');
                t.selectorExists('.sch-ganttview ' + Ext.grid.View.prototype.itemSelector + ':last-child .sch-gantt-terminal-start.sch-gantt-terminal-drophover', 'Should find sch-gantt-terminal-drophover class added to the target connector el');

                // Lowercase to please IE8 which uses uppercase tag names
                //var ddProxyContent = Ext.getBody().down('.sch-dd-dependency').dom.innerHTML.toLowerCase();

                //t.like(ddProxyContent, 'from: <strong>foo</strong> - start', 'Should find proper From text');
                //t.like(ddProxyContent, 'to: <strong>bar</strong> - start', 'Should find proper To text');
                assertDragDropLabels(t, 'Foo', 'Bar');
                next();
            },

            { action : 'mouseUp' },

            { waitFor : 1000 },

            function (next) {
                t.selectorNotExists('.sch-gantt-connector-proxy', 'Should not find sch-gantt-connector-proxy after drop');
                t.selectorNotExists('.sch-gantt-dep-dd-dragging', 'Should not find sch-gantt-dep-dd-dragging class after drop');
                next();
            },

            function (next) {
                gantt.getView().refresh();
                next();
            },

            { moveCursorTo : '.sch-gantt-item', offset : ['50%', 7]  },

            { moveCursorTo : '.sch-gantt-item .sch-gantt-terminal-start' },

            { action : 'mouseDown' },

            { moveCursorTo : '.sch-ganttview ' + Ext.grid.View.prototype.itemSelector + ':last-child .sch-gantt-item' },

            function () {
                t.selectorExists('.sch-gantt-connector-proxy', 'Should find sch-gantt-connector-proxy class during drag drop');
                t.selectorExists('.sch-gantt-dep-dd-dragging', 'Should find sch-gantt-dep-dd-dragging class added to the view container el');
                t.mouseUp();
            }
        );
    });

    t.it('Should disable creating dependencies', function (t) {
        var dataSet         = getDataSet();
        var dependencyStore = dataSet.dependencyStore;

        getGantt(dataSet);

        t.livesOk(function () {
            dependencyStore.add({
                From    : 1,
                To      : 2,
                Type    : 1
            });
        }, 'Dependency added without restrictions');

        dependencyStore.removeAll();

        dependencyStore.allowedDependencyTypes = ['StartToEnd'];

        t.throwsOk(function () {
            dependencyStore.add({
                From    : 1,
                To      : 2,
                Type    : 2
            });
        }, 'This dependency type is invalid. Check Gnt.data.DependencyStore#allowedDependencyTypes value', 'Exception thrown when invalid dependency added directly');

        t.livesOk(function () {
            dependencyStore.add({
                From    : 1,
                To      : 2,
                Type    : 1
            });
        }, 'Valid dependency added successfully');
    });

    t.it('Should hide drop zones', function (t) {

        var getGantt2 = function (allowedDependencyTypes) {
            return getGantt(getDataSet({
                dependencyStore : {
                    allowedDependencyTypes : allowedDependencyTypes
                }
            }));
        };

        t.it('No restrictions', function (t) {
            getGantt2(null);

            t.chain(
                { moveCursorTo : [1, 1] },
                { moveMouseTo : '.sch-gantt-item' },

                function () {
                    t.elementIsVisible('.sch-event-hover .sch-gantt-terminal-start', 'Start terminal is visible');
                    t.elementIsVisible('.sch-event-hover .sch-gantt-terminal-end', 'End terminal is visible');
                }
            );
        });

        t.it('Only StartToEnd allowed', function (t) {
            getGantt2(['StartToEnd']);

            t.chain(
                { moveCursorTo : [1, 1] },
                { moveMouseTo : '.sch-gantt-item' },

                function (next) {

                    t.elementIsVisible('.sch-event-hover .sch-gantt-terminal-start', 'Source Start terminal is visible');
                    t.elementIsNotVisible('.sch-event-hover .sch-gantt-terminal-end', 'Source End terminal is not visible');
                    next();
                },

                { moveMouseTo : '.sch-event-hover .sch-gantt-terminal-start' },

                { action : 'mouseDown' },

                { moveMouseTo : '.sch-ganttview ' + Ext.grid.View.prototype.itemSelector + ':last-child .sch-gantt-item' },

                function (next) {
                    t.elementIsNotVisible('.T2 .sch-gantt-terminal-start', 'Target Start terminal is not visible');
                    t.elementIsVisible('.T2 .sch-gantt-terminal-end', 'Target End terminal is visible');

                    next();
                },
                { action : 'mouseUp' }
            );
        });

        t.it('Only EndToStart allowed', function (t) {
            getGantt2(['EndToStart']);

            t.chain(
                { moveCursorTo : [1, 1] },
                { moveMouseTo : '.sch-gantt-item' },

                function (next) {
                    t.elementIsNotVisible('.sch-event-hover .sch-gantt-terminal-start', 'Source Start terminal is not visible');
                    t.elementIsVisible('.sch-event-hover .sch-gantt-terminal-end', 'Source End terminal is visible');
                    next();
                },

                { moveMouseTo : '.sch-event-hover .sch-gantt-terminal-end' },
                { action : 'mouseDown' },
                { moveMouseTo : '.sch-ganttview ' + Ext.grid.View.prototype.itemSelector + ':last-child .sch-gantt-item' },

                function (next) {
                    t.elementIsVisible('.T2 .sch-gantt-terminal-start', 'Target Start terminal is visible');
                    t.elementIsNotVisible('.T2 .sch-gantt-terminal-end', 'Target End terminal is not visible');

                    next();
                },

                { action : 'mouseUp' }
            );
        });

        t.it('StartToEnd and EndToStart allowed', function (t) {
            getGantt2(['StartToEnd', 'EndToStart']);

            t.chain(
                { moveCursorTo : [1, 1] },
                { moveMouseTo : '.sch-gantt-item' },

                function (next) {
                    t.elementIsVisible('.T1 .sch-gantt-terminal-start', 'Source Start terminal is visible');
                    t.elementIsVisible('.T1 .sch-gantt-terminal-end', 'Source End terminal is visible');
                    next();
                },
                { moveMouseTo : '.sch-event-hover .sch-gantt-terminal-end' },

                { action : 'mouseDown' },

                { moveMouseTo : '.sch-ganttview ' + Ext.grid.View.prototype.itemSelector + ':last-child .sch-gantt-item' },

                function () {
                    t.elementIsVisible('.T2 .sch-gantt-terminal-start', 'Target Start terminal is visible');
                    t.elementIsVisible('.T2 .sch-gantt-terminal-end', 'Target End terminal is visible');

                    t.mouseUp();
                }
            );
        });

        t.it('StartToEnd and EndToEnd allowed', function (t) {
            getGantt2(['StartToEnd', 'EndToEnd']);

            t.chain(
                { moveCursorTo : [1, 1] },
                { moveMouseTo : '.sch-gantt-item' },

                function (next) {
                    t.elementIsVisible('.T1 .sch-gantt-terminal-start', 'Source Start terminal is visible');
                    t.elementIsVisible('.T1 .sch-gantt-terminal-end', 'Source End terminal is visible');
                    next();
                },

                { moveMouseTo : '.sch-event-hover .sch-gantt-terminal-start' },

                { action : 'mouseDown' },

                { moveMouseTo : '.sch-ganttview ' + Ext.grid.View.prototype.itemSelector + ':last-child .sch-gantt-item' },

                function () {
                    t.elementIsNotVisible('.T2 .sch-gantt-terminal-start', 'Target Start terminal is not visible');
                    t.elementIsVisible('.T2 .sch-gantt-terminal-end', 'Target End terminal is visible');

                    t.mouseUp();
                }
            );
        });

        t.it('EndToStart and StartToStart allowed', function (t) {
            getGantt2(['EndToStart', 'StartToStart']);

            t.chain(
                { moveCursorTo : [1, 1] },
                { moveMouseTo : '.sch-gantt-item' },

                function (next) {
                    t.elementIsVisible('.T1 .sch-gantt-terminal-start', 'Source Start terminal is visible');
                    t.elementIsVisible('.T1 .sch-gantt-terminal-end', 'Source End terminal is visible');
                    next();
                },

                { moveMouseTo : '.sch-event-hover .sch-gantt-terminal-end' },

                { action : 'mouseDown' },

                { moveMouseTo : '.sch-ganttview ' + Ext.grid.View.prototype.itemSelector + ':last-child .sch-gantt-item' },

                function () {
                    t.elementIsVisible('.T1 .sch-gantt-terminal-start', 'Target Start terminal is visible');
                    t.elementIsNotVisible('.T1 .sch-gantt-terminal-end', 'Target End terminal is not visible');

                    t.mouseUp();
                }
            );
        });
    });

    t.it('allowParentTaskDependencies should be applied to task editor and dependency view', function (t) {

        var dataSet     = getDataSet({
            taskStore   : {
                DATA    : [
                    {
                        Id        : 1,
                        Name      : 'Foo',
                        expanded  : true,
                        StartDate : new Date(2011, 6, 1),
                        EndDate   : new Date(2011, 6, 5),
                        Cls       : 'T1',
                        children  : [{
                            Id        : 2,
                            leaf      : true,
                            Name      : 'Bar',
                            StartDate : new Date(2011, 6, 2),
                            EndDate   : new Date(2011, 6, 5),
                            Cls       : 'T2'
                        }]
                    },
                    {
                        Id        : 3,
                        leaf      : true,
                        Name      : 'Buz',
                        StartDate : new Date(2011, 6, 5),
                        EndDate   : new Date(2011, 6, 7),
                        Cls       : 'T2'
                    }
                ]
            }
        });

        var taskStore           = dataSet.taskStore;
        var task                = taskStore.getNodeById(3);

        var getGantt2 = function (cfg) {
            return getGantt(Ext.apply(dataSet, {
                plugins : new Gnt.plugin.TaskEditor({ monitorDataUpdates : false })
            }, cfg));
        }

        getGantt2({
            allowParentTaskDependencies : false
        });

        t.chain(
            { waitForEventsToRender : gantt },

            function (next) {
                t.waitForEvent(gantt.taskEditor, 'show', next);
                gantt.taskEditor.showTask(task);
            },

            function (next) {
                var taskPanel  = gantt.taskEditor.taskEditor;
                taskPanel.setActiveTab( taskPanel.dependencyGrid );
                taskPanel.dependencyGrid.insertDependency();

                t.is(taskPanel.dependencyGrid.tasksCombo.store.getCount(), 1, 'no parent task in combobox store');
                t.selectorNotExists('.sch-gantt-parenttask-bar .sch-gantt-terminal-end', 'no terminals for parent tasks found');

                gantt.taskEditor.close();

                gantt = getGantt2({
                    allowParentTaskDependencies : true
                });
                next();
            },

            { waitForEventsToRender : function () { return gantt; } },

            function (next) {
                t.waitForEvent(gantt.taskEditor, 'show', next);
                gantt.taskEditor.showTask(task);
            },

            function () {
                var taskPanel  = gantt.taskEditor.taskEditor;
                taskPanel.setActiveTab( taskPanel.dependencyGrid );
                taskPanel.dependencyGrid.insertDependency();

                t.is(taskPanel.dependencyGrid.tasksCombo.store.getCount(), 2, 'parent task is in combobox store');
                t.selectorExists('.sch-gantt-parenttask-bar .sch-gantt-terminal-end', 'terminal for parent task found');
            }
        );
    });
});
