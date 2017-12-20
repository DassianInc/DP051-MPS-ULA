StartTest(function(t) {
    
    //======================================================================================================================================================================================================================================================
    t.diag('Setup');
    
    var g = t.getGantt({
        viewPreset      : 'weekAndDayLetter',
        renderTo        : Ext.getBody()
    });
    
    t.waitForEventsToRender(g, function() {

        var normalGrid = g.normalGrid,
            headerColumn = normalGrid.columns[0],
            rowTopCell = headerColumn.el.down('.sch-header-row-middle td'),
            rowBottomCell = headerColumn.el.down('.sch-header-row-bottom td');
        
        t.isApprox(rowTopCell.getWidth(), rowBottomCell.getWidth() * 7, 'Widths for columns match');
    });
});    
