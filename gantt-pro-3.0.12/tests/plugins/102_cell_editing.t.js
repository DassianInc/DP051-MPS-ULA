StartTest(function(t) {

    // #1888 Checks that we prevent editing of dependency column depending on allowParentTaskDependencies state

    function setup (config) {
        config      = config || {};

        var gantt   = t.getGantt(Ext.apply({
            startDate                   : null,
            endDate                     : null,
            renderTo                    : Ext.getBody(),
            taskStore                   : t.getTaskStore(Ext.apply({
                DATA        : [{
                    expanded    : true,
                    children    : [{
                        StartDate   : new Date(),
                        leaf        : true
                    }]
                }]
            }, config.taskStore)),
            plugins         : Ext.create('Sch.plugin.TreeCellEditing', { clicksToEdit: 1 }),
            columns         : [
                {
                    xtype : 'namecolumn'
                },
                {
                    xtype : 'predecessorcolumn'
                },
                {
                    xtype : 'successorcolumn'
                }
            ]
        }, config.gantt));

        return {
            gantt : gantt,
            editor : function (i) { return gantt.lockedGrid.headerCt.getHeaderAtIndex(i).getEditor(); }
        };
    }

    var itemSelector    = Ext.grid.View.prototype.itemSelector;

    t.it('Disables dependency columns editing when `allowParentTaskDependencies` is false', function (t) {

        var x = setup({ gantt : { allowParentTaskDependencies : false }}), editor = x.editor;

        t.chain(
            { waitForEventsToRender : x.gantt },

            { click : itemSelector+':nth-child(2) .x-grid-cell' },

            { waitForComponentVisible : editor(0), desc : 'child: namecolumn editor is visible' },

            { click : itemSelector+':nth-child(2) .x-grid-cell:nth-child(2)' },

            { waitForComponentVisible : editor(1), desc : 'child: predecessorcolumn editor is visible' },

            { click : itemSelector+':nth-child(2) .x-grid-cell:nth-child(3)' },

            { waitForComponentVisible : editor(2), desc : 'child: successorcolumn editor is visible' },

            { click : itemSelector+':nth-child(1) .x-grid-cell' },

            { waitForComponentVisible : editor(0), desc : 'parent: namecolumn editor is visible' },

            { click : itemSelector+':nth-child(1) .x-grid-cell:nth-child(2)' },
            { waitFor : 500 },
            function (next) {
                t.elementIsNotVisible(editor(1).el, 'parent: predecessorcolumn editor is NOT visible');
                next();
            },

            { click : itemSelector+':nth-child(1) .x-grid-cell:nth-child(3)' },
            { waitFor : 500 },
            function () {
                t.elementIsNotVisible(editor(2).el, 'parent: successorcolumn editor is NOT visible');
                // cleanup
                x.gantt.destroy();
            }
        );

    });

    t.it('Enables dependency columns editing when `allowParentTaskDependencies` is true', function (t) {

        var x = setup({ gantt : { allowParentTaskDependencies : true }}), editor = x.editor;

        t.chain(
            { waitForEventsToRender : x.gantt },

            { click : itemSelector+':nth-child(2) .x-grid-cell' },

            { waitForComponentVisible : editor(0), desc : 'child: namecolumn editor is visible' },

            { click : itemSelector+':nth-child(2) .x-grid-cell:nth-child(2)' },

            { waitForComponentVisible : editor(1), desc : 'child: predecessorcolumn editor is visible' },

            { click : itemSelector+':nth-child(2) .x-grid-cell:nth-child(3)' },

            { waitForComponentVisible : editor(2), desc : 'child: successorcolumn editor is visible' },

            { click : itemSelector+':nth-child(1) .x-grid-cell' },

            { waitForComponentVisible : editor(0), desc : 'parent: namecolumn editor is visible' },

            { click : itemSelector+':nth-child(1) .x-grid-cell:nth-child(2)' },

            { waitForComponentVisible : editor(1), desc : 'parent: predecessorcolumn editor is visible' },

            { click : itemSelector+':nth-child(1) .x-grid-cell:nth-child(3)' },

            { waitForComponentVisible : editor(2), desc : 'parent: successorcolumn editor is visible' },

            // cleanup
            function () { x.gantt.destroy(); }
        );

    });
});
