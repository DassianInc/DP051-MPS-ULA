StartTest(function(t) {

    t.it('Widths should match for gantt + histogram', function(t) {
        t.waitForRowsVisible(function() {
            var gantt       = t.cq1('ganttpanel');
            var histogram   = t.cq1('resourcehistogram');

            t.is(gantt.getWidth(), histogram.getWidth(), 'Width match')
            t.is(gantt.lockedGrid.getWidth(), histogram.lockedGrid.getWidth(), 'Locked width match')
            t.is(gantt.normalGrid.getWidth(), histogram.normalGrid.getWidth(), 'Normal width match')

        })
    })
});


