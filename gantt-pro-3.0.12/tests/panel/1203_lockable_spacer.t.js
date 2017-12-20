StartTest(function(t) {
    t.diag('SchedulerPanel should clean up any listeners attached to its stores');

    var gantt = t.getGantt({
        height              : 200, // Force vert scrollbar
        width               : 400,
        
        viewPreset          : 'dayAndWeek',
        
        columns             : [{ xtype : 'treecolumn', dataIndex : 'Name' }],
        
        lockedGridConfig    : { width : 200 },
        
        renderTo            : Ext.getBody()
    });

    // This test is not relevant on browsers which show no scrollbar (on iOS - Mac, iPad etc)
    if (Ext.getScrollbarSize().height === 0) {
        return;
    }
    
    var view = gantt.getSchedulingView();

    t.chain(
        {
            waitFor     : 'RowsVisible',
            args        : gantt
        },
        
        function (next) {
            t.scrollVerticallyTo(gantt.lockedGrid.getView().el, 200, next);
        },
        function () {
            var lastLockedRowBottom     = t.safeSelect(Ext.grid.View.prototype.itemSelector + ':last-child', gantt.lockedGrid.el.dom).getBottom();
            var lockedViewEl            = gantt.lockedGrid.view.el.getBottom();

            t.isGreater(lockedViewEl, lastLockedRowBottom + 10, 'Scrolled to bottom, should see some empty space below last task');
        }
    );
});
