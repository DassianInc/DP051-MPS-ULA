StartTest(function(t) {

    // here we check how DragCreator class respect weekends

    var g   = t.getGantt2({
        startDate           : new Date(2010, 1, 1),
        enableDragCreation  : true
    });

    g.render(Ext.getBody());

    t.waitForRowsVisible(g.normalGrid, function() {

        t.chain(
            function (next) {
                t.diag('Both end dates is in non-working period');

                g.getRootNode().insertChild(0, { leaf : true });

                var startXY = t.getFirstCell(g.normalGrid).getXY();
                startXY[0]  = startXY[0] + 2;
                startXY[1]  = startXY[1] + 2;

                t.dragBy(startXY, [150, 0], function() {
                    t.is(g.getRootNode().firstChild.getStartDate(), new Date(2010, 1, 1), 'StartDate read ok.');
                    t.is(g.getRootNode().firstChild.getEndDate(), new Date(2010, 1, 6), 'EndDate read ok.');

                    next();
                });
            },

            function (next) {
                t.diag('Both start and end dates are in non-working period');

                g.getRootNode().insertChild(0, { leaf : true });

                var startXY = t.getFirstCell(g.normalGrid).getXY();
                startXY[0]  += 2;
                startXY[1]  += 2;

                var startX  = g.getSchedulingView().getXFromDate(new Date(2010, 1, 6), true);
                var endX    = g.getSchedulingView().getXFromDate(new Date(2010, 1, 7), true);
                var shiftX  = endX - startX;

                startXY[0]  += startX;

                t.dragBy(startXY, [shiftX, 0], function() {
                    t.is(g.getRootNode().firstChild.getStartDate(), new Date(2010, 1, 6), 'StartDate read ok.');
                    t.is(g.getRootNode().firstChild.getEndDate(), new Date(2010, 1, 6), 'EndDate read ok.');

                    next();
                });
            }
        );

    });
});
