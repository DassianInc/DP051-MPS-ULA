StartTest(function(t) {

    var g = t.getGantt({
        renderTo    : Ext.getBody(),
        plugins : [
            Ext.create('Sch.plugin.TreeCellEditing', { clicksToEdit: 1 })
        ],
        taskStore   : new Gnt.data.TaskStore({
            root : {
                children : [
                    { leaf : true },
                    { leaf : true, SchedulingMode : 'FixedDuration', Id : 1 },
                    { leaf : true, SchedulingMode : 'EffortDriven' },
                    { leaf : true, SchedulingMode : 'DynamicAssignment' },
                    { leaf : true, SchedulingMode : 'Manual' },
                    { leaf : true, SchedulingMode : 'Normal' }
                ]
            }
        }),
        columns : [
            {
                xtype : 'treecolumn'
            },
            {
                xtype : 'schedulingmodecolumn'
            }
        ]
    });


    t.waitForRowsVisible(g, function() {

        t.it('Check cell content', function (t) {

            t.chain(

                function (next){
                    var locked = g.lockedGrid;

                    t.matchGridCellContent(locked, 0, 1, 'Normal', 'Default: Normal');
                    t.matchGridCellContent(locked, 1, 1, 'Fixed duration', 'Fixed duration');
                    t.matchGridCellContent(locked, 2, 1, 'Effort driven', 'Effort driven');
                    t.matchGridCellContent(locked, 3, 1, 'Dynamic assignment', 'Dynamic assignment');
                    t.matchGridCellContent(locked, 4, 1, 'Normal', 'Manual is Normal');
                    t.matchGridCellContent(locked, 5, 1, 'Normal', 'Normal');
                }
            );
        });

        t.it('Should be possible to set a Fixed Duration task to Normal', function (t) {

            var editor = g.lockedGrid.headerCt.getHeaderAtIndex(1).getEditor(),
                plugin = g.lockedGrid.editingPlugin;

            t.chain(

                function(next) {

                    plugin.startEditByPosition({ row : 1, column : 1 });

                    next();
                },

                { waitFor : 'ComponentVisible', args : editor },

                function(next) {
                    t.diag('Set schedulingmode to Normal');
                    var e = plugin.getActiveEditor();
                    e.setValue('Normal');
                    e.completeEdit();

                    next();
                },

                { waitForSelector : '.x-grid-item:nth-child(2) .x-grid-cell:nth-child(2):contains(Normal)'},

                function (next){
                    var locked = g.lockedGrid;

                    t.diag('Assert bussiness layer');
                    var record = g.taskStore.getNodeById(1);

                    record.setSchedulingMode('FixedDuration');
                    t.is(record.getSchedulingMode(), 'FixedDuration', 'Record is set to FixedDuration');
                    record.setSchedulingMode('Normal');
                    t.is(record.getSchedulingMode(), 'Normal', 'Record is set to Normal');
                }

            );

        });

    });


});
