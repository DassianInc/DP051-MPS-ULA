StartTest(function(t) {
    // see https://www.assembla.com/spaces/bryntum/tickets/416
    
    // misalignment is caused by the "parentTaskOffset" compensation in the Gnt.view.Gantt
    
    // configure the gantt, that
    // 1) there's a vertical scroll
    // 2) that the viewport end date comes on the middle of some long-lasting parent task
    var gantt           = t.getGantt({
        height          : 200,
        endDate         : new Date(2010, 1, 8),
        renderTo        : Ext.getBody(),
        
        // enable column lines, which may cause a misalignment of header
        columnLines     : true,
        
        width           : 400,
        lockedGridConfig    : {
            width       : 150
        }
    });
    
    var schedulingView = gantt.getSchedulingView();
    
    t.chain(
        { waitForRowsVisible : gantt },
        function (next) {
            var el = schedulingView.el;
            
            // this is the root cause of the misalignment - the scrollWidth of the view element is bigger than the <table> width
            // because some elements exceed the table
            t.is(el.dom.scrollWidth, el.child('.x-grid-item-container').dom.clientWidth, 'Nothing is exceeding the table')
    
            // scrolling the scheduling view to right-most position
            el.dom.scrollLeft    = el.dom.scrollWidth;
            
            next()
        },
        {
            waitFor     : function () {
                // mathing within 1px threshhold
                return schedulingView.el.child('.x-grid-item-container').getRight() - schedulingView.headerCt.el.down('table').getRight() < 2;
            },
            desc : 'No misalignment'
        }
    );
});
