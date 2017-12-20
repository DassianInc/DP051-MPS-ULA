StartTest(function (t) {

    var resourceStore = new Gnt.data.ResourceStore({
        data : [
            { "Id" : 1, "Name" : "Mats" },
            { "Id" : 2, "Name" : "Nickolay" },
            { "Id" : 3, "Name" : "Goran" },
            { "Id" : 4, "Name" : "Jakub" }
        ]
    });

    var assignmentStore = Ext.create("Gnt.data.AssignmentStore", {
        autoLoad      : true,
        autoSync      : true,
        resourceStore : resourceStore,
        proxy         : {
            method        : 'GET',
            type          : 'ajax',
            actionMethods : { read : 'GET', destroy : 'POST', create : 'POST' },
            api           : {
                read    : 'data/crud/assignment-read.js',
                create  : 'data/crud/assignment-create.js',
                destroy : 'data/crud/assignment-delete.js'
            },
            reader        : 'json',
            writer        : 'json'
        }
    });

    var cellEditing = Ext.create('Sch.plugin.TreeCellEditing', {
        clicksToEdit : 1
    });

    var gantt = t.getGantt({
        renderTo : Ext.getBody(),

        resourceStore   : resourceStore,
        assignmentStore : assignmentStore,

        plugins : cellEditing,

        columns : [
            {
                xtype : 'namecolumn'
            },
            {
                xtype : 'resourceassignmentcolumn',
                tdCls : 'editor'
            }
        ]
    });

    var itemSelector = Ext.grid.View.prototype.itemSelector;

    t.it('Assign 2 resources', function (t) {
        t.chain(
            { waitForStoresToLoad : assignmentStore },

            { waitForRowsVisible : gantt },

            function (next) {
                t.waitFor(function () {
                    return cellEditing.getActiveEditor();
                }, next);

                cellEditing.startEdit(0, 1);
            },

            { click : 'assignmentgrid => .x-grid-cell:nth-child(3)' },

            { waitForSelectorAtCursor : 'input' },

            {
                type : '100[TAB]', target : function () {
                return cellEditing.getActiveColumn().field.getPicker().cellEditing.getActiveEditor();
            }
            },

            { waitFor : 'CQVisible', args : 'numberfield' },

            {
                type : '80[ENTER]', target : function () {
                return cellEditing.getActiveColumn().field.getPicker().cellEditing.getActiveEditor();
            }
            },

            {
                waitForEvent : [assignmentStore, 'write'],
                trigger      : { click : '>> assignmentgrid button[text^=Save]' }
            },

            function (next) {
                t.is(assignmentStore.getCount(), 2, '2 records in assignment store');
                t.ok(assignmentStore.getById(1), 'Record with Id 1 found');
                t.is(assignmentStore.getById(1).getUnits(), 100, '100 percent found');
                t.is(assignmentStore.getById(2).getUnits(), 80, '80 percent found');

                next();
            }
        );
    })

    t.it('Unassign same 2 resources', function (t) {
        t.chain(
            function (next) {
                t.clickToEditCell(gantt.lockedGrid, 0, 1, next);
            },

            function (next) {
                // force expand with manual method call (is required for FF when running
                // in automation)
                // just clicking on the grid cell doesn't work because of something
                // related to focus..
                cellEditing.getActiveEditor().field.expand();

                next();
            },
            // eof forced expand


            { waitFor : 'compositeQuery', args : 'assignmentgrid => td.x-grid-cell:nth-child(3)' },

            // 2 clicks to uncheck selected rows
            { action : 'click', target : 'assignmentgrid => ' + itemSelector + ':nth-child(1) .x-grid-row-checker' },
            { action : 'click', target : 'assignmentgrid => ' + itemSelector + ':nth-child(2) .x-grid-row-checker' },

            {
                waitForEvent : [assignmentStore, 'write'],
                trigger      : { click : '>> assignmentgrid button[text^="Save"]' }
            },

            function (next) {
                t.is(assignmentStore.getCount(), 0, 'Records removed');

            }
        )
    })

    t.it('Testing Cancel button', function (t) {
        t.chain(
            function (next) {
                t.clickToEditCell(gantt.lockedGrid, 0, 1, next);
            },

            function (next) {
                t.selectorNotExists('.x-grid-row-selected .x-grid-row-checker', 'No rows selected');
                next();
            },

            { click : '>> assignmentgrid button[text=Cancel]' },

            function (next) {
                t.selectorNotExists('.x-grid-row-selected .x-grid-row-checker', 'No rows selected');
                t.elementIsNotVisible(t.cq1('assignmentfield').getEl(), 'No assignment field visible after Cancel click');
            }
        );
    });
});
