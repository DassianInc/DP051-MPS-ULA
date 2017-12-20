StartTest(function(t) {

    // In this test we'll start with all child nodes of root collapsed 
    // we'll also set a height of gantt to small value, so the vertical scroller will appear
    // then we'll scroll to bottom at max, and expand the bottom node
    // vertical scroll position should remain the same (just some new rows should appear at the bottom)
    // there's a bug in extjs buffering scroller that may cause reseting of vertical scrolling position to 0
    
    // then we'll scroll to bottom again, and collapse the same row
    // now scrolling positiion should be restored to the same value it has after initial scrolling to bottom
    // again, there's a bug in extjs buffering, that may cause the position to be set to 0
    
    var generateTaskData = function() {
        var arr = [],
            i, j, k,
            cn, cn2,
            dt = new Date(2010, 0, 5);
            
        var counter     = 0;

        for (var i = 1; i <= 10; i++) {
            cn = [];
            for (j = 1; j <= 10; j++) {
                cn.push({
                    Id          : "child" + i + '/' + j,
                    Name        : 'Child task ' + String(i) + ' / ' + String(j),
                    StartDate   : dt,
                    EndDate     : Ext.Date.add(dt, Ext.Date.DAY, 2),
                    leaf        : true
                });
            }
            arr.push({  
                Id          : "root" + i,
                Name        : 'Root task #' + i,
                StartDate   : new Date(2010, 0, 5),
                EndDate     : dt,
                children    : cn,
                expanded    : false
            });
        }

        return arr;
    };


    var taskStore = Ext.create("Gnt.data.TaskStore", {
        // sorting slow downs the initial loading/rendering time for big trees 
        sortOnLoad  : false,
        proxy      : 'memory',
        root       : {
            expanded : true,
            children : generateTaskData(1000)
        }
    });

    var gantt = t.getGantt({
        taskStore   : taskStore,
        width       : 400,
        height      : 200,
        columns: [
            {
                xtype       : 'treecolumn',
                header      : 'Tasks',
                sortable    : true,
                dataIndex   : 'Name',
                width       : 150
            }
        ],
        plugins : 'bufferedrenderer'
    });
    
    var lockedView          = gantt.lockedGrid.getView()
    var schedulingView      = gantt.getSchedulingView()
    var bottomScroll
    
    var row10               = taskStore.getNodeById('root10')
    var row1010             = taskStore.getNodeById('child10/10')
    
    var row10Box
    var el
    
    t.chain(
        {
            waitFor : 'selector',
            args    : '.sch-ganttview'
        },
        // it seems shortly after initial rendering, the "scrollTop" position of the buffered schedulingView will be reset to 0
        // need to wait some time before modifiying it
        { waitFor     : 300 },
        function (next) {
            el                  = schedulingView.el;
            
            // scrolling with additional 300ms delay after scroll
            bottomScroll        = t.scrollVerticallyTo(el, el.dom.scrollHeight, 300, next);
        },
        // processing of scrolling is async, need to wait again
        { waitFor     : 300 },
        function (next) {
            row10Box            = Ext.fly(schedulingView.getNode(row10)).getBox()
            
            row10.expand()
            
            next()
        },
        // processing of tree structure is buffered, need to wait
        { waitFor     : 300 },
        function (next) {
            t.isnt(el.dom.scrollTop, 0, 'Vertical scroll position has not been reset to 0')
            
            t.isApprox(el.dom.scrollTop, bottomScroll, (row10Box.bottom - row10Box.top), 'Scroll top position of the scheduling view hasnt change')
            
            // fix for #1291 breaks this test
//            t.isDeeply(row10Box, Ext.fly(schedulingView.getNode(row10)).getBox(), 'The box of 10th row is still the same (row did not move anywhere)')
            
            // scroll to bottom again, 300ms delay
            t.scrollVerticallyTo(el, el.dom.scrollHeight, 300, next)
        },
        function (next) {
            // fix for #1291 breaks this test
//            t.isDeeply(row10Box, Ext.fly(schedulingView.getNode(row1010)).getBox(), '10/10 row is now at the position of 10 row')
            
            t.isnt(el.dom.scrollTop, 0, 'Vertical scroll position has not been reset to 0')
            
            row10.collapse()
            
            next()
        },
        // processing of tree structure is buffered, need to wait
        { waitFor     : 300 },
        function (next) {
            // fix for #1291 breaks this test
//            t.isDeeply(row10Box, Ext.fly(schedulingView.getNode(row10)).getBox(), '10row returned to its original position')
            
            // http://www.sencha.com/forum/showthread.php?291586-5.0.1-Incorrect-scroll-position-when-using-buffered-rendering&p=1064955#post1064955
            t.todo(function (t) {
                t.isApprox(el.dom.scrollTop, bottomScroll, (row10Box.bottom - row10Box.top), 'Vertical scroll position has not been restored')
            })
            
            next()
        }
    )

    gantt.render(Ext.getBody());
})    

