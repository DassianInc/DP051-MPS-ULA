StartTest(function(t) {
    var calendar        = new Gnt.data.Calendar({
        data : [{
            Date: "2010-01-04",
            IsWorkingDay: false,
            Cls: 'foo-day'
        }]
    })
    
    var g = t.getGantt({ 
        renderTo : Ext.getBody(),
        startDate : new Date(2010, 0, 1),
        taskStore : t.getTaskStore({
            calendar : calendar
        })
    });

    t.chain(
        { waitFor : 'selector', args : '.foo-day' }, 
        
        function(next) {
            t.pass('foo-day found as a visualized calendar day');
            t.ok(calendar.isHoliday(new Date(2010, 0, 4)), 'Identified foo-day as a holiday');
        
            calendar.first().setDate(new Date(2010, 0, 5));
            calendar.first().setCls('bar-day');
            next()
        },

        { waitFor : 'selector', args : '.bar-day' }, 
        
        function(next) {
            t.notOk(calendar.isHoliday(new Date(2010, 0, 4)), 'Identified foo-day as a regular day');
            t.ok(calendar.isHoliday(new Date(2010, 0, 5)), 'Identified bar-day as a holiday');

            t.pass('bar-day found as a visualized calendar day');
            g.switchViewPreset('monthAndYear');
            next();
        },

        { waitFor : 'selectorNotFound', args : '.sch-zone' },
        
        function() {
            t.pass('Zones should not render in month-view');
        }
    );
})    
