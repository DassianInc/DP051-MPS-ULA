StartTest(function(t) {

    var Ext = t.getExt(),
        wednesday = new Date(2014, 8, 3),
        thursday  = new Date(2014, 8, 4);

    function getSampleStore() {
        return new Gnt.data.TaskStore({
            root  : {
                expanded : true,
                children : [{
                    Id             : 1,
                    Name           : 'Task',
                    StartDate      : wednesday,
                    EndDate        : thursday,
                    ConstraintType : 'mustfinishon',
                    ConstraintDate : thursday,
                    leaf           : true
                }]
            }
        });
    }

    function getSamplePanel(store) {
        return Ext.widget({
            xtype         : 'ganttpanel',
            plugins       : [{
                ptype : 'scheduler_treecellediting',
                clicksToEdit : 2
            }],
            taskStore     : store,
            renderTo      : Ext.getBody(),
            width         : 500,
            height        : 200,
            columns       : [{
                xtype     : 'namecolumn'
            }, {
                xtype     : 'durationcolumn'
            }]
        });
    }

    t.describe([
        "Model might be bound to several stores, it is the case when model is inside a tree store which is bounded",
        "to a tree panel. When data is being edited using panel's column editor model's set method is called with",
        "model bounded to a NodeStore (Ext's private class). Thus model::store will reference NodeStore instance",
        "which of course has no ProjectableStore mixed in and has no getProjection() method whereas",
        "model.store.treeStore has it."
    ].join(''), function(t) {

        t.it("ProjectableModel mixin must handle this case correctly", function(t) {

            var store       = getSampleStore(),
                panel       = getSamplePanel(store),
                gotConflict = false;

            store.on('constraintconflict', function(task, resolutionContext) {
                t.pass("Got constraint conflict");
                Ext.Function.defer(function() {
                    resolutionContext.cancelAction();
                    gotConflict = true;
                }, 1);
            }, null, { single : true });

            t.chain(
                function(next) {
                    t.is(store.getById(1).get('Duration'), 1, "Initial duration value is correct");
                    next();
                },
                { dblclick : "ganttpanel treepanel => tr.x-grid-row:nth-child(1) .x-grid-cell:nth-child(2)" },
                { type     : "[BACKSPACE][BACKSPACE][BACKSPACE][BACKSPACE][BACKSPACE]2[ENTER]" },
                { waitFor  : function() { return gotConflict; } },
                function(next) {
                    t.is(store.getById(1).get('Duration'), 1, "Since we canceling changes in constraint conflict handler the new value must be rejected");
                    next();
                },
                function(next) {
                    Ext.destroy(panel, store);
                    next();
                }
            );
        });
    });
});
