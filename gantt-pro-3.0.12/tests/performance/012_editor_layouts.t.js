StartTest(function(t) {

    t.describe('Launching editors should not cause excessive relayouts.', function(t) {
        var plug = Ext.create('Sch.plugin.TreeCellEditing', { clicksToEdit: 1 });
        var gantt = t.getGantt({
            renderTo    : Ext.getBody(),
            columns     : [
                { xtype : 'treecolumn', dataIndex : 'Id' },
                { xtype : 'startdatecolumn' },
                { xtype : 'enddatecolumn' },
                { xtype : 'durationcolumn' },
                { xtype : 'predecessorcolumn' },
                { xtype : 'effortcolumn' },
                { xtype : 'percentdonecolumn' },
                { xtype : 'schedulingmodecolumn' }
            ],
            plugins     : plug
        });
        gantt.taskStore.cascadeChanges = false;

        t.waitForEventsToRender(gantt, function() {
            var view    = gantt.getSchedulingView(),
                ts      = gantt.taskStore,
                root    = ts.getRootNode(),
                task    = root.firstChild.firstChild,
                j       = 1;

            t.wontFire(view, 'refresh', 'scheduling view refresh should not be triggered by using the editors')
            t.wontFire(gantt.lockedGrid.view, 'refresh', 'locked view refresh should not be triggered by using the editors')

            t.isntCalled('refreshSize', gantt.lockedGrid.view, 'lockedView refreshSize should not be called');

//            Object.defineProperty(gantt.lockedGrid,'layoutCounter', {
//                set : function() {
//                    debugger;
//                }
//            })

            for (var i = 1; i < gantt.lockedGrid.columns.length; i++) {
                t.it('Should find low nbr of relayouts after full edit cycle', function(t){

                    var ganttCount = gantt.layoutCounter;

                    plug.startEditByPosition({ row : 1, column : j });
                    t.waitFor(300, function() {
                        plug.completeEdit();
                        var count = t.getTotalLayoutCounter();

                        plug.startEditByPosition({ row : 1, column : j });

                        t.waitFor(300, function() {

                            var delta = t.getTotalLayoutCounter()-count;

                            t.isLess(delta, 3, gantt.columns[j].xtype + ': ' + delta);
                            t.is(gantt.taskStore.getModifiedRecords().length, 0, gantt.columns[j].xtype + ': should not find any modified records');

                            // Ideally, this value would remain unchanged
//                            t.is(gantt.lockedGrid.layoutCounter, lockedGridCount, 'Locked grid panel should never relayout');
                            j++;
                            plug.completeEdit();
                        })
                    })
                })
            }
        })
    })
})
