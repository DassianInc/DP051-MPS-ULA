StartTest(function (t) {

    t.it('Should render weekend elements if highlightWeekends is true', function(t){
        var g = t.getGantt({
            viewPreset          : 'weekAndDayLetter',
            renderTo            : Ext.getBody(),
            highlightWeekends   : true,
            weekendsAreWorkdays : false
        });

        t.waitForSelector('.sch-zone', function() {
            g.destroy();
        })
    })

    t.it('Should not render weekend elements if highlightWeekends is false', function(t){
        var g = t.getGantt({
            viewPreset          : 'weekAndDayLetter',
            renderTo            : Ext.getBody(),
            highlightWeekends   : false
        });

        t.waitFor(100, function() {
            t.selectorNotExists('.sch-zone');
        })
    })
})
