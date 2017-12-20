/* globals MyAssignmentStore, MyResourceStore */
StartTest(function (t) {
    t.expectGlobals('MyAssignmentModel', 'MyAssignmentStore', 'MyResourceModel', 'MyResourceStore');

    Ext.define('MyAssignmentModel', {
        extend          : 'Gnt.model.Assignment',
        resourceIdField : 'MyResourceId',
        unitsField      : 'MyUnits',
        taskIdField     : 'MyTaskId'
    });

    Ext.define('MyAssignmentStore', {
        extend   : 'Gnt.data.AssignmentStore',
        autoSync : true,
        sync     : function () {}
    });

    Ext.define('MyResourceModel', {
        extend    : 'Gnt.model.Resource',
        nameField : 'MyName'
    });

    Ext.define('MyResourceStore', {
        extend   : 'Gnt.data.ResourceStore',
        autoSync : true,
        sync     : function () {}
    });

    var grid;

    t.beforeEach(function () {
        grid && grid.destroy();

        var resourceStore   = new MyResourceStore({
            model   : 'MyResourceModel',
            data    : [
                { Id : 'r1', MyName : 'Mike' },
                { Id : 'r2', MyName : 'Linda' },
                { Id : 'r3', MyName : 'Don' },
                { Id : 'r4', MyName : 'Karen' },
                { Id : 'r5', MyName : 'Doug' },
                { Id : 'r6', MyName : 'Peter' }
            ]
        });

        // we test not only extending store class but also
        // providing model on instantiation
        var assignmentStore = new MyAssignmentStore({
            model         : 'MyAssignmentModel',
            resourceStore : resourceStore,
            data          : [
                { Id : 'a1', MyResourceId : 'r1', MyTaskId : 117, MyUnits : 50 },
                { Id : 'a2', MyResourceId : 'r2', MyTaskId : 118 },
                { Id : 'a3', MyResourceId : 'r3', MyTaskId : 115 }
            ]
        });

        t.getTaskStore({
            resourceStore   : resourceStore,
            assignmentStore : assignmentStore
        });

        grid = new Gnt.widget.AssignmentEditGrid({
            margin                  : 10,
            width                   : 300,
            renderTo                : Ext.getBody(),
            resourceStore           : resourceStore,
            assignmentStore         : assignmentStore,
            defaultAssignedUnits    : 50
        });
    });

    t.it('Should load/update/add assignments', function (t) {

        var resourceStore   = grid.resourceStore;
        var taskStore       = resourceStore.getTaskStore();

        var gantt = t.getGantt({
            renderTo        : Ext.getBody(),
            height          : 250,
            taskStore       : taskStore,
            columns : [
                {
                    xtype       : 'treecolumn',
                    header      : 'Tasks',
                    dataIndex   : 'Id',
                    width       : 100
                },
                {
                    width   : 200,
                    xtype   : 'resourceassignmentcolumn'
                }
            ]
        });

        grid.loadTaskAssignments(115);

        t.chain(
            { waitForRowsVisible : gantt },
            function(next) {
                t.matchGridCellContent(grid, 0, 0, 'Don', 'Assignment grid correctly handles changed model resourceId field');
                t.matchGridCellContent(grid, 0, 1, '100 %', 'Assignment grid correctly handles changed model units field');

                grid.cellEditing.startEditByPosition({ row : 0, column : 1 });
                t.waitForComponentVisible('percentfield', next);
            },
            function (next) {
                var editor = grid.cellEditing.getActiveEditor();
                editor.setValue(30);
                editor.completeEdit();

                grid.insertAssignment({ MyResourceId: 'r1', MyUnits: '20' }, true);
                
                t.waitForEvent(grid.store, 'refresh', next);
                grid.saveTaskAssignments();
            },
            function (next) {
                t.matchGridCellContent(gantt.lockedGrid, 3, 1, 'Don [30%], Mike [20%]', 'Don is assigned to 30% and Mike to 20%');

                grid.insertAssignment();
                t.waitForComponentVisible('combobox', next);
            },
            { type : '<img id=QwErTy>newresource1[ENTER]', target : grid.cellEditing.field },
            { waitForComponentVisible : 'messagebox' },
            function (next) {
                t.notOk(document.getElementById('QwErTy'), 'Message box escapes HTML characters');
                next();
            },
            { click : '.x-message-box .x-btn:contains(Yes)' },
            function (next) {
                t.notOk(document.getElementById('QwErTy'), 'Grid escapes HTML characters');
                grid.insertAssignment();
                t.waitForComponentVisible('combobox', next);
            },
            { type : 'newresource2[ENTER]' , target : grid.cellEditing.field },
            { waitForComponentVisible : 'messagebox' },
            { click : '.x-message-box .x-btn:contains(Yes)' },
            function (next) {
                t.waitForEvent(grid.store, 'refresh', next);
                grid.saveTaskAssignments();
            },
            function (next) {
                var resourceStore = grid.resourceStore;

                var found = resourceStore.queryBy(function (resource) {
                    return resource.getName() == '<img id=QwErTy>newresource1';
                });

                t.ok(found.getCount(), '<img id=QwErTy>newresource1 found');

                found = resourceStore.queryBy(function (resource) {
                    return resource.getName() == 'newresource2';
                });

                t.ok(found.getCount(), 'newresource2 found');
                
                gantt.destroy();
            }
        );
    });

    t.it('Resource and assignments changes should reflect gantt', function (t) {
        var resourceStore   = grid.resourceStore;
        var assignmentStore = grid.assignmentStore;

        grid.loadTaskAssignments(115);

        t.chain(
            function (next) {
                t.waitForEvent(grid.store, 'refresh', next);
                resourceStore.insert(0, { MyName : 'someresource' });
            },
            function (next) {
                var found = grid.resourceComboStore.queryBy(function (resource) {
                    return resource.getName() == 'someresource';
                });

                t.ok(found.getCount(), 'resource adding reflected on resource combo store');

                found = resourceStore.queryBy(function (resource) {
                    return resource.getName() == 'someresource';
                });

                t.waitForEvent(grid.store, 'refresh', next);
                resourceStore.remove(found.first());
            },
            function(next) {
                var found = grid.resourceComboStore.queryBy(function (resource) {
                    return resource.getName() == 'someresource';
                });

                t.notOk(found.getCount(), 'resource deleting reflected on resource combo store');

                t.waitForEvent(grid.store, 'refresh', next);
                assignmentStore.insert(0, { MyTaskId : grid.taskId, MyResourceId : 'r5', MyUnits : 10 });
            },
            function(next) {
                var found = grid.store.queryBy(function (assignment) {
                    return assignment.getResourceId() == 'r5';
                });

                t.ok(found.getCount(), 'resource adding reflected on grid store');

                found = assignmentStore.queryBy(function (assignment) {
                    return assignment.getResourceId() == 'r5';
                });

                t.waitForEvent(grid.store, 'refresh', next);
                assignmentStore.remove(found.first());
            },
            function(next) {
                var found = grid.store.queryBy(function (assignment) {
                    return assignment.getResourceId() == 'r5';
                });

                t.notOk(found.getCount(), 'resource deleting reflected on grid store');
            }
        )
    });

    // #955: after adding of 2 records grid.saveTaskAssignments() call must invoke sync() only once
    t.it('sync call should be called only once', function (t) {
        var syncCalls = 0;
        
        grid.loadTaskAssignments(118);

        t.chain(
            function (next) {
                grid.store.add(
                    { MyTaskId : grid.taskId, MyResourceId : 'r5', MyUnits : 10 },
                    { MyTaskId : grid.taskId, MyResourceId : 'r6', MyUnits : 10 }
                );

                grid.assignmentStore.sync = function () { syncCalls++; };

                t.waitForEvent(grid.store, 'refresh', next);
                grid.saveTaskAssignments();
            },
            function (next) {
                t.is(syncCalls, 1, 'sync called proper number of times');
            }
        );
    });
});
