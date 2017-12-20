StartTest(function(t) {
    // this test verifies a regression - sorting by name of the gantt with selected row
    // triggers "Maximum call stack size exceeded" exception
    
    var gantt       = t.getGantt({
        renderTo        : Ext.getBody()
    })

    var lockedView  = gantt.lockedGrid.getView()

    t.knownBugIn('5.0.1', function(t) {
        // http://www.sencha.com/forum/showthread.php?291003-Locked-tree-sort-triggers-double-refresh&p=1063088#post1063088

        // TODO
//        t.firesOk(lockedView, 'refresh', 2, "Locked view refreshes only twice")
//        t.firesOk(gantt.normalGrid.getView(), 'refresh', 2, "Scheduling view refreshes only twice")
    })

    t.chain(
        { waitForTasksAndDependenciesToRender : gantt },

        { click : function () { return lockedView.getNode(1) } },

        // issue is triggered by the 2nd sort only
        { click : '>>namecolumn' },

        { waitFor : 1000 },

        { click : '>>namecolumn' }
    )
})    

