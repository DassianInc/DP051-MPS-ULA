StartTest(function(t) {
    t.diag('If user supplies extra markup that increases the cell height, this should not affect row height');

    var gantt = t.getGantt({
        renderTo                : Ext.getBody(),
        enableAnimations        : false,
        columns : [
            {
                xtype : 'treecolumn',
                width: 200,
                renderer : function(v, meta, r) {
                    return "FOO" + '<br/><br/><br/>';
                }
            }
        ]
    });
    
    t.waitForEventsToRender(gantt, function () {

        t.is(gantt.lockedGrid.el.down(Ext.grid.View.prototype.itemSelector).dom.clientHeight,
             gantt.normalGrid.el.down(Ext.grid.View.prototype.itemSelector).dom.clientHeight,
                'Row height in sync');
    });
})    

