StartTest(function (t) {

    // Test to check if combobox filters by entered text properly after saveAssignments() call
    // Bug #778

    var resourceStore   = t.getResourceStore();

    var assignmentStore = t.getAssignmentStore({
        resourceStore   : resourceStore
    });

    var taskStore = t.getTaskStore({
        resourceStore   : resourceStore,
        assignmentStore : assignmentStore
    });

    var grid = new Gnt.widget.AssignmentEditGrid({
        margin                  : 10,
        width                   : 300,
        renderTo                : Ext.getBody(),
        resourceStore           : resourceStore,
        assignmentStore         : assignmentStore
    });

    grid.loadTaskAssignments(115);

    t.chain(
        { waitForRowsVisible : 'assignmenteditgrid' },

        function(next) {
            grid.insertAssignment({ ResourceId: 'r1', Units: '20' });

            next();
        },

        { waitForComponentVisible : 'combobox' },

        function(next) {
            var editor = grid.cellEditing.getActiveEditor();
            editor.setValue('Linda');
            
            var store = editor.field.getPickerStore();
            var records = store.queryBy(function (record) { return record.getName() === 'Linda' });
            
            t.is(records.getCount(), 1, 'One and only record "Linda" found');
            editor.completeEdit();

            next();
        },

        function(next) {
            t.diag('Call saveTaskAssignments() to apply changes to assignmentGrid');
            grid.saveTaskAssignments();

            next();
        },

        { waitFor : 400 },

        function(next) {
            grid.insertAssignment({ ResourceId: 'r1', Units: '20' });

            next();
        },

        { waitForComponentVisible : function() {
            return grid.cellEditing.getActiveEditor();
        } },

        function(next) {
            var editor = grid.cellEditing.getActiveEditor();
            
            editor.field.setValue('Karen');
            var store = editor.field.getPickerStore();
            var records = store.queryBy(function (record) { return record.getName() === 'Karen' });
            
            t.is(records.getCount(), 1, 'One and only record "Karen" found');

            editor.completeEdit();
        }
    );
});
