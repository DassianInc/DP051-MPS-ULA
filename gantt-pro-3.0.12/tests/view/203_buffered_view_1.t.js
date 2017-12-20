StartTest(function(t) {
    var gantt;
    var schedulingView;
    var bottomScroll;
    
    function setup(config) {
        gantt && gantt.destroy();
        
        var taskStore = Ext.create("Gnt.data.TaskStore", {
            // sorting slow downs the initial loading/rendering time for big trees
            sortOnLoad  : false,
            
            proxy       : {
                type : 'memory',
                data : t.getLargeDataset()
            }
        });

        gantt = t.getGantt(Ext.apply({
            taskStore   : taskStore,
            rightLabelField : 'Name',
            width       : 400,
            columns: [
                {
                    xtype       : 'treecolumn',
                    header      : 'Tasks',
                    sortable    : true,
                    dataIndex   : 'Id',
                    width       : 150,
                    editor      : {}
                }
            ],
            renderTo    : Ext.getBody()
        }, config || {}));
    }
    
    var getSteps = function (gantt, t) { return [
        { waitForRowsVisible : gantt },
        
        // it seems shortly after initial rendering, the "scrollTop" position of the buffered schedulingView will be reset to 0
        // need to wait some time before modifiying it
        { waitFor     : 300 },
        
        function (next) {
            // If normal grid is collapsed, scroll the locked grid
            // https://www.assembla.com/spaces/bryntum/support/tickets/268
            schedulingView      = gantt.normalGrid.getCollapsed() ? gantt.lockedGrid.view : gantt.getSchedulingView();
            var el              = schedulingView.el;
            bottomScroll        = t.scrollVerticallyTo(el, el.dom.scrollHeight, 300, next);
        },
        
        // processing of scrolling is async, need to wait again
        { waitFor     : 300 },
        
        function (next) {
            // required, otherwise there will not be any visible rows inside the grid if it was initially collapsed
            gantt.lockedGrid.expand();
            gantt.normalGrid.expand();
            next();
        },

        { waitFor : 300 },

        function(next) {
            var schedulingViewEl    = schedulingView.el;
            var lastNormalRow       = t.safeSelect('' + Ext.grid.View.prototype.itemSelector + ':last-child',  schedulingViewEl.dom);
            var lastLockedRow       = t.safeSelect('' + Ext.grid.View.prototype.itemSelector + ':last-child', gantt.lockedGrid.view.el.dom);
            
            t.is(schedulingView.getRecord(lastNormalRow.dom).getId(), 999, 'Found last record row in scheduler schedulingView');

            // approximation required since FF changes scollTop value of view, but scroll position isn't changed
            t.isApprox(schedulingViewEl.dom.scrollTop, bottomScroll, 16, 'Should scroll and remain at the bottom of the view el');

            t.like(lastLockedRow.dom[Ext.isIE8 ? 'innerText' : 'textContent'], '999', 'Found last record row in locked schedulingView');
        }
    ];};
    
    
    t.it('Testing not collapsed case', function (t) {
        setup();
        
        t.chain(getSteps(gantt, t));
    });
    
    t.it('Testing normal grid - collapsed', function (t) {
        setup({
            lockedGridConfig : {
                collapsible : true
            },
            normalGridConfig : {
                collapsed : true,
                collapsible : true
            }
        });
        
        t.chain(getSteps(gantt, t));
    });
    
    t.todo('Testing locked grid - collapsed', function (t) {
        setup({
            lockedGridConfig : {
                collapsed : true,
                collapsible : true
            },
            normalGridConfig : {
                collapsible : true,
                // Header has to be disabled because of bug http://www.sencha.com/forum/showthread.php?295193
                header  : false
            }
        });
        
        t.chain(getSteps(gantt, t));
    });
});