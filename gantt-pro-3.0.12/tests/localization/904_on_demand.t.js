StartTest(function(t) {
    if (t.isOnline()) {
        t.diag('Developers only test')

        return
    }

    Ext.Loader.setConfig({
        enabled             : true,
        disableCaching      : true
    });

    Ext.Loader.setPath('Sch', '../../ExtScheduler3.x/js/Sch')
    Ext.Loader.setPath('Gnt', '../js/Gnt')
    
    // increase the timeout for the `requireOk` call
    t.defaultTimeout        = 50000

    t.chain(
        {
            requireOk : [
                'Gnt.column.PercentDone',
                'Gnt.column.StartDate',
                'Gnt.column.EndDate',
                'Gnt.locale.RuRU'
            ]
        },
        // test sporadically failed couple of times in IE9, perhaps because the callback of `requireOk`
        // was called before the locale has been applied. Waiting some time to give the locale time to apply
        { waitFor : 100 }, 
        function () {
            var as = t.beginAsync();

            Ext.onReady(function() {
                t.endAsync(as);
    
                var col = new Gnt.column.PercentDone();
    
                t.is(col.L('text'), '% завершения', 'locale is correct');
    
                col = new Gnt.column.StartDate();
    
                t.is(col.L('text'), 'Начало', 'locale is correct');
    
                col = new Gnt.column.EndDate();
    
                t.is(col.L('text'), 'Конец', 'locale is correct');
            });
        }
    );
});
