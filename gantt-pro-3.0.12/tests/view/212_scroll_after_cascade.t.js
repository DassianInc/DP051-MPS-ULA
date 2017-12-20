describe('After cascade, scroll should not be messed up', function(t) {

    t.expectGlobals('App', 'MyApp', 'MyTaskModel', 'ExampleDefaults', 'supportedLocales', 'localeClass', 'localeId');

    t.waitForRowsVisible('ganttpanel', function() {
        var gantt = t.cq1('ganttpanel');
        
        t.chain(
            function(next) {
                t.firesOnce(gantt, 'taskdrop')
                next();
            },
    
            { drag : '.sch-gantt-task-bar:not(.sch-rollup-task)', by : [200, 0] },
    
            function() {
                var cols = gantt.lockedGrid.headerCt.getGridColumns();
    
                Ext.Array.forEach(cols, function(c, i) {
                    t.is(Ext.fly(t.getCell(gantt.lockedGrid, 0, i)).getWidth(), c.getWidth(), i + ': cell width ok');
                });
            }
        );
    });
});
