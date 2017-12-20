StartTest(function (t) {

    // Checks that AssignmentEditGrid filters out already assigned resources when in
    // resources combobox #1985

    var setup   = function (cfg) {
        cfg     = cfg || {};

        var resourceStore   = t.getResourceStore();

        var assignmentStore = t.getAssignmentStore({
            resourceStore   : resourceStore
        });

        t.getTaskStore({
            resourceStore   : resourceStore,
            assignmentStore : assignmentStore
        });

        return new Gnt.widget.AssignmentEditGrid(Ext.apply({
            margin                  : 10,
            width                   : 300,
            renderTo                : Ext.getBody(),
            resourceStore           : resourceStore,
            assignmentStore         : assignmentStore
        }, cfg.grid));

    };

    function scenario (t, cfg) {
        var grid = setup(cfg);

        grid.loadTaskAssignments(115);

        t.chain(
            { waitForRowsVisible : grid },

            function (next) {
                grid.insertAssignment();
                t.waitForComponentVisible('combobox', next);
            },

            { waitFor : 500 },

            function (next) {

                t.is(grid.resourceComboStore.count(), 5, 'proper number of elements in dropdown list');

                var found = grid.resourceComboStore.findBy(function (resource) {
                    return resource.getId() == 'r3';
                });

                t.is(found, -1, 'assigned resource is filtered out');

                grid.destroy();
            }
        );
    }

    t.it('Filters out already assigned resource when addResources enabled', function (t) {
        scenario(t);
    })

    t.it('Filters out already assigned resource when addResources disabled', function (t) {
        scenario(t, { grid : { addResources : false }});
    })

});
