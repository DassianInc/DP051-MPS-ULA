StartTest(function (t) {
    t.diag("Test if the scrollable element is scrolled during drag drop operations (horizontally)");
    var gantt = t.getGantt({ deferRowRender : false, height: 200, width: 300, columns : [{ xtype : 'treecolumn' }] });
    
    gantt.render(Ext.getBody());
    
    var record = gantt.taskStore.getRootNode().childNodes[1];
    
    record.setStartDate(gantt.getStart());
    record.set({
        leaf : true
    });


    var viewEl = gantt.getSchedulingView().el;
       
    t.waitForEventsToRender(gantt, start);

    function start() {
        var firstEl = gantt.getSchedulingView().getElementFromEventRecord(record),
            xy = firstEl.getXY();
        xy[0] = xy[0] + 10;
        xy[1] = xy[1] + 5;

        t.isDeeply(viewEl.getScroll(), { left: 0, top: 0 }, 'Scroll initally 0');

        var distance = viewEl.getRight() - xy[0] - 5;

        t.dragBy(xy, [distance, 4], function () {
            t.waitForScrollLeftChange(viewEl, function (firstScrollValue) {
                t.isGreater(firstScrollValue, 0, 'Scrolled right direction');

                t.moveMouseBy([-distance, 0], function () {
                    t.waitForScrollLeftChange(viewEl, function (lastScrollValue) {
                        t.pass('Scrolled left direction');
                        t.mouseUp();
                    });
                });
            });
        }, null, null, true);
    }
})    
