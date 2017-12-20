StartTest(function (t) {
    t.diag('Testing the instant update feature which is enabled by default')
    
    var cellEditing, gantt;
    
    var setup = function () {
        gantt && gantt.destroy();
        
        cellEditing = new Sch.plugin.TreeCellEditing({ clicksToEdit : 1 });

        gantt = t.getGantt({
            height    : 200,
            renderTo  : Ext.getBody(),
            // Having this flag set to true caused scroll issue previously
            // http://www.bryntum.com/forum/viewtopic.php?f=9&t=3903&sid=4d93cb492b549664adc5b5239e194927
            cascadeChanges : true,
            forceFit  : true,
            plugins   : cellEditing,
            taskStore : new Gnt.data.TaskStore({
                root : {
                    children : [
                        { leaf : true, StartDate : new Date(2010, 1, 1), Duration : 1 },
                        { leaf : true, StartDate : new Date(2010, 1, 1), Duration : 1 },
                        { leaf : true, StartDate : new Date(2010, 1, 1), Duration : 1 },
                        { leaf : true, StartDate : new Date(2010, 1, 1), Duration : 1 },
                        { leaf : true, StartDate : new Date(2010, 1, 1), Duration : 1 },
                        { leaf : true, StartDate : new Date(2010, 1, 1), Duration : 1 },
                        { leaf : true, StartDate : new Date(2010, 1, 1), Duration : 1 },
                        { leaf : true, StartDate : new Date(2010, 1, 1), Duration : 1 },
                        { leaf : true, StartDate : new Date(2010, 1, 1), Duration : 1 },
                        { leaf : true, StartDate : new Date(2010, 1, 1), Duration : 1 },
                        { leaf : true, StartDate : new Date(2010, 1, 1), Duration : 1, Id : 1 },
                        { leaf : true, StartDate : new Date(2010, 1, 1), Duration : 1, Id : 2 }
                    ]
                }
            }),
            dependencyStore : new Gnt.data.DependencyStore({
                data : [
                    { From : 2, To : 1 }
                ]
            }),
            columns   : [
                {
                    xtype : 'namecolumn'
                },
                {
                    xtype : 'durationcolumn',
                    tdCls : 'dur'
                }
            ]
        });
    }
    
    t.it('Click spinner up ', function (t) {
        setup();
        
        t.firesOk(gantt.normalGrid.view, {
            itemupdate      : 2,
            refresh         : 0
        });
        
        t.willFireNTimes(gantt.taskStore, 'cascade', 1);
        
        t.chain(
            { waitFor : 'rowsVisible', args : gantt },
            { click   : Ext.grid.View.prototype.itemSelector + ':last-child .dur' },
            { waitFor : 'selectorAtCursor', args : 'input' },
            function (next) {
                var ed = cellEditing.getActiveEditor();

                t.isntCalled("setPosition", ed);
                t.isntCalled("realign", ed);
                t.wontFire(ed, 'move');
                next();
            },

            { type : '[UP]' },

            { waitFor : 100 }
        );
    });

    t.it('Hit enter to finalize edit, which should not cause a scroll change', function (t) {
        setup();
        
        var scroll;

        t.chain(
            { waitFor : 'rowsVisible', args : gantt },
            { click   : Ext.grid.View.prototype.itemSelector + ':last-child .dur' },
            { waitFor : 'selectorAtCursor', args : 'input' },
            function (next) {
                scroll = gantt.lockedGrid.view.el.dom.scrollTop;
                next()
            },

            { click : '.x-grid-cell-editor' },

            { type : '[ENTER]' },

            { waitFor : 100 },

            function (next) {
                t.is(gantt.lockedGrid.view.el.dom.scrollTop, scroll, 'Scroll should not be reset')
            }
        )
    });
});
