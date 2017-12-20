StartTest(function (t) {

    t.knownBugIn('5.1.0', function (t) {
        t.it('Store bindings - Gantt not rendered', function (t) {
            var assignmentStore = t.getAssignmentStore();
            var resourceStore = t.getResourceStore();
            var dependencyStore = t.getDependencyStore();

            var calendar = new Gnt.data.calendar.BusinessTime({
                calendarId : 'NightShift'
            });

            var taskStore = t.getTaskStore({
                dependencyStore : dependencyStore,
                resourceStore   : resourceStore,
                assignmentStore : assignmentStore,
                calendar        : calendar
            });

            t.snapShotListeners(taskStore, 'taskStore');
            t.snapShotListeners(dependencyStore, 'dependencyStore');
            t.snapShotListeners(resourceStore, 'resourceStore');
            t.snapShotListeners(assignmentStore, 'assignmentStore');
            t.snapShotListeners(calendar, 'calendar');

            var g = t.getGantt({
                taskStore       : taskStore,
                assignmentStore : assignmentStore,
                resourceStore   : resourceStore,
                dependencyStore : dependencyStore,
                columns         : t.getAllColumns()
            });

            // Should clean all listeners
            g.destroy();

            t.verifyListeners(taskStore, 'taskStore');
            t.verifyListeners(assignmentStore, 'assignmentStore');
            t.verifyListeners(dependencyStore, 'dependencyStore');
            t.verifyListeners(resourceStore, 'resourceStore');
            t.verifyListeners(calendar, 'calendar');
        });

        t.it('Store bindings - Gantt rendered then destroyed', function (t) {
            var assignmentStore = t.getAssignmentStore();
            var resourceStore = t.getResourceStore();
            var dependencyStore = t.getDependencyStore();

            var calendar = new Gnt.data.calendar.BusinessTime({
                calendarId : 'NightShift2'
            });

            var taskStore = t.getTaskStore({
                dependencyStore : dependencyStore,
                resourceStore   : resourceStore,
                assignmentStore : assignmentStore,
                calendar        : calendar,
                root            : {
                    expanded : true,
                    children : []
                }
            });

            t.snapShotListeners(taskStore, 'taskStore');
            t.snapShotListeners(dependencyStore, 'dependencyStore');
            t.snapShotListeners(resourceStore, 'resourceStore');
            t.snapShotListeners(assignmentStore, 'assignmentStore');
            t.snapShotListeners(calendar, 'calendar');

            var g = t.getGantt({
                renderTo        : Ext.getBody(),
                columnLines     : true,
                taskStore       : taskStore,
                assignmentStore : assignmentStore,
                resourceStore   : resourceStore,
                dependencyStore : dependencyStore,
                columns         : t.getAllColumns(),
                plugins         : t.getAllPlugins(),
                startDate       : null,
                endDate         : null
            });

            // Triggers datachanged which (if view listeners are not purged from all stores) will call refresh on the stale Ext.view.Locking instance
            assignmentStore.loadData([{ foo : 'bar' }]);

            var task = taskStore.getRootNode().appendChild({
                Name : 'foo',
                leaf : true
            });

            var editor = t.cq1('[alias=plugin.gantt_taskeditor]');

            editor.showTask(task);

            g.destroy();

            t.verifyListeners(taskStore, 'taskStore');
            t.verifyListeners(assignmentStore, 'assignmentStore');
            t.verifyListeners(dependencyStore, 'dependencyStore');
            t.verifyListeners(resourceStore, 'resourceStore');
            t.verifyListeners(calendar, 'calendar');
        });

        t.it('Dangling panel bindings should on be found on any components such as columns', function (t) {

            var taskStore = t.getTaskStore();

            t.snapShotListeners(taskStore, 'Task store');

            var g = t.getGantt({
                renderTo  : Ext.getBody(),
                taskStore : taskStore,
                plugins   : t.getAllPlugins(),
                columns   : []
            });

            t.snapShotListeners(g, 'Main panel');
            t.snapShotListeners(g.getView(), 'Main view');
            t.snapShotListeners(g.lockedGrid, 'Locked child panel');
            t.snapShotListeners(g.lockedGrid.view, 'Locked child view');
            t.snapShotListeners(g.normalGrid, 'Normal child panel');
            t.snapShotListeners(g.normalGrid.view, 'Normal child view');

            g.lockedGrid.headerCt.add(t.getAllColumns());

            g.lockedGrid.headerCt.removeAll(true);

            g.lockedGrid.headerCt.add({ xtype : 'namecolumn' });

            t.verifyListeners(g, 'Main panel');
            t.verifyListeners(g.getView(), 'Main view');
            t.verifyListeners(g.lockedGrid, 'Locked child panel');
            t.verifyListeners(g.lockedGrid.view, 'Locked child view');
            t.verifyListeners(g.normalGrid, 'Normal child panel');
            t.verifyListeners(g.normalGrid.view, 'Normal child view');

            g.destroy();

            t.verifyListeners(g, 'Main panel');
            t.verifyListeners(taskStore, 'Task store');
        });
    });
});
